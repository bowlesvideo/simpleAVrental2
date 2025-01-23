import Stripe from 'stripe';
import { prisma } from '../lib/prisma';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

async function createTestOrder() {
  try {
    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sample Package', // Placeholder name
              description: 'Sample Description', // Placeholder description
            },
            unit_amount: 1000, // Placeholder amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/confirmation?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/cancel',
      metadata: {
        userId: 'sampleUserId', // Placeholder user ID
        packageId: 'samplePackageId', // Placeholder package ID
        addOns: '[]'
      }
    });

    console.log('Checkout session created:', session.id);
    
    // Simulate successful payment by triggering webhook
    console.log('Simulating webhook event...');
    const event = {
      id: 'evt_test',
      type: 'checkout.session.completed',
      data: {
        object: session
      }
    };

    // Make request to webhook endpoint
    const response = await fetch('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 'test_signature'
      },
      body: JSON.stringify(event)
    });

    console.log('Webhook response:', response.status);

  } catch (error) {
    console.error('Error:', error);
  }
}

createTestOrder(); 