import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPackageBySlug, getAddOnByValue } from '@/lib/rental-config'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error('NEXT_PUBLIC_BASE_URL is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      )
    }

    const lineItems = items.map((item: { id: string; quantity: number; type: 'package' | 'addon'; price: number }) => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.type === 'package' ? 'Package' : 'Add-on'}: ${item.id} (50% Deposit)`,
          },
          unit_amount: item.price, // Price is already in cents and halved from the client
        },
        quantity: item.quantity,
      }
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      billing_address_collection: 'required',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        items: JSON.stringify(items)
      }
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error in create-checkout-session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 