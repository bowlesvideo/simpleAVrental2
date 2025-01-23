const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function createTestOrder() {
  try {
    // Get the meeting package from the database
    const rentalPackage = await prisma.package.findFirst({
      where: {
        name: 'Meeting Package'
      }
    });

    if (!rentalPackage) {
      throw new Error('Meeting Package not found');
    }

    // Get the test customer
    const user = await prisma.user.findFirst({
      where: {
        email: 'customer@example.com'
      }
    });

    if (!user) {
      throw new Error('Test customer not found');
    }

    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: rentalPackage.name,
              description: rentalPackage.description || undefined,
            },
            unit_amount: Math.round(rentalPackage.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/confirmation?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/cancel',
      metadata: {
        userId: user.id,
        packageId: rentalPackage.id,
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

    const payload = JSON.stringify(event);
    const timestamp = Math.floor(Date.now() / 1000);
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signedPayload = `${timestamp}.${payload}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Make request to webhook endpoint
    const response = await fetch('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': `t=${timestamp},v1=${signature}`
      },
      body: payload
    });

    console.log('Webhook response:', response.status);
    if (response.status !== 200) {
      const text = await response.text();
      console.error('Webhook error:', text);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder(); 