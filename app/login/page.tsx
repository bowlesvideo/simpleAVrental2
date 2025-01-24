'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setError('No orders found for this email address.')
        } else {
          setError(data.error || 'Failed to send login link. Please try again.')
        }
        return
      }

      setSuccess(true)
    } catch (error) {
      setError('Failed to send login link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h1 className="text-2xl font-bold text-[#072948] mb-2">View Your Orders</h1>
          <p className="text-gray-600 mb-6">Enter your email to receive a secure login link</p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert className="mb-6">
              <AlertDescription>
                Check your email for a secure login link. The link will expire in 15 minutes.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleLogin}>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mb-4"
              />
              <Button 
                type="submit" 
                className="w-full bg-[#0095ff] text-white hover:bg-[#007acc]"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Login Link'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
} 