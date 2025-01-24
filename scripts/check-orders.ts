import { prisma } from '../lib/prisma'

async function checkOrders() {
  try {
    const email = 'stephen@bowlescreative.com'
    console.log(`\nChecking orders for email: ${email}`)
    
    // Get all non-trashed orders
    const orders = await prisma.order.findMany({
      where: {
        NOT: {
          status: 'trashed'
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    })

    // Filter orders by email in eventDetails
    const filteredOrders = orders.filter(order => {
      const details = typeof order.eventDetails === 'string'
        ? JSON.parse(order.eventDetails)
        : order.eventDetails
      
      return details.customerEmail === email || details.contactEmail === email
    })

    console.log('\nFound matching orders:', filteredOrders.length)
    filteredOrders.forEach(order => {
      const details = typeof order.eventDetails === 'string'
        ? JSON.parse(order.eventDetails)
        : order.eventDetails
        
      console.log('\nOrder:', {
        id: order.id,
        date: order.orderDate,
        status: order.status,
        email: details.customerEmail || details.contactEmail,
        emailField: details.customerEmail ? 'customerEmail' : 'contactEmail'
      })
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrders() 