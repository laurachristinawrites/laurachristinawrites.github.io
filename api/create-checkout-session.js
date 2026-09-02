import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const allowedOrigin = 'https://laurachristinawrites.github.io';

export default async function handler(req, res) {

  // CORS
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'product_id fehlt'
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Ungültige Menge'
      });
    }

    // Produkt aus Supabase laden
    const { data: product, error: productError } = await supabase
      .from('product')
      .select(
        'product_id, product_name, description, price, currency'
      )
      .eq('product_id', product_id)
      .eq('active', true)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: 'Produkt nicht gefunden'
      });
    }

    // Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),

            product_data: {
              name: product.product_name,
              description: product.description || undefined
            },

            unit_amount: Math.round(
              Number(product.price) * 100
            )
          },

          quantity
        }
      ],

      success_url:
        'https://laurachristinawrites.github.io/?success=true',

      cancel_url:
        'https://laurachristinawrites.github.io/?cancelled=true',

      metadata: {
        product_id: product.product_id
      }
    });

    return res.status(200).json({
      success: true,
      checkout_url: session.url
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Checkout konnte nicht erstellt werden'
    });
  }
}
