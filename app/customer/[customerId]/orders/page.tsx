import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { format } from 'date-fns'
import { Package2, Calendar, Clock, MapPin } from 'lucide-react'

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'package' | 'addon';
}

interface OrderDetails {
  id: string;
  orderDate: Date;
  eventDate: Date;
  total: number;
  status: string;
  items: OrderItem[];
  eventDetails: {
    eventStartTime: string;
    eventEndTime: string;
    eventLocation: string;
    companyName: string;
    contactName: string;
    contactEmail: string;
  };
}

export default async function CustomerOrdersPage({ params }: { params: { customerId: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.customerId },
    include: {
      orders: {
        orderBy: { orderDate: 'desc' }
      }
    }
  })

  if (!customer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We couldn't find your customer account. Please try logging in again.</p>
          <Button asChild className="mt-4">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (customer.orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Orders Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You haven't placed any orders yet.</p>
          <Button asChild className="mt-4">
            <Link href="/">Browse Packages</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Orders</h1>
      
      {customer.orders.map((order: OrderDetails) => (
        <Card key={order.id} className="overflow-hidden">
          <CardHeader className="border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Order #{order.id}</p>
                <CardTitle className="mt-1">
                  {order.items.find(item => item.type === 'package')?.name}
                </CardTitle>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Ordered on</p>
                <p className="font-medium">{format(new Date(order.orderDate), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Event Date</p>
                    <p className="text-gray-600">{format(new Date(order.eventDate), 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Event Time</p>
                    <p className="text-gray-600">{order.eventDetails.eventStartTime} - {order.eventDetails.eventEndTime}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{order.eventDetails.eventLocation}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                        </span>
                        <span>${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-right">
                  <Button asChild variant="outline">
                    <Link href={`/customer/${customer.id}/orders/${order.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 