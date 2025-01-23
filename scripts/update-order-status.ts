import { prisma } from '../lib/prisma'

async function updateOrderStatus() {
  try {
    const result = await prisma.order.updateMany({
      where: {
        status: 'paid'
      },
      data: {
        status: 'Deposit Paid'
      }
    })

    console.log(`Successfully updated ${result.count} orders from 'paid' to 'Deposit Paid'`)
  } catch (error) {
    console.error('Error updating order status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateOrderStatus() 