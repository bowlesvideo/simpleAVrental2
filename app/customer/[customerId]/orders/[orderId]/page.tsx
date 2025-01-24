import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { format } from 'date-fns'
import { Package2, Calendar, Clock, MapPin, Building2, User, Mail, Phone } from 'lucide-react'
import { notFound } from 'next/navigation'

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
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    city: string;
    state: string;
    zip: string;
  };
}

export default async function OrderDetailsPage({ 
  params 
}: { 
  params: { customerId: string; orderId: string } 
}) {
  const order = await prisma.order.findFirst({
    where: { 
      AND: [
        { id: params.orderId },
        { customerId: params.customerId }
      ]
    }
  })

  if (!order) {
    notFound()
  }

  const orderDetails: OrderDetails = order as unknown as OrderDetails

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <Button asChild variant="outline">
          <Link href={`/customer/${params.customerId}/orders`}>
            Back to Orders
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Order #{orderDetails.id}</p>
              <CardTitle className="mt-1">
                {orderDetails.items.find(item => item.type === 'package')?.name}
              </CardTitle>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Ordered on</p>
              <p className="font-medium">
                {format(new Date(orderDetails.orderDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-8 pt-6">
          {/* Event Details */}
          <div>
            <h2 className="font-semibold text-lg mb-4">Event Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Event Date</p>
                    <p className="text-gray-600">
                      {format(new Date(orderDetails.eventDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Event Time</p>
                    <p className="text-gray-600">
                      {orderDetails.eventDetails.eventStartTime} - {orderDetails.eventDetails.eventEndTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">
                      {orderDetails.eventDetails.eventLocation}<br />
                      {orderDetails.eventDetails.city}, {orderDetails.eventDetails.state} {orderDetails.eventDetails.zip}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Company</p>
                    <p className="text-gray-600">{orderDetails.eventDetails.companyName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Name</p>
                    <p className="text-gray-600">{orderDetails.eventDetails.customerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{orderDetails.eventDetails.customerEmail}</p>
                  </div>
                </div>

                {orderDetails.eventDetails.customerPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">{orderDetails.eventDetails.customerPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                {orderDetails.items.map((item) => (
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
                    <span>${orderDetails.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 