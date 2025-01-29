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
import type { PackageFeature, AddOn } from '@/lib/types'
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
import { PackageComparison } from '@/components/package-comparison'
import { formatCurrency } from '@/lib/utils'

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

// Add this helper function near the top of the file
const formatTimeToAMPM = (time: string) => {
  if (!time) return '';
  const [hour] = time.split(':');
  const hourNum = parseInt(hour);
  const ampm = hourNum < 12 ? 'AM' : 'PM';
  const hour12 = hourNum % 12 || 12;
  return `${hour12}:00 ${ampm}`;
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart, addPackage, addAddOn } = useCart()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [showErrors, setShowErrors] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Event Details
  const [eventDate, setEventDate] = useState<Date | null>(null)
  const [eventStartTime, setEventStartTime] = useState('')
  const [eventEndTime, setEventEndTime] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  
  // Contact Information
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [emailUpdates, setEmailUpdates] = useState(true)
  const [smsUpdates, setSmsUpdates] = useState(false)

  // Update eventLocation when address fields change
  useEffect(() => {
    if (street && city && state && zip) {
      setEventLocation(`${street}, ${city}, ${state} ${zip}`)
    }
  }, [street, city, state, zip])

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    eventDate?: boolean
    eventStartTime?: boolean
    eventEndTime?: boolean
    companyName?: boolean
    contactName?: boolean
    contactEmail?: boolean
    street?: boolean
    city?: boolean
    state?: boolean
    zip?: boolean
    eventLocation?: boolean
  }>({})
  const [showAddOns, setShowAddOns] = useState(false)
  const [selectedPackageForAddOns, setSelectedPackageForAddOns] = useState<CartItem | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<{ [packageId: string]: string[] }>({})
  const [addOns, setAddOns] = useState<AddOn[]>([])

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
          items: items.map(item => ({
            ...item,
            price: Math.round(item.price * 50) // Convert to cents and take 50% deposit
          })),
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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      if (!url) {
        throw new Error('No checkout URL received')
      }

      // Redirect to Stripe
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
      const errors = {
        eventDate: !eventDate,
        eventStartTime: !eventStartTime,
        eventEndTime: !eventEndTime
      }
      if (Object.values(errors).some(Boolean)) {
        setValidationErrors(errors)
        setShowErrors(true)
        return
      }
    } else if (step === 2) {
      const errors = {
        companyName: !companyName,
        contactName: !contactName,
        contactEmail: !contactEmail,
        street: !street,
        city: !city,
        state: !state,
        zip: !zip
      }
      if (Object.values(errors).some(Boolean)) {
        setValidationErrors(errors)
        setShowErrors(true)
        return
      }
    }
    setStep(prev => Math.min(prev + 1, 3) as 1 | 2 | 3)
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
        eventLocation: {
          street,
          city,
          state,
          zip
        },
        contactDetails: {
          companyName,
          contactName,
          contactEmail,
          contactPhone
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

  const handleViewAddOns = (pkg: CartItem) => {
    // Find all add-ons that are already in the cart for this package
    const currentAddOns = items
      .filter(item => 
        item.type === 'addon' && // Is an add-on
        addOns.some(addon => 
          addon.id === item.id && // Match the add-on
          addon.packages?.includes(pkg.id) // Compatible with this package
        )
      )
      .map(item => item.id);
    
    setSelectedAddOns({
      [pkg.id]: currentAddOns
    });
    setSelectedPackageForAddOns(pkg);
    setShowAddOns(true);
  }

  const handleCloseModal = () => {
    setShowAddOns(false);
    setSelectedPackageForAddOns(null);
    setSelectedAddOns({});
  }

  // Fetch add-ons data
  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const response = await fetch('/api/rental-config')
        if (!response.ok) throw new Error('Failed to fetch add-ons')
        const data = await response.json()
        setAddOns(data.addOns || [])
      } catch (error) {
        console.error('Error fetching add-ons:', error)
      }
    }
    fetchAddOns()
  }, [])

  const handleAddOnToggle = (packageId: string, addOnId: string) => {
    setSelectedAddOns(prev => {
      const packageAddOns = prev[packageId] || []
      const isSelected = packageAddOns.includes(addOnId)
      
      if (isSelected) {
        removeItem(addOnId)
        return {
          ...prev,
          [packageId]: packageAddOns.filter(id => id !== addOnId)
        }
      } else {
        const addon = addOns.find(a => a.id === addOnId)
        if (addon) {
          // First remove any existing instance of this add-on
          removeItem(addOnId)
          
          // Then add it fresh with quantity 1
          const addOnItem = {
            ...addon,
            quantity: 1,
            type: 'addon' as const
          }
          addAddOn(addOnItem)
          
          return {
            ...prev,
            [packageId]: [...packageAddOns, addOnId]
          }
        }
        return prev
      }
    })
  }

  const filteredAddOns = selectedPackageForAddOns
    ? addOns.filter(addon => addon.packages?.includes(selectedPackageForAddOns.id))
    : []

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
                  <CardTitle className="flex items-center gap-2">
                    <span>Event Details</span>
                    <span className="text-sm font-normal text-[#0095ff]">Step 1 of 3</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Let's start by getting your event details. Our team will review this information and prepare everything needed for a successful production.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Process Steps */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="font-medium text-[#072948] mb-3">What happens next?</h3>
                      <ol className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-[#0095ff]">1.</span>
                          <span>Submit your event details and complete booking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-[#0095ff]">2.</span>
                          <span>Our team reviews your requirements within 24 hours</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-[#0095ff]">3.</span>
                          <span>We'll send a detailed production schedule and setup plan</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-medium text-[#0095ff]">4.</span>
                          <span>Pre-event technical check one day before</span>
                        </li>
                      </ol>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="w-full lg:w-7/12">
                        <Label className={cn(
                          "text-sm font-medium mb-2 block",
                          showErrors && validationErrors.eventDate && "text-red-500"
                        )}>
                          Event Date {showErrors && validationErrors.eventDate && "- Required"}
                        </Label>
                        <div className="relative">
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
                          <p className="text-xs text-gray-500 mt-1">
                            We recommend booking at least 4 days in advance for optimal preparation
                          </p>
                        </div>
                      </div>
                      
                      <div className="w-full lg:w-5/12 space-y-4">
                        <div>
                          <Label className={cn(
                            "text-sm font-medium mb-2 block",
                            showErrors && validationErrors.eventStartTime && "text-red-500"
                          )}>
                            Start Time {showErrors && validationErrors.eventStartTime && "- Required"}
                          </Label>
                          <select
                            value={eventStartTime}
                            onChange={(e) => {
                              setEventStartTime(e.target.value)
                              if (showErrors) {
                                setValidationErrors(prev => ({...prev, eventStartTime: !e.target.value}))
                              }
                            }}
                            className={cn(
                              "w-full rounded-md border bg-white px-3 py-2",
                              showErrors && validationErrors.eventStartTime && "border-red-500"
                            )}
                          >
                            <option value="">Select start time</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i % 12 || 12
                              const ampm = i < 12 ? 'AM' : 'PM'
                              const value = `${i.toString().padStart(2, '0')}:00`
                              return (
                                <option key={value} value={value}>
                                  {`${hour}:00 ${ampm}`}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                        
                        <div>
                          <Label className={cn(
                            "text-sm font-medium mb-2 block",
                            showErrors && validationErrors.eventEndTime && "text-red-500"
                          )}>
                            End Time {showErrors && validationErrors.eventEndTime && "- Required"}
                          </Label>
                          <select
                            value={eventEndTime}
                            onChange={(e) => {
                              setEventEndTime(e.target.value)
                              if (showErrors) {
                                setValidationErrors(prev => ({...prev, eventEndTime: !e.target.value}))
                              }
                            }}
                            className={cn(
                              "w-full rounded-md border bg-white px-3 py-2",
                              showErrors && validationErrors.eventEndTime && "border-red-500"
                            )}
                          >
                            <option value="">Select end time</option>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i % 12 || 12
                              const ampm = i < 12 ? 'AM' : 'PM'
                              const value = `${i.toString().padStart(2, '0')}:00`
                              return (
                                <option key={value} value={value}>
                                  {`${hour}:00 ${ampm}`}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="border-t pt-6 mt-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-[#0095ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>Secure Booking Process</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-[#0095ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>24hr Support</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-[#0095ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>20+ Years Experience</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 text-[#0095ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                          </svg>
                          <span>98% Client Satisfaction</span>
                        </div>
                      </div>
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
                            <div className="flex-1">
                              <span>{item.name}</span>
                            </div>
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
                    {packages.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="grid gap-2">
                          {packages.map((pkg) => (
                            <Button
                              key={pkg.id}
                              onClick={() => handleViewAddOns(pkg)}
                              variant="outline"
                              className="w-full text-left flex justify-between items-center"
                            >
                              <span>Add Add-ons for {pkg.name}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            </Button>
                          ))}
                        </div>
                      </div>
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <span>Contact Information</span>
                    <span className="text-sm font-normal text-[#0095ff]">Step 2 of 3</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Please provide your contact details. We'll use this information to coordinate your event and send confirmation details.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Company Information */}
                    <div>
                      <Label className={cn(
                        "text-sm font-medium mb-2 block",
                        showErrors && validationErrors.companyName && "text-red-500"
                      )}>
                        Company Name {showErrors && validationErrors.companyName && "- Required"}
                      </Label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value)
                          if (showErrors) {
                            setValidationErrors(prev => ({...prev, companyName: !e.target.value}))
                          }
                        }}
                        className={cn(
                          "w-full rounded-md border bg-white px-3 py-2",
                          showErrors && validationErrors.companyName && "border-red-500"
                        )}
                      />
                    </div>

                    {/* Contact Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className={cn(
                          "text-sm font-medium mb-2 block",
                          showErrors && validationErrors.contactName && "text-red-500"
                        )}>
                          Contact Name {showErrors && validationErrors.contactName && "- Required"}
                        </Label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => {
                            setContactName(e.target.value)
                            if (showErrors) {
                              setValidationErrors(prev => ({...prev, contactName: !e.target.value}))
                            }
                          }}
                          className={cn(
                            "w-full rounded-md border bg-white px-3 py-2",
                            showErrors && validationErrors.contactName && "border-red-500"
                          )}
                        />
                      </div>
                      <div>
                        <Label className={cn(
                          "text-sm font-medium mb-2 block",
                          showErrors && validationErrors.contactEmail && "text-red-500"
                        )}>
                          Email {showErrors && validationErrors.contactEmail && "- Required"}
                        </Label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => {
                            setContactEmail(e.target.value)
                            if (showErrors) {
                              setValidationErrors(prev => ({...prev, contactEmail: !e.target.value}))
                            }
                          }}
                          className={cn(
                            "w-full rounded-md border bg-white px-3 py-2",
                            showErrors && validationErrors.contactEmail && "border-red-500"
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Phone (Optional)
                      </Label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full rounded-md border bg-white px-3 py-2"
                        placeholder="(123) 456-7890"
                      />
                    </div>

                    {/* Event Location */}
                    <div className="border-t pt-6">
                      <h3 className="font-medium text-[#072948] mb-4">Event Location</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className={cn(
                            "text-sm font-medium mb-2 block",
                            showErrors && validationErrors.street && "text-red-500"
                          )}>
                            Street Address {showErrors && validationErrors.street && "- Required"}
                          </Label>
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => {
                              setStreet(e.target.value)
                              if (showErrors) {
                                setValidationErrors(prev => ({...prev, street: !e.target.value}))
                              }
                            }}
                            className={cn(
                              "w-full rounded-md border bg-white px-3 py-2",
                              showErrors && validationErrors.street && "border-red-500"
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <Label className={cn(
                              "text-sm font-medium mb-2 block",
                              showErrors && validationErrors.city && "text-red-500"
                            )}>
                              City {showErrors && validationErrors.city && "- Required"}
                            </Label>
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => {
                                setCity(e.target.value)
                                if (showErrors) {
                                  setValidationErrors(prev => ({...prev, city: !e.target.value}))
                                }
                              }}
                              className={cn(
                                "w-full rounded-md border bg-white px-3 py-2",
                                showErrors && validationErrors.city && "border-red-500"
                              )}
                            />
                          </div>
                          <div>
                            <Label className={cn(
                              "text-sm font-medium mb-2 block",
                              showErrors && validationErrors.state && "text-red-500"
                            )}>
                              State {showErrors && validationErrors.state && "- Required"}
                            </Label>
                            <select
                              value={state}
                              onChange={(e) => {
                                setState(e.target.value)
                                if (showErrors) {
                                  setValidationErrors(prev => ({...prev, state: !e.target.value}))
                                }
                              }}
                              className={cn(
                                "w-full rounded-md border bg-white px-3 py-2",
                                showErrors && validationErrors.state && "border-red-500"
                              )}
                            >
                              <option value="">Select state</option>
                              <option value="FL">Florida</option>
                              <option value="GA">Georgia</option>
                              <option value="SC">South Carolina</option>
                              <option value="NC">North Carolina</option>
                              <option value="AL">Alabama</option>
                            </select>
                          </div>
                          <div>
                            <Label className={cn(
                              "text-sm font-medium mb-2 block",
                              showErrors && validationErrors.zip && "text-red-500"
                            )}>
                              ZIP Code {showErrors && validationErrors.zip && "- Required"}
                            </Label>
                            <input
                              type="text"
                              value={zip}
                              onChange={(e) => {
                                setZip(e.target.value)
                                if (showErrors) {
                                  setValidationErrors(prev => ({...prev, zip: !e.target.value}))
                                }
                              }}
                              className={cn(
                                "w-full rounded-md border bg-white px-3 py-2",
                                showErrors && validationErrors.zip && "border-red-500"
                              )}
                              maxLength={5}
                              placeholder="12345"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Communication Preferences */}
                    <div className="border-t pt-6">
                      <h3 className="font-medium text-[#072948] mb-4">How We'll Keep You Updated</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 mt-0.5 text-[#0095ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <div className="text-sm text-gray-600">
                            <p className="font-medium text-[#072948]">Email Communications</p>
                            <p>We'll send order confirmation, setup details, and important updates to {contactEmail || 'your email'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 mt-0.5 text-[#0095ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div className="text-sm text-gray-600">
                            <p className="font-medium text-[#072948]">Text Message Updates</p>
                            <p>{contactPhone ? `We'll send day-of coordination messages to ${contactPhone}` : 'Add a phone number to receive day-of coordination messages'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 mt-0.5 text-[#0095ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="text-sm text-gray-600">
                            <p className="font-medium text-[#072948]">Communication Schedule</p>
                            <ul className="space-y-1 list-inside">
                              <li>• Order confirmation - Immediate</li>
                              <li>• Setup details - 48 hours before</li>
                              <li>• Technical check reminder - 24 hours before</li>
                              <li>• Day-of coordination - Event day</li>
                            </ul>
                          </div>
                        </div>
                      </div>
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
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" aria-label="Review and checkout">
            <div className="lg:col-span-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <span>Review Order</span>
                    <span className="text-sm font-normal text-[#0095ff]">Step 3 of 3</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Please review your order details before proceeding to checkout.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Event Details Review */}
                    <div>
                      <h3 className="font-medium text-[#072948] mb-3">Event Details</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{eventDate?.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">
                            {formatTimeToAMPM(eventStartTime)} - {formatTimeToAMPM(eventEndTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium text-right">{eventLocation}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Review */}
                    <div>
                      <h3 className="font-medium text-[#072948] mb-3">Contact Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Company:</span>
                          <span className="font-medium">{companyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact:</span>
                          <span className="font-medium">{contactName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{contactEmail}</span>
                        </div>
                        {contactPhone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{contactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Communication Schedule */}
                    <div>
                      <h3 className="font-medium text-[#072948] mb-3">What Happens Next</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ol className="space-y-3 text-sm">
                          <li className="flex items-start gap-3">
                            <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-[#0095ff] text-white font-medium text-xs">
                              1
                            </div>
                            <div>
                              <p className="font-medium text-[#072948]">Immediate</p>
                              <p className="text-gray-600">Order confirmation email with receipt</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-[#0095ff] text-white font-medium text-xs">
                              2
                            </div>
                            <div>
                              <p className="font-medium text-[#072948]">Within 24 Hours</p>
                              <p className="text-gray-600">Our team will review and confirm all details</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-[#0095ff] text-white font-medium text-xs">
                              3
                            </div>
                            <div>
                              <p className="font-medium text-[#072948]">48 Hours Before Event</p>
                              <p className="text-gray-600">Setup schedule and final coordination details</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-[#0095ff] text-white font-medium text-xs">
                              4
                            </div>
                            <div>
                              <p className="font-medium text-[#072948]">Event Day</p>
                              <p className="text-gray-600">On-site coordination and technical support</p>
                            </div>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-6">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="space-y-4">
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
                    </div>

                    {/* Payment Summary */}
                    <div className="border-t pt-4">
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
                    </div>

                    {/* Terms and Checkout */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-600">
                        <p>By clicking "Complete Order" you agree to our <a href="/terms" className="text-[#0095ff] hover:underline">Terms of Service</a> and acknowledge that:</p>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                          <li>50% of the total amount will be charged today</li>
                          <li>The remaining 50% will be charged on the day of delivery</li>
                          <li>Cancellations must be made at least 48 hours before the event</li>
                        </ul>
                      </div>
                      
                      <Button 
                        onClick={handleFakeOrder}
                        className="w-full bg-[#0095ff] text-white hover:bg-[#007acc] h-12 text-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </div>
                        ) : (
                          'Complete Order'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Mobile Navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t lg:hidden">
          <div className="flex justify-between max-w-7xl mx-auto">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="w-[120px]"
            >
              Previous
            </Button>
            <Button
              onClick={handleNextStep}
              className="bg-[#0095ff] text-white hover:bg-[#007acc] w-[120px]"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Desktop Navigation */}
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
            <Button
              onClick={handleNextStep}
              className="bg-[#0095ff] text-white hover:bg-[#007acc] w-[120px]"
            >
              Next
            </Button>
          </section>
        </div>

        {/* Add-ons Modal */}
        {showAddOns && selectedPackageForAddOns && (
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <div className="min-h-screen px-4 text-center">
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              
              <div className="inline-block w-full max-w-5xl p-6 my-8 text-left align-middle bg-gray-50 rounded-lg border border-gray-200 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-[#072948]">
                    Add-ons for {selectedPackageForAddOns.name}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {filteredAddOns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAddOns.map((addon) => (
                      <div 
                        key={addon.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:border-[#0095ff] transition-colors cursor-pointer"
                      >
                        <label className="flex items-start gap-3 w-full">
                          <input
                            type="checkbox"
                            checked={selectedAddOns[selectedPackageForAddOns.id]?.includes(addon.id) || false}
                            onChange={() => handleAddOnToggle(selectedPackageForAddOns.id, addon.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0095ff] focus:ring-[#0095ff] cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-[#072948]">{addon.name}</h4>
                              <div className="text-lg font-bold text-[#072948]">
                                {formatCurrency(addon.price).replace('.00', '')}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{addon.description}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No add-ons available for this package
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 