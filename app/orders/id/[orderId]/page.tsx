'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { PackageFeature } from '@/lib/types'
import Image from 'next/image'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'package' | 'addon'
  keyFeatures?: PackageFeature[]
}

interface EventDetails {
  eventStartTime: string
  eventEndTime: string
  eventLocation: string
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  street: string
  city: string
  state: string
  zip: string
}

interface Order {
  id: string
  orderDate: string
  eventDate: string
  total: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  items: OrderItem[]
  eventDetails: EventDetails
}

export default function OrderPage({ params }: { params: { orderId: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.orderId}`)
        const data = await response.json()
        
        // Parse the JSON strings into objects
        const parsedOrder = {
          ...data,
          items: JSON.parse(data.items),
          eventDetails: JSON.parse(data.eventDetails)
        }
        
        setOrder(parsedOrder)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [params.orderId])

  if (isLoading || !order) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  const packages = order.items.filter(item => item.type === 'package')
  const addons = order.items.filter(item => item.type === 'addon')

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Orders
          </Button>
          <h1 className="text-4xl font-bold">Order {order.id}</h1>
        </div>
        <Button onClick={() => window.print()} className="print:hidden">
          Print Order
        </Button>
      </div>

      <div className="space-y-8">
        {/* Company Logo and Header */}
        <div className="flex justify-between items-start">
          <div>
            <Image
              src="/images/videopro_logo_blue.png"
              alt="Office Video Pro Logo"
              width={120}
              height={40}
              priority
              className="mb-1"
            />
            <p className="text-gray-600">Professional Video Services</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Order Date: {format(new Date(order.orderDate), 'MMMM d, yyyy')}</p>
            <p className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium capitalize
              ${order.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              {order.status}
            </p>
          </div>
        </div>

        {/* Event and Contact Details */}
        <div className="grid grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Date:</span> {format(new Date(order.eventDate), 'MMMM d, yyyy')}</p>
                <p><span className="font-medium">Time:</span> {order.eventDetails.eventStartTime} to {order.eventDetails.eventEndTime}</p>
                <p><span className="font-medium">Location:</span> {order.eventDetails.eventLocation}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Company:</span> {order.eventDetails.companyName}</p>
                <p><span className="font-medium">Contact:</span> {order.eventDetails.contactName}</p>
                <p><span className="font-medium">Email:</span> {order.eventDetails.contactEmail}</p>
                <p><span className="font-medium">Phone:</span> {order.eventDetails.contactPhone}</p>
                <p><span className="font-medium">Address:</span><br />
                  {order.eventDetails.street}<br />
                  {order.eventDetails.city}, {order.eventDetails.state} {order.eventDetails.zip}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            
            {/* Packages */}
            {packages.map((item) => (
              <div key={item.id} className="mb-6 pb-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-[#0095ff]">{item.name}</h4>
                    {item.keyFeatures && (
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        {item.keyFeatures.map((feature, index) => (
                          <li key={index}>• {feature.value}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}

            {/* Add-ons */}
            {addons.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Add-ons</h4>
                {addons.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>50% Payment Due Today:</span>
                <span>${(order.total / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>50% Due After Completion:</span>
                <span>${(order.total / 2).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <div className="text-sm text-gray-600">
          <p className="font-semibold mb-2">Terms & Conditions:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>50% deposit required to secure booking</li>
            <li>Remaining balance due upon completion of services</li>
            <li>Cancellation policy: Full refund if cancelled 30 days before event</li>
            <li>All raw footage and final edited content will be delivered within 14 business days</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 