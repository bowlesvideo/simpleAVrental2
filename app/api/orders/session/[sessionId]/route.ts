import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Get the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(params.sessionId)
    
    // Get the order from our database using metadata
    const order = await prisma.order.findFirst({
      where: {
        id: session.metadata?.orderId
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
} 