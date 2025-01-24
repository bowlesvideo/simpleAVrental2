import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendCustomerConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email-service'
import { format } from 'date-fns'
import { testConnection } from '@/lib/db-test'
import { generateOrderId } from '@/lib/utils'

export async function POST(request: Request) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers, status: 204 })
  }

  try {
    // Test database connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      console.error('Failed to connect to database')
      return new NextResponse(
        JSON.stringify({ error: 'Database connection failed' }),
        { status: 500, headers }
      )
    }
    console.log('Database connection successful')

    // Parse request body
    let body
    try {
      const text = await request.text()
      console.log('Raw request body:', text)
      body = JSON.parse(text)
      console.log('Parsed request body:', body)
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers }
      )
    }

    const { items, eventDate, eventStartTime, eventEndTime, eventLocation, contactDetails, total } = body
    console.log('Extracted fields:', {
      items: Array.isArray(items) ? `Array of ${items.length} items` : typeof items,
      eventDate,
      eventStartTime,
      eventEndTime,
      eventLocation,
      contactDetails: contactDetails ? 'present' : 'missing',
      total
    })

    // Validate required fields
    if (!items || !eventDate || !eventStartTime || !eventEndTime || !contactDetails || total === undefined) {
      const missingFields = {
        items: !items,
        eventDate: !eventDate,
        eventStartTime: !eventStartTime,
        eventEndTime: !eventEndTime,
        contactDetails: !contactDetails,
        total: total === undefined
      }
      console.error('Missing required fields:', missingFields)
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields', details: missingFields }),
        { status: 400, headers }
      )
    }

    // Validate data types
    if (!Array.isArray(items)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid data type', details: 'items must be an array' }),
        { status: 400, headers }
      )
    }

    const orderId = generateOrderId()
    console.log('Generated order ID:', orderId)
    
    try {
      // Log the data we're about to save
      const orderData = {
        id: orderId,
        orderDate: new Date(),
        eventDate: new Date(eventDate),
        total: Number(total),
        status: 'pending',
        items: JSON.stringify(items),
        eventDetails: JSON.stringify({
          eventStartTime,
          eventEndTime,
          eventLocation,
          ...contactDetails
        }),
        updatedAt: new Date()
      }
      console.log('Attempting to create order with data:', JSON.stringify(orderData, null, 2))

      // Create order
      const order = await prisma.order.create({
        data: orderData
      })
      console.log('Order created successfully:', order)

      // Prepare email data
      const emailData = {
        orderNumber: order.id,
        customerName: contactDetails.contactName,
        customerEmail: contactDetails.contactEmail,
        eventDate: format(new Date(eventDate), 'MMMM d, yyyy'),
        eventTime: `${eventStartTime} to ${eventEndTime}`,
        total,
        items,
        eventDetails: contactDetails
      }

      // Send confirmation emails
      try {
        console.log('Attempting to send confirmation emails')
        await Promise.all([
          sendCustomerConfirmationEmail(emailData),
          sendAdminNotificationEmail(emailData)
        ])
        console.log('Confirmation emails sent successfully')
        
        return new NextResponse(
          JSON.stringify({ 
            ...order,
            message: 'Order created and confirmation emails sent'
          }),
          { status: 200, headers }
        )
      } catch (emailError) {
        console.error('Error sending confirmation emails:', emailError)
        return new NextResponse(
          JSON.stringify({
            ...order,
            warning: 'Order created but confirmation emails failed to send'
          }),
          { status: 200, headers }
        )
      }
    } catch (dbError: any) {
      console.error('Database error:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
        stack: dbError.stack
      })
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database error',
          message: dbError?.message || 'Failed to create order in database',
          code: dbError?.code,
          meta: dbError?.meta
        }),
        { status: 500, headers }
      )
    }
  } catch (error: any) {
    console.error('Server error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    })
    return new NextResponse(
      JSON.stringify({ 
        error: 'Server error',
        message: error?.message || 'Unknown error occurred',
        name: error?.name,
        cause: error?.cause
      }),
      { status: 500, headers }
    )
  }
} 