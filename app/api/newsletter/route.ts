import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { addNewsletterSubscriber } from '@/lib/supabase';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Save subscriber to Supabase
    const subscriptionResult = await addNewsletterSubscriber(email);
    if (!subscriptionResult.success) {
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    // Send welcome email using Resend
    const resend = getResend();
    await resend.emails.send({
      from: 'Stable Value Capital <noreply@stablevaluecapital.com>',
      to: email,
      subject: 'Welcome to Stable Value Capital Newsletter',
      html: generateWelcomeEmailHtml(),
      text: generateWelcomeEmailText(),
      replyTo: 'info@stablevaluecapital.com',
    });

    return NextResponse.json(
      { success: true, message: 'Subscription successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

// Helper function to generate welcome email HTML
function generateWelcomeEmailHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to Stable Value Capital</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; }
  </style>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #f8fafc; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 50px 40px; text-align: center;">
              <div style="background: #ffffff; border-radius: 10px; padding: 14px 24px; display: inline-block; margin-bottom: 24px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);">
                <span style="font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 800; color: #0f172a;">SVC</span>
              </div>
              <h1 style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">
                Welcome to Stable Value Capital
              </h1>
              <p style="font-size: 17px; color: #93c5fd; margin: 0;">
                Your Journey to Premium Investments Begins Here
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <p style="font-size: 17px; line-height: 1.7; color: #334155; margin: 0 0 20px 0;">
                Thank you for subscribing to our newsletter. You're now part of an exclusive group receiving:
              </p>

              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #334155;"><span style="color: #3b82f6; font-weight: 600;">✓</span> Investment insights and market analysis</p>
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #334155;"><span style="color: #3b82f6; font-weight: 600;">✓</span> Exclusive private placement opportunities</p>
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #334155;"><span style="color: #3b82f6; font-weight: 600;">✓</span> Wealth management strategies</p>
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #334155;"><span style="color: #3b82f6; font-weight: 600;">✓</span> Project funding updates</p>
                <p style="margin: 0; font-size: 15px; color: #334155;"><span style="color: #3b82f6; font-weight: 600;">✓</span> Market trend reports</p>
              </div>

              <p style="font-size: 17px; line-height: 1.7; color: #334155; margin: 0 0 30px 0;">
                Our team at Stable Value Capital is committed to helping you grow your wealth through strategic investments and expert financial guidance. We send updates once or twice a month, focusing on high-quality opportunities and educational content.
              </p>

              <div style="text-align: center; margin: 40px 0;">
                <a href="https://www.stablevaluecapital.com" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                  Explore Our Services →
                </a>
              </div>

              <p style="font-size: 17px; line-height: 1.7; color: #334155; margin: 0;">
                Have questions? Simply reply to any of our emails, and our team will personally respond.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 40px; text-align: center;">
              <p style="font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">
                Stable Value Capital
              </p>
              <p style="font-size: 14px; color: #93c5fd; margin: 0 0 16px 0;">
                Strategic Capital Management for Discerning Investors
              </p>
              <p style="font-size: 14px; color: #60a5fa; margin: 0 0 16px 0;">
                <a href="https://www.stablevaluecapital.com" style="color: #60a5fa; text-decoration: none;">www.stablevaluecapital.com</a>
              </p>
              <p style="font-size: 12px; color: #64748b; margin: 0;">
                📧 info@stablevaluecapital.com &nbsp;|&nbsp; 📞 +1 404 295 8687 | +44 7342 300335<br><br>
                © 2024 Stable Value Capital. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Helper function to generate welcome email plain text
function generateWelcomeEmailText(): string {
  return `Welcome to Stable Value Capital

Thank you for subscribing to our newsletter. You're now part of an exclusive group receiving:

• Investment insights and market analysis
• Exclusive private placement opportunities
• Wealth management strategies
• Project funding updates
• Market trend reports

Our team at Stable Value Capital is committed to helping you grow your wealth through strategic investments and expert financial guidance. We send updates once or twice a month, focusing on high-quality opportunities and educational content.

Have questions? Simply reply to any of our emails, and our team will personally respond.

---
Stable Value Capital
Strategic Capital Management for Discerning Investors
Website: https://www.stablevaluecapital.com
Email: info@stablevaluecapital.com
Phone: +1 404 295 8687 | UK: +44 7342 300335

© 2024 Stable Value Capital. All rights reserved.`;
}
