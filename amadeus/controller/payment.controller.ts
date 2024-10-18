import axios from 'axios';
import Stripe from 'stripe';
import { getAccessToken } from '../utils/amadeus.auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia', // Adjust based on your version
});

export const createPaymentIntent = async (req: any, res: any) => {
  try {
    // Destructure the amount from the request body
    const { amount, offerId, currency } = req.body;

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: `${currency}`,
      automatic_payment_methods: { enabled: true },
    });

    // Send back the client secret from Stripe
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Internal Error:', error);
    return res.status(500).json({ error: 'An error occurred while creating the payment intent. Please try again later.' });
  }
};