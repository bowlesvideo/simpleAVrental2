import { Resend } from 'resend';
import { format } from 'date-fns';

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
    type: string;
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
    const eventDate = new Date(data.eventDate);
    const dateInfo = {
      dayName: format(eventDate, 'EEEE'),
      month: format(eventDate, 'MMMM'),
      day: format(eventDate, 'd'),
      year: format(eventDate, 'yyyy')
    };

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; }
            .header { background-color: #072948; color: white; padding: 40px; }
            .logo { height: 40px; margin-bottom: 20px; }
            .content { padding: 40px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; }
            .table td { padding: 12px; border-bottom: 1px solid #eee; }
            .table tr:last-child td { border-bottom: none; }
            .amount-due { background: #072948; color: white; padding: 20px; text-align: right; margin-top: 20px; }
            .payment-info { background: #e8f0fe; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .event-details { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; font-size: 14px; color: #666; text-align: center; }
            .total-row td { border-top: 2px solid #072948; font-weight: bold; }
            .section-title { color: #072948; font-size: 18px; font-weight: 600; margin-bottom: 15px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .details-table td { padding: 8px 0; vertical-align: top; }
            .details-table td:first-child { color: #666; width: 120px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://govideopro.com/images/videopro_logo_blue.png" alt="Go Video Pro" class="logo">
              <h1 style="margin: 0;">Order Confirmation</h1>
              <div style="margin-top: 10px; font-size: 14px;">Invoice #${data.orderNumber}</div>
            </div>

            <div class="content">
              <div class="event-details">
                <div class="section-title">Event & Billing Details</div>
                <div class="grid-2">
                  <div>
                    <table class="details-table" style="width: 100%;">
                      <tr>
                        <td><strong>Date:</strong></td>
                        <td>${dateInfo.dayName}, ${dateInfo.month} ${dateInfo.day}, ${dateInfo.year}</td>
                      </tr>
                      <tr>
                        <td><strong>Time:</strong></td>
                        <td>${data.eventTime}</td>
                      </tr>
                      <tr>
                        <td><strong>Location:</strong></td>
                        <td>${data.eventDetails.street}<br>${data.eventDetails.city}, ${data.eventDetails.state} ${data.eventDetails.zip}</td>
                      </tr>
                    </table>
                  </div>
                  <div>
                    <table class="details-table" style="width: 100%;">
                      <tr>
                        <td><strong>Bill To:</strong></td>
                        <td>
                          ${data.eventDetails.companyName}<br>
                          ${data.eventDetails.contactName}<br>
                          ${data.eventDetails.contactEmail}<br>
                          ${data.eventDetails.contactPhone}
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>

              <table class="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.items.filter(item => item.type === 'package').map(item => `
                    <tr>
                      <td>
                        <strong>${item.name}</strong>
                        <div style="font-size: 14px; color: #666;">Package</div>
                      </td>
                      <td style="text-align: center;">${item.quantity}</td>
                      <td style="text-align: right;">$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style="text-align: right;">$${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                  
                  ${data.items.filter(item => item.type === 'addon').map(item => `
                    <tr>
                      <td>
                        ${item.name}
                        <div style="font-size: 14px; color: #666;">Add-on</div>
                      </td>
                      <td style="text-align: center;">${item.quantity}</td>
                      <td style="text-align: right;">$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style="text-align: right;">$${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                  
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Total</td>
                    <td style="text-align: right;">$${data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>

              <div class="payment-info">
                <div class="section-title">Payment Schedule</div>
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">Initial Payment (50%)</td>
                    <td style="text-align: right; color: #0a0;">✓ PAID</td>
                    <td style="text-align: right;">$${(data.total / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">Balance Due (After Event)</td>
                    <td style="text-align: right;">Due on completion</td>
                    <td style="text-align: right;">$${(data.total / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </table>
              </div>

              <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <div class="section-title">Important Information</div>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Our team will contact you within 24-48 hours to discuss event details</li>
                  <li>Setup begins 1 hour before event time</li>
                  <li>Technical support is available throughout your event</li>
                  <li>Final edited content will be delivered within 14 business days</li>
                  <li>Cancellation policy: Full refund if cancelled 30 days before event</li>
                </ul>
              </div>

              <div class="footer">
                <div style="margin-bottom: 15px;">Thank you for choosing Go Video Pro!</div>
                <div style="font-size: 12px; color: #666;">
                  Questions? Contact us at support@govideopro.com or call +1 (555) 123-4567
                </div>
                <div style="margin-top: 15px; font-size: 12px; color: #999;">
                  Reference: #${data.orderNumber}
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
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