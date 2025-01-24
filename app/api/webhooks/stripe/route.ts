import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { generateOrderId } from '@/lib/utils';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
});

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found on request' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Webhook event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Parse the items from metadata
        const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
        const orderId = generateOrderId();

        // Create order in database using our generated ID
        const order = await prisma.order.create({
          data: {
            id: orderId,
            orderDate: new Date(),
            eventDate: new Date(), // This should be updated with actual event date from metadata
            total: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
            status: 'Deposit Paid',
            items: JSON.stringify(items),
            eventDetails: JSON.stringify({
              paymentIntent: session.payment_intent,
              customerEmail: session.customer_details?.email,
              customerName: session.customer_details?.name,
            })
          }
        });

        console.log('Order created:', order);
        break;
      }
      // Add other event types as needed
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 