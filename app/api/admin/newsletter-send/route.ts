import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getNewsletterSubscribers, updateCampaignStatus, createNewsletterCampaign } from '@/lib/supabase';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(key);
}

// Helper to verify admin token
function verifyAdminToken(token: string): boolean {
  const adminToken = process.env.ADMIN_NEWSLETTER_TOKEN || process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  return !!adminToken && token === adminToken;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, htmlContent, testMode, testEmail, recipientEmails, useTemplate } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing title or content' },
        { status: 400 }
      );
    }

    // Validate Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('[Newsletter] RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service (Resend) not configured. Please add RESEND_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    console.log('[Newsletter] Starting send process...');
    console.log('[Newsletter] Title:', title);
    console.log('[Newsletter] Test mode:', testMode);

    const resend = getResend();
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    let campaignId: string | null = null;
    let targetRecipients: { email: string }[] = [];

    // Determine target recipients
    if (testMode && testEmail) {
      // Test mode - send only to specified test email
      targetRecipients = [{ email: testEmail }];
      console.log('[Newsletter] Test mode - sending to:', testEmail);
    } else if (recipientEmails && Array.isArray(recipientEmails) && recipientEmails.length > 0) {
      // Custom recipients provided
      targetRecipients = recipientEmails.map((email: string) => ({ email: email.trim() })).filter(r => r.email);
      console.log('[Newsletter] Custom recipients:', targetRecipients.length);
    } else {
      // Default to all newsletter subscribers
      console.log('[Newsletter] Fetching subscribers...');
      const subscribersResult = await getNewsletterSubscribers();
      console.log('[Newsletter] Subscribers result:', subscribersResult.success, subscribersResult.data?.length);

      if (subscribersResult.success && subscribersResult.data && subscribersResult.data.length > 0) {
        targetRecipients = subscribersResult.data.map((s: any) => ({ email: s.email }));
      } else {
        return NextResponse.json(
          { error: 'No subscribers found. Add subscribers to your newsletter or provide custom email recipients.' },
          { status: 400 }
        );
      }
    }

    if (targetRecipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients to send to' },
        { status: 400 }
      );
    }

    console.log('[Newsletter] Total recipients:', targetRecipients.length);

    // Create campaign record (skip for test mode)
    if (!testMode) {
      console.log('[Newsletter] Creating campaign record...');
      const campaignResult = await createNewsletterCampaign({
        title,
        content,
        html_content: htmlContent || null,
        status: 'sending',
        recipient_count: targetRecipients.length,
      });

      if (campaignResult.success && campaignResult.data?.[0]) {
        campaignId = campaignResult.data[0].id;
        console.log('[Newsletter] Campaign created:', campaignId);
      } else {
        console.error('[Newsletter] Failed to create campaign:', campaignResult.error);
        // Continue anyway - don't block sending if campaign tracking fails
      }
    }

    // Generate emails
    const finalHtml = htmlContent || (useTemplate ? generateMarketingTemplate(content, title) : generateDefaultHtml(content, title));
    const plainText = generatePlainText(content);

    console.log('[Newsletter] Sending emails...');

    // Send email to each recipient (limit to prevent timeout)
    const maxRecipients = 50; // Process in batches
    const recipientsToSend = targetRecipients.slice(0, maxRecipients);

    for (const recipient of recipientsToSend) {
      try {
        console.log('[Newsletter] Sending to:', recipient.email);
        const emailResponse = await resend.emails.send({
          from: 'Stable Value Capital <noreply@stablevaluecapital.com>',
          to: recipient.email,
          subject: title,
          html: finalHtml,
          text: plainText,
          replyTo: 'info@stablevaluecapital.com',
        });

        if (emailResponse.error) {
          failedCount++;
          const errorMsg = `Failed to send to ${recipient.email}: ${emailResponse.error.message}`;
          errors.push(errorMsg);
          console.error('[Newsletter]', errorMsg);
        } else {
          sentCount++;
          console.log('[Newsletter] Sent successfully to:', recipient.email);
        }
      } catch (error) {
        failedCount++;
        const errorMsg = `Failed to send to ${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error('[Newsletter]', errorMsg);
      }
    }

    console.log('[Newsletter] Send complete. Sent:', sentCount, 'Failed:', failedCount);

    // Update campaign status (skip for test mode)
    if (!testMode && campaignId) {
      await updateCampaignStatus(campaignId, 'sent', sentCount);
      console.log('[Newsletter] Campaign status updated');
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: recipientsToSend.length,
      totalRecipients: targetRecipients.length,
      testMode: testMode || false,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[Newsletter] Send error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send newsletter',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Generate plain text version
function generatePlainText(content: string): string {
  return `${content}

---
Stable Value Capital
Premium Wealth Management & Strategic Investment Solutions
Website: https://www.stablevaluecapital.com
Email: info@stablevaluecapital.com
Phone: +1 404 295 8687

(c) 2024 Stable Value Capital. All rights reserved.

To unsubscribe, reply to this email with "UNSUBSCRIBE" in the subject line.`;
}

// Helper function to format content with paragraphs
function formatContent(content: string): string {
  const paragraphs = content.split('\n').filter(line => line.trim());
  return paragraphs.map(p => `<p style="font-family: 'Open Sans', -apple-system, sans-serif; font-size: 16px; line-height: 1.7; color: #334155; margin: 0 0 16px 0;">${escapeHtml(p.trim())}</p>`).join('\n');
}

// Default simple HTML template
function generateDefaultHtml(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #f8fafc; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 40px 32px; text-align: center;">
      <div style="background: #ffffff; border-radius: 8px; padding: 12px 20px; display: inline-block; margin-bottom: 20px;">
        <span style="font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 800; color: #0f172a;">SVC</span>
      </div>
      <h1 style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; margin: 0;">
        ${escapeHtml(title)}
      </h1>
      <p style="font-size: 16px; color: #93c5fd; margin: 12px 0 0 0;">
        Stable Value Capital
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 32px;">
      ${formatContent(content)}

      <!-- CTA -->
      <div style="text-align: center; margin-top: 32px; padding-top: 32px; border-top: 1px solid #e2e8f0;">
        <a href="https://www.stablevaluecapital.com/contact" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 600; border-radius: 8px;">
          Contact Us Today
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-family: 'Open Sans', sans-serif; font-size: 14px; color: #64748b; margin: 0 0 8px 0;">
        <strong>Stable Value Capital</strong><br>
        Premium Wealth Management
      </p>
      <p style="font-size: 13px; color: #3b82f6; margin: 0 0 12px 0;">
        <a href="https://www.stablevaluecapital.com" style="color: #3b82f6; text-decoration: none;">www.stablevaluecapital.com</a>
      </p>
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        (c) 2024 Stable Value Capital. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>`;
}

// Professional marketing template
function generateMarketingTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #f8fafc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 50px 40px; text-align: center;">
              <div style="background: #ffffff; border-radius: 10px; padding: 14px 24px; display: inline-block; margin-bottom: 24px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);">
                <span style="font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 800; color: #0f172a;">SVC</span>
              </div>
              <h1 style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">
                ${escapeHtml(title)}
              </h1>
              <p style="font-size: 17px; color: #93c5fd; margin: 0;">
                Premium Wealth Management & Strategic Investment Solutions
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              ${formatContent(content)}

              <!-- CTA -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://www.stablevaluecapital.com/contact" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                  Start Your Investment Journey
                </a>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <a href="mailto:info@stablevaluecapital.com" style="color: #3b82f6; text-decoration: none; font-family: 'Open Sans', sans-serif; font-size: 15px; font-weight: 600;">
                  Schedule a Private Consultation
                </a>
              </div>
            </td>
          </tr>

          <!-- Services -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); border-radius: 12px; padding: 24px; border-left: 4px solid #3b82f6;">
                <h2 style="font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 20px 0;">
                  Our Services Include:
                </h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr><td style="padding-bottom: 12px;"><span style="color: #3b82f6; font-weight: 600;">&#10003;</span> <span style="color: #334155; font-family: 'Open Sans', sans-serif; font-size: 15px;">Wealth Management & Portfolio Optimization</span></td></tr>
                  <tr><td style="padding-bottom: 12px;"><span style="color: #3b82f6; font-weight: 600;">&#10003;</span> <span style="color: #334155; font-family: 'Open Sans', sans-serif; font-size: 15px;">Project Funding & Capital Allocation</span></td></tr>
                  <tr><td style="padding-bottom: 12px;"><span style="color: #3b82f6; font-weight: 600;">&#10003;</span> <span style="color: #334155; font-family: 'Open Sans', sans-serif; font-size: 15px;">Business Loans & Credit Enhancement</span></td></tr>
                  <tr><td style="padding-bottom: 12px;"><span style="color: #3b82f6; font-weight: 600;">&#10003;</span> <span style="color: #334155; font-family: 'Open Sans', sans-serif; font-size: 15px;">Private Placements & Strategic Funds</span></td></tr>
                  <tr><td><span style="color: #3b82f6; font-weight: 600;">&#10003;</span> <span style="color: #334155; font-family: 'Open Sans', sans-serif; font-size: 15px;">Securities Lending Programs</span></td></tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 40px; text-align: center;">
              <p style="font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0;">
                Stable Value Capital
              </p>
              <p style="font-family: 'Open Sans', sans-serif; font-size: 14px; color: #93c5fd; margin: 0 0 8px 0;">
                Strategic Capital Management for Discerning Investors
              </p>
              <p style="font-family: 'Open Sans', sans-serif; font-size: 14px; color: #60a5fa; margin: 0 0 24px 0;">
                <a href="https://www.stablevaluecapital.com" style="color: #60a5fa; text-decoration: none;">www.stablevaluecapital.com</a>
              </p>
              <div style="border-top: 1px solid #334155; padding-top: 24px; margin-top: 24px;">
                <p style="font-family: 'Open Sans', sans-serif; font-size: 13px; color: #94a3b8; margin: 0 0 8px 0;">
                  Email: info@stablevaluecapital.com | Phone: +1 404 295 8687
                </p>
                <p style="font-family: 'Open Sans', sans-serif; font-size: 12px; color: #64748b; margin: 0 0 12px 0;">
                  Hamburg, NY, USA | London, UK | Dubai, UAE
                </p>
                <p style="font-family: 'Open Sans', sans-serif; font-size: 11px; color: #475569; margin: 0;">
                  (c) 2024 Stable Value Capital. All rights reserved.<br>
                  Investment opportunities intended solely for Accredited Investors, Institutional, and Sophisticated Investors.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
