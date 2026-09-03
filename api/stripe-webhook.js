import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const event = req.body;

    console.log('Stripe Webhook Event:', event.type);

    // Wir reagieren nur auf erfolgreiche Zahlungen
    if (event.type !== 'payment_intent.succeeded') {
      return res.status(200).json({
        success: true,
        message: 'Event ignoriert'
      });
    }

    const paymentIntent = event.data.object;

    // --------------------------------------------------
    // 1. Doppelte Verarbeitung verhindern
    // --------------------------------------------------

    const { data: existingOrder, error: existingOrderError } =
      await supabase
        .from('orders')
        .select('order_id')
        .eq(
          'stripe_payment_intent_id',
          paymentIntent.id
        )
        .maybeSingle();

    if (existingOrderError) {
      throw existingOrderError;
    }

    if (existingOrder) {
      console.log(
        'Bestellung existiert bereits:',
        existingOrder.order_id
      );

      return res.status(200).json({
        success: true,
        message: 'Bestellung bereits vorhanden'
      });
    }

    // --------------------------------------------------
    // 2. Checkout Session über die Order Reference finden
    // --------------------------------------------------

    const checkoutSessionId =
      paymentIntent.payment_details?.order_reference;

    if (!checkoutSessionId) {
      throw new Error(
        'Keine Checkout Session ID gefunden'
      );
    }

    const checkoutSession =
      await stripe.checkout.sessions.retrieve(
        checkoutSessionId
      );

    // --------------------------------------------------
    // 3. Produktinformationen aus Metadata holen
    // --------------------------------------------------

    const productId =
      checkoutSession.metadata?.product_id;

    const quantity = Number(
      checkoutSession.metadata?.quantity || 1
    );

    if (!productId) {
      throw new Error(
        'Keine product_id in Checkout Session Metadata'
      );
    }

    // --------------------------------------------------
    // 4. Stripe Customer laden
    // --------------------------------------------------

    let customerData = null;

    if (checkoutSession.customer) {
      customerData = await stripe.customers.retrieve(
        checkoutSession.customer
      );
    }

    const customerEmail =
      checkoutSession.customer_details?.email ||
      customerData?.email;

    const customerName =
      checkoutSession.customer_details?.name ||
      customerData?.name ||
      '';

    if (!customerEmail) {
      throw new Error(
        'Keine Kunden-E-Mail gefunden'
      );
    }

    // Vor- und Nachname trennen
    const nameParts = customerName.trim().split(' ');

    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ') || '';

    if (!firstName || !lastName) {
      throw new Error(
        'Vor- oder Nachname konnte nicht ermittelt werden'
      );
    }

    // --------------------------------------------------
    // 5. Customer in Supabase suchen
    // --------------------------------------------------

    let customerId;

    const { data: existingCustomer, error: customerSearchError } =
      await supabase
        .from('customer')
        .select('customer_id')
        .eq('email', customerEmail)
        .maybeSingle();

    if (customerSearchError) {
      throw customerSearchError;
    }

    if (existingCustomer) {
      customerId = existingCustomer.customer_id;

      // Kundendaten aktualisieren
      const { error: customerUpdateError } =
        await supabase
          .from('customer')
          .update({
            first_name: firstName,
            last_name: lastName
          })
          .eq('customer_id', customerId);

      if (customerUpdateError) {
        throw customerUpdateError;
      }

    } else {
      // Neuen Customer anlegen
      const { data: newCustomer, error: customerInsertError } =
        await supabase
          .from('customer')
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: customerEmail
          })
          .select('customer_id')
          .single();

      if (customerInsertError) {
        throw customerInsertError;
      }

      customerId = newCustomer.customer_id;
    }

    // --------------------------------------------------
    // 6. Produkt aus Supabase laden
    // --------------------------------------------------

    const { data: product, error: productError } =
      await supabase
        .from('product')
        .select(
          'product_id, product_name, price, currency'
        )
        .eq('product_id', productId)
        .single();

    if (productError || !product) {
      throw new Error(
        'Produkt nicht gefunden'
      );
    }

    // --------------------------------------------------
    // 7. Bestellung anlegen
    // --------------------------------------------------

    const totalAmount =
      Number(product.price) * quantity;

    const { data: order, error: orderError } =
      await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          order_status: 'paid',
          total_amount: totalAmount,
          currency: product.currency,
          stripe_payment_intent_id: paymentIntent.id
        })
        .select('order_id')
        .single();

    if (orderError) {
      throw orderError;
    }

    // --------------------------------------------------
    // 8. Lieferadresse aus Stripe übernehmen
    // --------------------------------------------------

    const shipping =
      paymentIntent.shipping ||
      checkoutSession.shipping_details;

    if (!shipping?.address) {
      throw new Error(
        'Keine Lieferadresse gefunden'
      );
    }

    const address = shipping.address;

    // Straße und Hausnummer trennen
    const streetLine = address.line1 || '';
    const streetMatch =
      streetLine.match(/^(.+?)\s+(\d+\S*)$/);

    const street =
      streetMatch?.[1] || streetLine;

    const houseNumber =
      streetMatch?.[2] || '';

    const { error: addressError } =
      await supabase
        .from('order_address')
        .insert({
          order_id: order.order_id,
          first_name: firstName,
          last_name: lastName,
          street: street,
          house_number: houseNumber,
          postal_code: address.postal_code || '',
          city: address.city || '',
          country: address.country || 'AT'
        });

    if (addressError) {
      throw addressError;
    }

    // --------------------------------------------------
    // 9. Produkt zur Bestellung hinzufügen
    // --------------------------------------------------

    const { error: orderProductError } =
      await supabase
        .from('order_product')
        .insert({
          order_id: order.order_id,
          product_id: product.product_id,
          quantity: quantity,
          unit_price: product.price
        });

    if (orderProductError) {
      throw orderProductError;
    }

    console.log(
      'Bestellung erfolgreich gespeichert:',
      order.order_id
    );

    return res.status(200).json({
      success: true,
      message: 'Bestellung erfolgreich gespeichert',
      order_id: order.order_id
    });

  } catch (error) {
    console.error(
      'Stripe Webhook Fehler:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Webhook Fehler'
    });
  }
}
