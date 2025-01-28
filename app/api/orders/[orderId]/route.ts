import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: params.orderId
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    // First check if the order exists and is trashed
    const order = await prisma.order.findUnique({
      where: { id: params.orderId }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'trashed') {
      return NextResponse.json(
        { error: 'Can only delete trashed orders' },
        { status: 400 }
      );
    }

    // Delete the order
    await prisma.order.delete({
      where: { id: params.orderId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
} 