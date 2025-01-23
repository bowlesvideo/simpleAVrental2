import { Resend } from 'resend';

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

// Get email addresses from environment variables with fallbacks for development
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const FROM_EMAIL = process.env.FROM_EMAIL || '';

// Validate environment variables
if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set in environment variables');
}

if (!ADMIN_EMAIL) {
  console.error('ADMIN_EMAIL is not set in environment variables');
}

if (!FROM_EMAIL) {
  console.error('FROM_EMAIL is not set in environment variables');
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  eventDate: string;
  eventTime: string;
  total: number;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  eventDetails: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export async function sendCustomerConfirmationEmail(data: OrderEmailData) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Dear ${data.customerName},</p>
        <p>We're excited to confirm your AV equipment rental order. Here are your order details:</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <h2 style="color: #2962b8; margin-bottom: 15px;">Order Summary</h2>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Event Date:</strong> ${data.eventDate}</p>
          <p><strong>Event Time:</strong> ${data.eventTime}</p>
          
          <h3 style="margin-top: 20px;">Items Ordered:</h3>
          ${data.items.map(item => `
            <div style="margin: 10px 0;">
              <p style="margin: 5px 0;">
                ${item.name} - $${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          `).join('')}
          
          <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
            <p><strong>Total Amount:</strong> $${data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Initial Payment:</strong> $${(data.total / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (50% deposit)</p>
            <p><strong>Remaining Balance:</strong> $${(data.total / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (due after completion)</p>
          </div>
        </div>
        
        <h3>Event Details:</h3>
        <p>Company: ${data.eventDetails.companyName}</p>
        <p>Contact: ${data.eventDetails.contactName}</p>
        <p>Phone: ${data.eventDetails.contactPhone}</p>
        <p>Location: ${data.eventDetails.street}, ${data.eventDetails.city}, ${data.eventDetails.state} ${data.eventDetails.zip}</p>
        
        <p style="margin-top: 20px;">
          If you have any questions about your order, please don't hesitate to contact us.
        </p>
        
        <p style="margin-top: 20px; color: #666;">
          Thank you for choosing our services!
        </p>
      `,
    });
  } catch (error) {
    console.error('Error sending customer confirmation email:', error);
    throw error;
  }
}

export async function sendAdminNotificationEmail(data: OrderEmailData) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Order Received - ${data.orderNumber}`,
      html: `
        <h1>New Order Received</h1>
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <h2 style="color: #2962b8; margin-bottom: 15px;">Order Details</h2>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Email:</strong> ${data.customerEmail}</p>
          <p><strong>Phone:</strong> ${data.eventDetails.contactPhone}</p>
          
          <h3 style="margin-top: 20px;">Event Information:</h3>
          <p><strong>Date:</strong> ${data.eventDate}</p>
          <p><strong>Time:</strong> ${data.eventTime}</p>
          <p><strong>Company:</strong> ${data.eventDetails.companyName}</p>
          <p><strong>Location:</strong> ${data.eventDetails.street}, ${data.eventDetails.city}, ${data.eventDetails.state} ${data.eventDetails.zip}</p>
          
          <h3 style="margin-top: 20px;">Order Items:</h3>
          ${data.items.map(item => `
            <div style="margin: 10px 0;">
              <p style="margin: 5px 0;">
                ${item.name} - $${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} x ${item.quantity}
              </p>
            </div>
          `).join('')}
          
          <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
            <p><strong>Total Amount:</strong> $${data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Initial Payment:</strong> $${(data.total / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Remaining Balance:</strong> $${(data.total / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw error;
  }
} 