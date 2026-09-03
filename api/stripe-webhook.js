import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    console.log('Stripe Webhook empfangen');

    console.log('Event:', req.body);

    return res.status(200).json({
      success: true,
      message: 'Webhook empfangen'
    });

  } catch (error) {
    console.error('Webhook Fehler:', error);

    return res.status(500).json({
      success: false,
      message: 'Webhook Fehler'
    });
  }
}
