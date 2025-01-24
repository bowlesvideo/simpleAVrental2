export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface EventDetails {
  eventLocation: string
  eventStartTime?: string
  eventEndTime?: string
  contactName?: string
  contactEmail?: string
  companyName?: string
}

interface OrderWithDetails {
  id: string
  orderDate: Date
  eventDate: Date
  total: number
  status: string
  items: any
  eventDetails: EventDetails
}

async function getCustomerOrders(email: string): Promise<OrderWithDetails[]> {
  const orders = await prisma.order.findMany({
    where: {
      eventDetails: {
        path: ['customerEmail'],
        equals: email
      }
    },
    orderBy: {
      orderDate: 'desc'
    }
  })
  
  return orders.map(order => ({
    ...order,
    eventDetails: order.eventDetails as unknown as EventDetails,
    items: order.items as any
  }))
}

export default async function CustomerOrdersPage() {
  const cookieStore = cookies()
  const authEmail = cookieStore.get('authEmail')?.value
  
  if (!authEmail) {
    redirect('/login')
  }

  const orders = await getCustomerOrders(authEmail)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const eventDetails = order.eventDetails
            return (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle>
                    Order #{order.id.slice(-6)}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      {format(new Date(order.orderDate), 'MMM d, yyyy')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div>
                      <span className="font-medium">Event Date:</span>{' '}
                      {format(new Date(order.eventDate), 'MMM d, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>{' '}
                      {eventDetails.eventLocation}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{' '}
                      <span className="capitalize">{order.status}</span>
                    </div>
                    <div>
                      <span className="font-medium">Total:</span>{' '}
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 