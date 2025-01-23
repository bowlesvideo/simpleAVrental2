'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { format } from 'date-fns'
import { Calendar, Clock, Receipt } from 'lucide-react'
import Link from 'next/link'

interface EventDetails {
  firstName: string;
  eventDate: string;
  eventTime: string;
}

const ConfirmationContent = () => {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

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
        }

        // Get event details from localStorage
        const storedEventDetails = localStorage.getItem('event_details')
        if (storedEventDetails) {
          setEventDetails(JSON.parse(storedEventDetails))
        }

        // Clear localStorage in production
        if (process.env.NODE_ENV === 'production') {
          localStorage.removeItem('event_details')
          localStorage.removeItem('cart')
        }
      } catch (error) {
        console.error('Error fetching order details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [searchParams])

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
          <div className="text-center">
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Look for us to reach out over the next few days to confirm all the details and make your event amazing! 🎥 ✨
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4 pt-4">
          <Button asChild className="bg-[#0095ff] text-white hover:bg-[#007acc] px-8 py-6 text-lg rounded-full transition-transform hover:scale-105">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
      <div className="text-center space-y-2">
        <div className="text-sm text-gray-500">
          Order confirmation and details will be sent to your email
        </div>
        <div className="text-sm text-gray-400">
          Reference: #{orderId}
        </div>
      </div>
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