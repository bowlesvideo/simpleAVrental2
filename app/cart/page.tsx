'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/context/cart-context'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { loadStripe } from '@stripe/stripe-js'
import { useToast } from "@/components/ui/use-toast"
import { DayPicker } from 'react-day-picker'
import { format, addDays, isWeekend } from 'date-fns'
import 'react-day-picker/dist/style.css'
import { featureIcons } from '@/lib/constants'
import type { PackageFeature } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'package' | 'addon'
  keyFeatures?: PackageFeature[]
}

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const EVENT_DETAILS_KEY = 'event_details'

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
]

// Add validation functions
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const validatePhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10
}

const formatPhone = (input: string) => {
  const cleaned = input.replace(/\D/g, '')
  if (cleaned.length === 0) return ''
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
}

const validateZip = (zip: string) => {
  return /^\d{5}(-\d{4})?$/.test(zip)
}

// Add this function before the CartPage component
function getNextBusinessDay(date: Date): Date {
  let nextDay = addDays(date, 1)
  while (isWeekend(nextDay)) {
    nextDay = addDays(nextDay, 1)
  }
  return nextDay
}

function getTenBusinessDaysAhead(): Date {
  let date = new Date()
  let businessDays = 0
  while (businessDays < 10) {
    date = getNextBusinessDay(date)
    businessDays++
  }
  return date
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [eventDate, setEventDate] = useState<Date | null>(null)
  const [eventStartTime, setEventStartTime] = useState('09:00')
  const [eventEndTime, setEventEndTime] = useState('11:00')
  const [eventLocation, setEventLocation] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('FL')
  const [zip, setZip] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showErrors, setShowErrors] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    eventDate?: boolean;
    eventStartTime?: boolean;
    eventEndTime?: boolean;
    companyName?: boolean;
    contactName?: boolean;
    contactEmail?: boolean;
    eventLocation?: boolean;
    city?: boolean;
    state?: boolean;
    zip?: boolean;
  }>({})

  // Load event details from localStorage on mount
  useEffect(() => {
    const savedDetails = localStorage.getItem(EVENT_DETAILS_KEY)
    if (savedDetails) {
      try {
        const details = JSON.parse(savedDetails)
        // Make sure we parse the date correctly
        if (details.eventDate) {
          const parsedDate = new Date(details.eventDate)
          if (!isNaN(parsedDate.getTime())) {
            setEventDate(parsedDate)
          }
        }
        
        // Set all other fields if they exist
        if (details.eventStartTime) setEventStartTime(details.eventStartTime)
        if (details.eventEndTime) setEventEndTime(details.eventEndTime)
        if (details.eventLocation) setEventLocation(details.eventLocation)
        if (details.street) setStreet(details.street)
        if (details.city) setCity(details.city)
        if (details.state) setState(details.state)
        if (details.zip) setZip(details.zip)
        if (details.companyName) setCompanyName(details.companyName)
        if (details.contactName) setContactName(details.contactName)
        if (details.contactPhone) setContactPhone(details.contactPhone)
        if (details.contactEmail) setContactEmail(details.contactEmail)

        // Determine which step to show based on completed data
        if (details.eventDate && details.eventStartTime && details.eventEndTime) {
          if (details.companyName && details.contactName && details.contactEmail) {
            setStep(3)
          } else {
            setStep(2)
          }
        } else {
          setStep(1)
        }
      } catch (error) {
        console.error('Error loading saved details:', error)
        localStorage.removeItem(EVENT_DETAILS_KEY)
      }
    }
  }, [])

  // Save event details to localStorage whenever they change
  useEffect(() => {
    try {
      const details = {
        eventDate: eventDate?.toISOString(),
        eventStartTime,
        eventEndTime,
        eventLocation,
        street,
        city,
        state,
        zip,
        companyName,
        contactName,
        contactPhone,
        contactEmail
      }
      localStorage.setItem(EVENT_DETAILS_KEY, JSON.stringify(details))
    } catch (error) {
      console.error('Error saving details:', error)
    }
  }, [eventDate, eventStartTime, eventEndTime, eventLocation, street, city, state, zip, companyName, contactName, contactPhone, contactEmail])

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 4)

  // Separate packages and add-ons
  const packages = items.filter(item => item.type === 'package')
  const addons = items.filter(item => item.type === 'addon')

  console.log('Packages:', packages);

  const nextStep = () => {
    const currentStep = step
    const newStep = Math.min(currentStep + 1, 3) as 1 | 2 | 3
    setStep(newStep)
    
    // Send GA event for checkout steps
    const gtag = (window as any).gtag
    if (typeof gtag !== 'undefined') {
      if (currentStep === 1) {
        gtag('event', 'begin_checkout', {
          currency: 'USD',
          value: total,
          items: items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.type === 'package' ? 'Package' : 'Add-on',
            price: item.price,
            quantity: item.quantity
          }))
        });
      } else if (currentStep === 2) {
        gtag('event', 'add_shipping_info', {
          currency: 'USD',
          value: total,
          items: items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.type === 'package' ? 'Package' : 'Add-on',
            price: item.price,
            quantity: item.quantity
          }))
        });
      }
    }
  }

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3)
  
  const isContactDetailsValid = companyName && contactName && contactEmail

  // Add view_cart event when component mounts
  useEffect(() => {
    const gtag = (window as any).gtag
    if (typeof gtag !== 'undefined' && items.length > 0) {
      gtag('event', 'view_cart', {
        currency: 'USD',
        value: total,
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.type === 'package' ? 'Package' : 'Add-on',
          price: item.price,
          quantity: item.quantity
        }))
      });
    }
  }, [items, total]);

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      
      // Save cart and event details to session storage in case checkout fails
      sessionStorage.setItem('pending_cart', JSON.stringify(items))
      sessionStorage.setItem('pending_event_details', JSON.stringify({
        eventDate: eventDate?.toISOString(),
        eventStartTime,
        eventEndTime,
        eventLocation,
        street,
        city,
        state,
        zip,
        companyName,
        contactName,
        contactPhone,
        contactEmail
      }))

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          eventDetails: {
            eventDate: eventDate?.toISOString(),
            eventStartTime,
            eventEndTime,
            eventLocation,
            street,
            city,
            state,
            zip,
            companyName,
            contactName,
            contactPhone,
            contactEmail
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe without clearing cart
      window.location.href = url

    } catch (error) {
      console.error('Error in checkout:', error)
      // Remove pending cart if checkout fails
      sessionStorage.removeItem('pending_cart')
      sessionStorage.removeItem('pending_event_details')
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : 'Failed to initiate checkout',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add validation function for step 1
  const validateStep1 = () => {
    const errors: typeof validationErrors = {}
    
    if (!eventDate || isNaN(eventDate.getTime())) {
      errors.eventDate = true
    }
    if (!eventStartTime) {
      errors.eventStartTime = true
    }
    if (!eventEndTime) {
      errors.eventEndTime = true
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Update validation function for step 2
  const validateStep2 = () => {
    const errors: typeof validationErrors = {}
    
    if (!companyName) {
      errors.companyName = true
    }
    if (!eventLocation) {
      errors.eventLocation = true
    }
    if (!city) {
      errors.city = true
    }
    if (!state) {
      errors.state = true
    }
    if (!zip) {
      errors.zip = true
    }
    if (!contactName) {
      errors.contactName = true
    }
    if (!contactEmail) {
      errors.contactEmail = true
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextStep = () => {
    if (step === 1) {
      const isValid = validateStep1()
      if (!isValid) {
        setShowErrors(true)
        return
      }
    } else if (step === 2) {
      const isValid = validateStep2()
      if (!isValid) {
        setShowErrors(true)
        return
      }
    }
    nextStep()
  }

  const handleStepClick = (targetStep: number) => {
    // If going backwards, always allow
    if (targetStep < step) {
      setStep(targetStep as 1 | 2 | 3)
      return
    }

    // If trying to go to step 3, validate step 2 first
    if (targetStep === 3 && step === 2) {
      const isValid = validateStep2()
      if (!isValid) {
        setShowErrors(true)
        return
      }
      setStep(3)
      return
    }

    // If trying to go to step 2, validate step 1 first
    if (targetStep === 2 && step === 1) {
      const isValid = validateStep1()
      if (!isValid) {
        setShowErrors(true)
        return
      }
      setStep(2)
      return
    }
  }

  const handleFakeOrder = async () => {
    try {
      setIsLoading(true)

      // Prepare the order data
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type,
          keyFeatures: item.keyFeatures
        })),
        eventDate: eventDate?.toISOString(),
        eventStartTime,
        eventEndTime,
        eventLocation,
        contactDetails: {
          companyName,
          contactName,
          contactEmail,
          contactPhone,
          street,
          city,
          state,
          zip
        },
        total
      }

      console.log('Sending order data:', orderData)

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.message || 
          errorData?.error || 
          `Server error: ${response.status}`
        )
      }

      const data = await response.json()

      if (data.warning) {
        toast({
          title: "Order Created",
          description: "Order saved but email notifications failed to send. Our team has been notified.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Order Created",
          description: "Order has been saved and confirmation emails sent",
        })
      }

      // Clear cart and localStorage
      clearCart()
      localStorage.removeItem(EVENT_DETAILS_KEY)
      
      // Redirect to orders page
      window.location.href = '/orders'
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white py-16" role="main">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#072948] mb-8">Your Cart</h1>
          
          <section className="text-center py-12" aria-label="Empty cart message">
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-[#0095ff] text-white hover:bg-[#007acc]"
            >
              Browse Packages
            </Button>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white py-8" role="main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8" aria-label="Checkout progress">
          <div className="flex justify-between items-center relative">
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200"></div>
            {[
              { step: 1, label: "Event", fullLabel: "Event Details" },
              { step: 2, label: "Contact", fullLabel: "Contact Information" },
              { step: 3, label: "Review", fullLabel: "Review & Checkout" }
            ].map(({ step: stepNum, label, fullLabel }) => (
              <button
                key={stepNum}
                onClick={() => handleStepClick(stepNum)}
                className={cn(
                  "flex-1 relative text-center py-2",
                  "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
                  step >= stepNum 
                    ? "text-[#0095ff] after:bg-[#0095ff]" 
                    : "text-gray-400 after:bg-transparent",
                )}
                aria-current={step === stepNum ? 'step' : undefined}
                aria-label={fullLabel}
              >
                <span className="text-sm sm:text-base">
                  {stepNum}. {label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {step === 1 && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" aria-label="Event details form">
            <div className="lg:col-span-6">
              <Card className={cn(
                showErrors && validationErrors.eventDate && "ring-2 ring-red-500"
              )}>
                <CardHeader className="pb-3">
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:flex-1">
                      <Label className={cn(
                        "text-sm font-medium mb-2 block",
                        showErrors && validationErrors.eventDate && "text-red-500"
                      )}>
                        Event Date {showErrors && validationErrors.eventDate && "- Required"}
                      </Label>
                      <Calendar
                        mode="single"
                        selected={eventDate || undefined}
                        onSelect={(date) => {
                          setEventDate(date || null)
                          if (showErrors) {
                            setValidationErrors(prev => ({...prev, eventDate: !date}))
                          }
                        }}
                        className={cn(
                          "rounded-md border w-full",
                          showErrors && validationErrors.eventDate && "border-red-500"
                        )}
                        disabled={{ before: new Date() }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className={cn(
                        "text-sm font-medium mb-2 block",
                        showErrors && validationErrors.eventStartTime && "text-red-500"
                      )}>
                        Start Time {showErrors && validationErrors.eventStartTime && "- Required"}
                      </Label>
                      <Select 
                        value={eventStartTime} 
                        onValueChange={(value) => {
                          setEventStartTime(value)
                          if (showErrors) {
                            setValidationErrors(prev => ({...prev, eventStartTime: !value}))
                          }
                        }}
                      >
                        <SelectTrigger className={cn(
                          showErrors && validationErrors.eventStartTime && "border-red-500"
                        )}>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0')
                            return (
                              <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                {`${hour}:00`}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className={cn(
                        "text-sm font-medium mb-2 block",
                        showErrors && validationErrors.eventEndTime && "text-red-500"
                      )}>
                        End Time {showErrors && validationErrors.eventEndTime && "- Required"}
                      </Label>
                      <Select 
                        value={eventEndTime} 
                        onValueChange={(value) => {
                          setEventEndTime(value)
                          if (showErrors) {
                            setValidationErrors(prev => ({...prev, eventEndTime: !value}))
                          }
                        }}
                      >
                        <SelectTrigger className={cn(
                          showErrors && validationErrors.eventEndTime && "border-red-500"
                        )}>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0')
                            return (
                              <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                {`${hour}:00`}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {packages.length > 0 && (
                      <section aria-label="Selected packages" className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-500">Packages</h3>
                        {packages.map((item) => (
                          <div key={item.id} className="flex justify-between items-center group">
                            <span>{item.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border rounded-md">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="px-2 py-1 hover:bg-gray-100 border-r"
                                  aria-label="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1">{item.quantity}x</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="px-2 py-1 hover:bg-gray-100 border-l"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                              <span>${Math.round(item.price * item.quantity).toLocaleString()}</span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </section>
                    )}
                    {addons.length > 0 && (
                      <section aria-label="Selected add-ons" className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-500">Add-ons</h3>
                        {addons.map((item) => (
                          <div key={item.id} className="flex justify-between items-center group">
                            <span>{item.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border rounded-md">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="px-2 py-1 hover:bg-gray-100 border-r"
                                  aria-label="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1">{item.quantity}x</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="px-2 py-1 hover:bg-gray-100 border-l"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                              <span>${Math.round(item.price * item.quantity).toLocaleString()}</span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
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
                          <span>50% charged today</span>
                          <span>${Math.round(total * 0.5).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>50% on delivery</span>
                          <span>${Math.round(total * 0.5).toLocaleString()}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" aria-label="Contact information form">
            <div className="lg:col-span-6">
              <Card className={cn(
                showErrors && (validationErrors.companyName || validationErrors.contactName || validationErrors.contactEmail) && "ring-2 ring-red-500"
              )}>
                <CardHeader className="pb-3">
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className={cn(
                        "text-sm font-medium mb-2 block",
                        showErrors && validationErrors.companyName && "text-red-500"
                      )}>
                        Company Name {showErrors && validationErrors.companyName && "- Required"}
                      </Label>
                      <Input
                        type="text"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value)
                          if (showErrors) {
                            setValidationErrors(prev => ({...prev, companyName: !e.target.value}))
                          }
                        }}
                        className={cn(
                          showErrors && validationErrors.companyName && "border-red-500"
                        )}
                        placeholder="Enter company name"
                        autoComplete="organization"
                      />
                    </div>
                    <div>
                      <Label className={cn(
                        "text-sm font-medium mb-2 block",
                        showErrors && validationErrors.eventLocation && "text-red-500"
                      )}>
                        Event Location {showErrors && validationErrors.eventLocation && "- Required"}
                      </Label>
                      <Input
                        value={eventLocation}
                        onChange={(e) => {
                          setEventLocation(e.target.value)
                          if (showErrors) {
                            setValidationErrors(prev => ({...prev, eventLocation: !e.target.value}))
                          }
                        }}
                        className={cn(
                          showErrors && validationErrors.eventLocation && "border-red-500"
                        )}
                        placeholder="Enter event location"
                        autoComplete="street-address"
                      />
                    </div>
                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-2">
                        <Label className={cn(
                          "text-sm font-medium mb-2 block",
                          showErrors && validationErrors.city && "text-red-500"
                        )}>
                          City {showErrors && validationErrors.city && "- Required"}
                        </Label>
                        <Input
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value)
                            if (showErrors) {
                              setValidationErrors(prev => ({...prev, city: !e.target.value}))
                            }
                          }}
                          className={cn(
                            showErrors && validationErrors.city && "border-red-500"
                          )}
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className={cn(
                          "text-sm font-medium mb-2 block",
                          showErrors && validationErrors.state && "text-red-500"
                        )}>
                          State {showErrors && validationErrors.state && "- Required"}
                        </Label>
                        <Select 
                          value={state} 
                          onValueChange={(value) => {
                            setState(value)
                            if (showErrors) {
                              setValidationErrors(prev => ({...prev, state: !value}))
                            }
                          }}
                        >
                          <SelectTrigger className={cn(
                            showErrors && validationErrors.state && "border-red-500"
                          )}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {state && state !== 'FL' && (
                          <p className="text-red-500 text-sm mt-2">
                            We only support events in Florida at this time. Please contact us for questions
                          </p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <Label className={cn(
                          "text-sm font-medium mb-2 block",
                          showErrors && validationErrors.zip && "text-red-500"
                        )}>
                          ZIP Code {showErrors && validationErrors.zip && "- Required"}
                        </Label>
                        <Input
                          value={zip}
                          onChange={(e) => {
                            setZip(e.target.value)
                            if (showErrors) {
                              setValidationErrors(prev => ({...prev, zip: !e.target.value}))
                            }
                          }}
                          className={cn(
                            showErrors && validationErrors.zip && "border-red-500"
                          )}
                          placeholder="ZIP"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className={cn(
                        "text-sm font-medium mb-2 block",
                        showErrors && validationErrors.contactName && "text-red-500"
                      )}>
                        Contact Name {showErrors && validationErrors.contactName && "- Required"}
                      </Label>
                      <Input
                        type="text"
                        value={contactName}
                        onChange={(e) => {
                          setContactName(e.target.value)
                          if (showErrors) {
                            setValidationErrors(prev => ({...prev, contactName: !e.target.value}))
                          }
                        }}
                        className={cn(
                          showErrors && validationErrors.contactName && "border-red-500"
                        )}
                        placeholder="Enter full name"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <Label className={cn(
                        "text-sm font-medium mb-2 block",
                        showErrors && validationErrors.contactEmail && "text-red-500"
                      )}>
                        Contact Email {showErrors && validationErrors.contactEmail && "- Required"}
                      </Label>
                      <Input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => {
                          setContactEmail(e.target.value)
                          if (showErrors) {
                            setValidationErrors(prev => ({...prev, contactEmail: !e.target.value}))
                          }
                        }}
                        className={cn(
                          showErrors && validationErrors.contactEmail && "border-red-500"
                        )}
                        placeholder="Enter email address"
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Contact Phone (Optional)</Label>
                      <Input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(formatPhone(e.target.value))}
                        placeholder="Enter phone number"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {packages.length > 0 && (
                      <section aria-label="Selected packages" className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-500">Packages</h3>
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
                        <h3 className="font-medium text-sm text-gray-500">Add-ons</h3>
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
                          <span>50% charged today</span>
                          <span>${Math.round(total * 0.5).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>50% on delivery</span>
                          <span>${Math.round(total * 0.5).toLocaleString()}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" aria-label="Review order">
            <div className="lg:col-span-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Event Details</h3>
                    <div className="space-y-1 text-sm">
                      <p>Date: {eventDate ? format(eventDate, 'MMMM d, yyyy') : 'Not selected'}</p>
                      <p>Time: {eventStartTime} - {eventEndTime}</p>
                      <p>Location: {eventLocation}</p>
                      <p>Address: {street}</p>
                      <p>{city}, {state} {zip}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-1 text-sm">
                      <p>Company: {companyName}</p>
                      <p>Contact: {contactName}</p>
                      <p>Email: {contactEmail}</p>
                      <p>Phone: {contactPhone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {packages.length > 0 && (
                      <section aria-label="Selected packages" className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-500">Packages</h3>
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
                        <h3 className="font-medium text-sm text-gray-500">Add-ons</h3>
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
                          <span>50% charged today</span>
                          <span>${Math.round(total * 0.5).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>50% on delivery</span>
                          <span>${Math.round(total * 0.5).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button 
                          onClick={handleCheckout}
                          className="w-full bg-[#0095ff] text-white hover:bg-[#007acc]"
                          disabled={isLoading}
                        >
                          {isLoading ? "Processing..." : "Proceed to Checkout"}
                        </Button>
                      </div>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Mobile navigation at bottom of content */}
        <div className="lg:hidden mt-8">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="w-[120px]"
            >
              Previous
            </Button>
            {step !== 3 && (
              <Button
                onClick={handleNextStep}
                className="bg-[#0095ff] text-white hover:bg-[#007acc] w-[120px]"
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:block">
          <section className="flex justify-between mt-8" aria-label="Navigation controls">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="w-[120px]"
            >
              Previous
            </Button>
            {step !== 3 && (
              <Button
                onClick={handleNextStep}
                className="bg-[#0095ff] text-white hover:bg-[#007acc] w-[120px]"
              >
                Next
              </Button>
            )}
          </section>
        </div>
      </div>
    </main>
  )
} 