import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { format } from 'date-fns'
import { Package2, Calendar, Clock, MapPin } from 'lucide-react'
import { OrderDetails, OrderItem, EventDetails } from '@/types'
import { Prisma } from '@prisma/client'

interface OrderFromDB {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: Prisma.JsonValue;
  orderDate: Date;
  eventDate: Date;
  total: number;
  eventDetails: Prisma.JsonValue;
  customerId: string | null;
}

export default async function CustomerOrdersPage({ params }: { params: { customerId: string } }) {
  const orders = await prisma.order.findMany({
    where: {
      customerId: params.customerId
    },
    orderBy: {
      orderDate: 'desc'
    }
  }) as unknown as OrderFromDB[];

  if (orders.length === 0) {
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
    <div className="container py-10">
      <h1 className="text-3xl font-bold">Your Orders</h1>
      
      {orders.map((order: OrderFromDB) => {
        const typedOrder: OrderDetails = {
          ...order,
          items: order.items as unknown as OrderItem[],
          eventDetails: order.eventDetails as unknown as EventDetails
        };
        return (
          <Card key={typedOrder.id} className="overflow-hidden">
            <CardHeader className="border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Order #{typedOrder.id}</p>
                  <CardTitle className="mt-1">
                    {typedOrder.items.find((item: OrderItem) => item.type === 'package')?.name}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Ordered on</p>
                  <p className="font-medium">{format(new Date(typedOrder.orderDate), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium">Event Date</p>
                    <p className="text-gray-600">{format(new Date(typedOrder.eventDate), 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium">Event Time</p>
                    <p className="text-gray-600">{typedOrder.eventDetails.eventStartTime} - {typedOrder.eventDetails.eventEndTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{typedOrder.eventDetails.eventLocation}</p>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {typedOrder.items.map((item: OrderItem) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} x {item.quantity}</span>
                      <span>${item.price.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${typedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <Button asChild variant="outline">
                    <Link href={`/customer/${params.customerId}/orders/${typedOrder.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 