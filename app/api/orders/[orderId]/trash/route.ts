import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function PUT(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    // Update the order status to trashed
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'trashed' }
    })

    // Revalidate the orders list
    revalidatePath('/api/orders')
    revalidatePath('/admin')

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error trashing order:', error)
    return NextResponse.json(
      { error: 'Failed to trash order' },
      { status: 500 }
    )
  }
} 