'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No session ID found",
        variant: "destructive",
      })
      return
    }

    // Clear cart and event details from storage
    localStorage.removeItem('cart_items')
    localStorage.removeItem('event_details')

    setLoading(false)
  }, [searchParams, toast])

  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl text-[#072948]">
              Thank You for Your Order!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-4">
                Your payment has been processed successfully.
              </p>
              <p className="text-gray-600 mb-8">
                We will contact you shortly to confirm all the details for your event.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-[#0095ff] text-white hover:bg-[#007acc]"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
} 