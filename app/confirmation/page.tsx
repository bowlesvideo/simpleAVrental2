'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { format } from 'date-fns'
import { Calendar, Clock, Receipt, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/context/cart-context'

interface EventDetails {
  firstName: string;
  eventDate: string;
  eventTime: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'package' | 'addon';
  keyFeatures?: { value: string }[];
}

const ConfirmationContent = () => {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { clearCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [total, setTotal] = useState(0)

  // Test function to send sample GA event
  const sendTestPurchaseEvent = () => {
    const gtag = (window as any).gtag
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: 'TEST-' + Date.now(),
        value: 5500,
        currency: 'USD',
        items: [
          {
            item_id: 'pkg_meeting',
            item_name: 'Meeting Package',
            item_category: 'Package',
            price: 2500,
            quantity: 1
          },
          {
            item_id: 'addon_stream',
            item_name: 'Live Streaming',
            item_category: 'Add-on',
            price: 3000,
            quantity: 1
          }
        ]
      });
      console.log('Test purchase event sent to GA');
    } else {
      console.error('Google Analytics not loaded');
    }
  }

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        if (!sessionId) {
          setLoading(false)
          return
        }

        // Fetch order ID from API
        const response = await fetch(`/api/orders/session/${sessionId}`)
        const data = await response.json()
        
        if (response.ok) {
          setOrderId(data.orderId)
          if (data.items) {
            setOrderItems(data.items)
            const orderTotal = data.total || data.items.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0)
            setTotal(orderTotal)

            // Send GA purchase event
            const gtag = (window as any).gtag
            if (typeof gtag !== 'undefined') {
              gtag('event', 'purchase', {
                transaction_id: data.orderId,
                value: orderTotal,
                currency: 'USD',
                items: data.items.map((item: OrderItem) => ({
                  item_id: item.id,
                  item_name: item.name,
                  item_category: item.type === 'package' ? 'Package' : 'Add-on',
                  price: item.price,
                  quantity: item.quantity
                }))
              });
              
              // Google Ads conversion tracking
              gtag('event', 'conversion', {
                'send_to': 'AW-16834370291/MwZRCKevxJQaEPO1oNs-',
                'value': orderTotal,
                'currency': 'USD',
                'transaction_id': data.orderId
              });
            }
          }

          // Get event details from localStorage
          const storedEventDetails = localStorage.getItem('event_details')
          if (storedEventDetails) {
            setEventDetails(JSON.parse(storedEventDetails))
          }

          // Clear cart using the cart context
          clearCart()
          
          // Clear event details and pending data
          localStorage.removeItem('event_details')
          localStorage.removeItem('EVENT_DETAILS_KEY')
          sessionStorage.removeItem('pending_cart')
          sessionStorage.removeItem('pending_event_details')
        }
      } catch (error) {
        console.error('Error fetching order details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [searchParams, clearCart])

  const formatEventDate = () => {
    if (!eventDetails?.eventDate) return null
    const date = new Date(eventDetails.eventDate)
    return {
      dayName: format(date, 'EEEE'),
      month: format(date, 'MMMM'),
      day: format(date, 'd'),
      year: format(date, 'yyyy')
    }
  }

  const dateInfo = formatEventDate()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl text-[#072948]">
            Loading...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  // Separate packages and add-ons
  const packages = orderItems.filter(item => item.type === 'package')
  const addons = orderItems.filter(item => item.type === 'addon')

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-t-4 border-t-[#0095ff]">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center bg-blue-50 text-[#0095ff] px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Receipt className="w-4 h-4 mr-2" />
              Order #{orderId}
            </div>
          </div>
          <CardTitle className="text-center text-4xl text-[#072948] font-bold">
            {eventDetails?.firstName ? (
              <>
                <span className="block text-[#0095ff] text-2xl mb-2">🎉 Awesome!</span>
                You're all set {eventDetails.firstName}!
              </>
            ) : (
              "Thank You for Your Order!"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          {dateInfo && eventDetails?.eventTime && (
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center gap-12">
                <div className="text-center transform hover:scale-105 transition-transform">
                  <div className="bg-[#0095ff] text-white rounded-t-lg p-2">
                    <div className="text-sm font-medium">{dateInfo.month}</div>
                  </div>
                  <div className="border-2 border-t-0 border-[#0095ff] rounded-b-lg p-3">
                    <div className="text-3xl font-bold text-[#072948]">{dateInfo.day}</div>
                    <div className="text-sm text-gray-600">{dateInfo.year}</div>
                  </div>
                </div>
                <div className="text-center px-6 py-4 bg-gray-50 rounded-lg transform hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6 text-[#0095ff] mx-auto mb-2" />
                  <div className="text-xl font-semibold text-[#072948]">
                    {eventDetails.eventTime}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl text-gray-600 mb-2">
                  We'll see you on
                </div>
                <div className="text-2xl font-semibold text-[#072948]">
                  {dateInfo.dayName}
                </div>
              </div>
            </div>
          )}

          {/* Order Summary Section */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            <div className="space-y-6">
              {packages.length > 0 && (
                <section aria-label="Selected packages" className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500">Packages</h4>
                  {packages.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1">{item.quantity}x</span>
                        <span>${Math.round(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </section>
              )}
              {addons.length > 0 && (
                <section aria-label="Selected add-ons" className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500">Add-ons</h4>
                  {addons.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1">{item.quantity}x</span>
                        <span>${Math.round(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </section>
              )}
              <section aria-label="Order total" className="pt-4 border-t">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${Math.round(total).toLocaleString()}</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>50% paid</span>
                    </div>
                    <span>${Math.round(total * 0.5).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>50% due on delivery</span>
                    <span>${Math.round(total * 0.5).toLocaleString()}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="text-center">
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Look for us to reach out over the next few days to confirm all the details and make your event amazing! 🎥 ✨
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <div className="text-sm text-gray-500">
            Order confirmation and details will be sent to your email
          </div>
          <div className="text-sm text-gray-400">
            Reference: #{orderId}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={sendTestPurchaseEvent}
            >
              Send Test GA Event
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl text-[#072948]">
                Loading...
              </CardTitle>
            </CardHeader>
          </Card>
        }>
          <ConfirmationContent />
        </Suspense>
      </div>
    </main>
  )
} 