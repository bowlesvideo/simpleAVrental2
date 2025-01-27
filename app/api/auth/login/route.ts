import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createHash, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

// Generate a secure token
function generateToken() {
  return randomBytes(32).toString('hex')
}

// Hash the token for storage
function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    console.log('Searching for orders with email:', email)

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email },
      include: { orders: true }
    })

    if (!customer && (await prisma.order.findFirst({
      where: {
        eventDetails: {
          path: ['contactEmail'],
          equals: email
        }
      }
    }))) {
      // If customer doesn't exist but has orders, create customer
      customer = await prisma.customer.create({
        data: { email },
        include: { orders: true }
      })

      // Link existing orders to customer
      await prisma.order.updateMany({
        where: {
          eventDetails: {
            path: ['contactEmail'],
            equals: email
          }
        },
        data: {
          customerId: customer.id
        }
      })
    }

    // If no customer and no orders found, return an error
    if (!customer || customer.orders.length === 0) {
      return NextResponse.json(
        { error: 'No orders found for this email' },
        { status: 404 }
      )
    }

    // Generate token and expiry
    const token = generateToken()
    const hashedToken = hashToken(token)
    const expires = new Date(Date.now() + 1000 * 60 * 15) // 15 minutes

    // Store the token in the database using raw SQL (temporary solution)
    await prisma.$executeRaw`
      INSERT INTO "AuthToken" (email, token, expires, "createdAt")
      VALUES (${email}, ${hashedToken}, ${expires}, NOW())
      ON CONFLICT (email) 
      DO UPDATE SET token = ${hashedToken}, expires = ${expires}
    `

    // Create magic link with customer ID
    const magicLink = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}&customerId=${customer.id}`

    // Send email with magic link
    await resend.emails.send({
      from: 'VideoPRO <orders@govideopro.com>',
      to: [email],
      subject: 'Your Login Link',
      html: `
        <h2>Welcome to VideoPRO!</h2>\n
        <p>Click the link below to view your orders. This link will expire in 15 minutes.</p>\n
        <p><a href="${magicLink}">View My Orders</a></p>
      `
    })

    return NextResponse.json({ 
      success: true,
      message: 'Magic link sent successfully'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to send login link' },
      { status: 500 }
    )
  }
} 