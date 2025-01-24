import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Get email from session cookie
    const cookieStore = cookies()
    const email = cookieStore.get('session')?.value

    if (!email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch orders where the customer email matches
    const orders = await prisma.order.findMany({
      where: {
        'eventDetails': {
          path: ['contactEmail'],
          equals: email
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    })

    // Parse the JSON fields
    const parsedOrders = orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      eventDetails: typeof order.eventDetails === 'string' ? JSON.parse(order.eventDetails) : order.eventDetails
    }))

    return NextResponse.json({ orders: parsedOrders })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
} 