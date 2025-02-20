import { NextResponse } from 'next/server';
import { sendAdminNotificationEmail, sendCustomerConfirmationEmail } from '@/lib/email-service';

// Only allow POST requests
export async function POST(request: Request) {
  try {
    // Check for development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ 
        success: false, 
        error: 'Test emails can only be sent in development environment' 
      }, { status: 403 });
    }

    const testData = {
      orderNumber: 'TEST-001',
      customerName: 'Test Customer',
      customerEmail: 'stephen+govideopro@bowlescreative.com',
      eventDate: '2024-03-20',
      eventTime: '10:00 AM',
      total: 1000,
      items: [
        {
          name: 'Test Package',
          price: 1000,
          quantity: 1,
          type: 'package'
        }
      ],
      eventDetails: {
        companyName: 'Test Company',
        contactName: 'Test Contact',
        contactEmail: 'test@example.com',
        contactPhone: '123-456-7890',
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345'
      }
    };

    await Promise.all([
      sendCustomerConfirmationEmail(testData),
      sendAdminNotificationEmail(testData)
    ]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test emails sent successfully to both customer and admin' 
    });
  } catch (error) {
    console.error('Error sending test emails:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send test emails',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 