import { NextResponse } from 'next/server';
import { sendContactFormEmails } from '@/lib/email-service';

export async function POST() {
  try {
    // Check for development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ 
        success: false, 
        error: 'Test emails can only be sent in development environment' 
      }, { status: 403 });
    }

    const testData = {
      name: 'Test User',
      email: process.env.ADMIN_EMAIL || '',  // Send to admin email for testing
      company: 'Test Company',
      message: 'This is a test message from the contact form with our new styling.\n\nTesting multiple paragraphs and formatting to ensure the layout looks good.\n\nBest regards,\nTest User'
    };

    await sendContactFormEmails(testData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test contact form emails sent successfully' 
    });
  } catch (error) {
    console.error('Error sending test contact form emails:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send test emails',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 