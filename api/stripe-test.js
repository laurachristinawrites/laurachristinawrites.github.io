import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const account = await stripe.accounts.retrieve();

    res.status(200).json({
      success: true,
      message: 'Stripe-Verbindung funktioniert!',
      account_id: account.id
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Stripe-Verbindung fehlgeschlagen.'
    });
  }
}
