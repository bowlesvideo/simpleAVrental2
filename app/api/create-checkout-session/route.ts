import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPackageBySlug, getAddOnByValue } from '@/lib/rental-config'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL is not set')
}

// Initialize Stripe with live mode configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

// Log the Stripe mode for debugging
console.log('Stripe Mode:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test')

// Generate order ID
function generateOrderId() {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORD${year}${month}${day}-${random}`
}

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

    // Generate order ID for this session
    const orderId = generateOrderId()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      billing_address_collection: 'required',
      success_url: 'https://govideopro.com/confirmation?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://govideopro.com/cart',
      metadata: {
        orderId,
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