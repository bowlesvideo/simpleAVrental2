import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { format } from 'date-fns'
import { Package2, Calendar, Clock, MapPin, Building2, User, Mail, Phone, Receipt, ExternalLink } from 'lucide-react'
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
    paymentIntent?: string;
  };
}

export default async function OrderDetailsPage({ 
  params 
}: { 
  params: { customerId: string; orderId: string } 
}) {
  const orderDetails = await prisma.order.findUnique({
    where: {
      id: params.orderId
    }
  })

  if (!orderDetails) {
    notFound()
  }

  const parsedOrder: OrderDetails = {
    ...orderDetails,
    items: typeof orderDetails.items === 'string' ? JSON.parse(orderDetails.items) : orderDetails.items,
    eventDetails: typeof orderDetails.eventDetails === 'string' ? JSON.parse(orderDetails.eventDetails) : orderDetails.eventDetails
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order #{parsedOrder.id}</h1>
          <div className="mt-2 text-gray-600">
            Purchased on {format(new Date(parsedOrder.orderDate), 'MMMM d, yyyy')}
            {parsedOrder.eventDetails.paymentIntent && (
              <Button
                variant="link"
                size="sm"
                className="ml-4 text-blue-500 hover:text-blue-700"
                asChild
              >
                <Link 
                  href={`https://dashboard.stripe.com/payments/${parsedOrder.eventDetails.paymentIntent}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Payment
                </Link>
              </Button>
            )}
          </div>
        </div>
        <Link href="/customer/orders" className="text-blue-500 hover:text-blue-700">
          ← Back to Orders
        </Link>
      </div>

      <Card>
        <CardContent className="grid gap-8 pt-6">
          {/* Purchase Info */}
          <div>
            <h2 className="font-semibold text-lg mb-4">Purchase Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Receipt className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Purchase Date</p>
                    <p className="text-gray-600">
                      {format(new Date(parsedOrder.orderDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    {parsedOrder.eventDetails.paymentIntent && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        asChild
                      >
                        <Link 
                          href={`https://dashboard.stripe.com/payments/${parsedOrder.eventDetails.paymentIntent}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Stripe
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                      {format(new Date(parsedOrder.eventDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Event Time</p>
                    <p className="text-gray-600">
                      {parsedOrder.eventDetails.eventStartTime} - {parsedOrder.eventDetails.eventEndTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">
                      {parsedOrder.eventDetails.eventLocation}<br />
                      {parsedOrder.eventDetails.city}, {parsedOrder.eventDetails.state} {parsedOrder.eventDetails.zip}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Company</p>
                    <p className="text-gray-600">{parsedOrder.eventDetails.companyName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Name</p>
                    <p className="text-gray-600">{parsedOrder.eventDetails.customerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{parsedOrder.eventDetails.customerEmail}</p>
                  </div>
                </div>

                {parsedOrder.eventDetails.customerPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">{parsedOrder.eventDetails.customerPhone}</p>
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
                {parsedOrder.items.map((item) => (
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
                    <span>${parsedOrder.total.toLocaleString()}</span>
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