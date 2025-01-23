'use server'

import Stripe from 'stripe';
import { prisma } from '../lib/prisma';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

async function testWebhook() {
  try {
    // Create a test order
    const order = await prisma.order.create({
      data: {
        id: `ORD${new Date().toISOString().slice(2,10).replace(/-/g,'')}-001`,
        eventDate: new Date(),
        total: 100,
        status: 'pending',
        items: [],
        eventDetails: {}
      }
    });

    console.log('Created test order:', order);

    // Create a test event
    const event = {
      id: 'evt_test_webhook',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test',
          metadata: {
            orderId: order.id
          }
        }
      }
    };

    console.log('Test event created:', event);
    
    return { success: true, order, event };
  } catch (error) {
    console.error('Error in test webhook:', error);
    return { success: false, error };
  }
}

export { testWebhook } 