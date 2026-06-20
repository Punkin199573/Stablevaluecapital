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
        { error: 'Unauthorized' },
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
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service (Resend) not configured' },
        { status: 500 }
      );
    }

    const resend = getResend();
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    let campaignId: string | null = null;
    let targetRecipients: any[] = [];

    // Determine target recipients
    if (testMode && testEmail) {
      // Test mode - send only to specified test email
      targetRecipients = [{ email: testEmail }];
    } else if (recipientEmails && recipientEmails.length > 0) {
      // Custom recipients provided
      targetRecipients = recipientEmails.map((email: string) => ({ email: email.trim() }));
    } else {
      // Default to all newsletter subscribers
      const subscribersResult = await getNewsletterSubscribers();
      if (!subscribersResult.success || !subscribersResult.data) {
        return NextResponse.json(
          { error: 'Failed to fetch subscribers' },
          { status: 500 }
        );
      }
      targetRecipients = subscribersResult.data;
    }

    // Create campaign record (skip for test mode)
    if (!testMode) {
      const campaignResult = await createNewsletterCampaign({
        title,
        content,
        html_content: htmlContent || null,
        status: 'draft',
        recipient_count: targetRecipients.length,
      });

      if (!campaignResult.success || !campaignResult.data?.[0]) {
        return NextResponse.json(
          { error: 'Failed to create campaign' },
          { status: 500 }
        );
      }

      campaignId = campaignResult.data[0].id;
    }

    // Generate emails
    const finalHtml = htmlContent || (useTemplate ? generateMarketingTemplate(content, title) : generateDefaultHtml(content, title));
    const plainText = generatePlainText(content);

    // Send email to each recipient
    for (const recipient of targetRecipients) {
      try {
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
          errors.push(`Failed to send to ${recipient.email}: ${emailResponse.error.message}`);
        } else {
          sentCount++;
        }
      } catch (error) {
        failedCount++;
        errors.push(`Failed to send to ${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update campaign status to sent (skip for test mode)
    if (!testMode && campaignId) {
      await updateCampaignStatus(campaignId, 'sent', sentCount);
    }

    return NextResponse.json({
      success: true,
      ...(campaignId && { campaignId }),
      sent: sentCount,
      failed: failedCount,
      total: targetRecipients.length,
      testMode: testMode || false,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[v0] Newsletter send error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send newsletter' },
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

© 2024 Stable Value Capital. All rights reserved.

To unsubscribe, reply to this email with "UNSUBSCRIBE" in the subject line.`;
}

// Professional marketing template based on Adams Fenton's message
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
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f8fafc;
    }
    /* Client-specific styles */
    #outlook a {
      padding: 0;
    }
    .ReadMsgBody {
      width: 100%;
    }
    .ExternalClass {
      width: 100%;
    }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
      line-height: 100%;
    }
    /* Container styles */
    .container {
      max-width: 680px;
      margin: 0 auto;
    }
    .content-wrapper {
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }
    /* Typography */
    h1 {
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 32px;
      font-weight: 800;
      line-height: 1.2;
      color: #ffffff;
      margin: 0 0 12px 0;
    }
    h2 {
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.3;
      color: #0f172a;
      margin: 0 0 16px 0;
    }
    p {
      font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.7;
      color: #334155;
      margin: 0 0 16px 0;
    }
    /* Button styles */
    .button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: #ffffff;
      text-decoration: none;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
    }
    .button-secondary {
      display: inline-block;
      padding: 12px 24px;
      background: transparent;
      color: #3b82f6;
      text-decoration: none;
      font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 15px;
      font-weight: 600;
      border: 2px solid #3b82f6;
      border-radius: 8px;
    }
    /* Feature box */
    .feature-box {
      background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      border-left: 4px solid #3b82f6;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .feature-icon {
      width: 24px;
      height: 24px;
      background: #3b82f6;
      border-radius: 50%;
      margin-right: 12px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    /* Responsive */
    @media screen and (max-width: 680px) {
      .container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .content-wrapper {
        border-radius: 0 !important;
      }
      .padding-sides {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
      h1 {
        font-size: 24px !important;
      }
      h2 {
        font-size: 20px !important;
      }
      .button {
        width: 100%;
        text-align: center;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${escapeHtml(content.substring(0, 150))}...
  </div>

  <!-- Main container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" class="container">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%); padding: 60px 48px; border-radius: 16px 16px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Logo -->
                    <div style="background: #ffffff; border-radius: 12px; padding: 16px; display: inline-block; margin-bottom: 32px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
                      <span style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 800; color: #0f172a;">SVC</span>
                    </div>
                    <h1 style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 800; color: #ffffff; margin: 0;">
                      ${escapeHtml(title)}
                    </h1>
                    <p style="font-family: 'Open Sans', sans-serif; font-size: 18px; color: #93c5fd; margin: 16px 0 0 0;">
                      Premium Wealth Management & Strategic Investment Solutions
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="background-color: #ffffff; padding: 48px;" class="padding-sides">
              ${formatContent(content)}

              <!-- CTA Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 40px;">
                <tr>
                  <td align="center">
                    <a href="https://www.stablevaluecapital.com/contact" class="button" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Start Your Investment Journey →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td height="20"></td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="mailto:info@stablevaluecapital.com" class="button-secondary" style="color: #3b82f6; text-decoration: none; font-family: 'Open Sans', sans-serif; font-size: 15px; font-weight: 600;">
                      Schedule a Private Consultation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Services highlight -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 48px 48px 48px;" class="padding-sides">
              <div class="feature-box" style="background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); border-radius: 12px; padding: 24px; border-left: 4px solid #3b82f6;">
                <h2 style="font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 20px 0;">
                  Our Services Include:
                </h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="color: #3b82f6; font-weight: 600;">✓</span> <span style="color: #334155; font-family: 'Open Sans', sans-serif; font-size: 15px;">Wealth Management & Portfolio Optimization</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="color: #3b82f6; font-weight: 600;">✓</span> <span style="color: #334155; font-family: 'Open Sans', sans-serif; font-size: 15px;">Project Funding & Capital Allocation</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="color: #3b82f6; font-weight: 600;">✓</span> <span style="color: #334155; font-family: 'Open Sans', sans-serif; font-size: 15px;">Business Loans & Credit Enhancement</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="color: #3b82f6; font-weight: 600;">✓</span> <span style="color: #334155; font-family: 'Open Sans', sans-serif; font-size: 15px;">Private Placements & Strategic Funds</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style="color: #3b82f6; font-weight: 600;">✓</span> <span style="color: #334155; font-family: 'Open Sans', sans-serif; font-size: 15px;">Securities Lending Programs</span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 48px; border-radius: 0 0 16px 16px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0;">
                      Stable Value Capital
                    </p>
                    <p style="font-family: 'Open Sans', sans-serif; font-size: 14px; color: #93c5fd; margin: 0 0 8px 0;">
                      Strategic Capital Management for Discerning Investors
                    </p>
                    <p style="font-family: 'Open Sans', sans-serif; font-size: 14px; color: #60a5fa; margin: 0 0 24px 0;">
                      <a href="https://www.stablevaluecapital.com" style="color: #60a5fa; text-decoration: none;">www.stablevaluecapital.com</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #334155; padding-top: 24px; margin-top: 24px;">
                      <tr>
                        <td align="center">
                          <p style="font-family: 'Open Sans', sans-serif; font-size: 13px; color: #94a3b8; margin: 0 0 8px 0;">
                            📧 info@stablevaluecapital.com &nbsp;&nbsp;|&nbsp;&nbsp; 📞 +1 404 295 8687
                          </p>
                          <p style="font-family: 'Open Sans', sans-serif; font-size: 12px; color: #64748b; margin: 0 0 12px 0;">
                            Hamburg, NY, USA | London, UK | Dubai, UAE
                          </p>
                          <p style="font-family: 'Open Sans', sans-serif; font-size: 11px; color: #475569; margin: 0;">
                            © 2024 Stable Value Capital. All rights reserved.<br>
                            Investment opportunities intended solely for Accredited Investors, Institutional, and Sophisticated Investors.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
          Contact Us Today →
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
        © 2024 Stable Value Capital. All rights reserved.
      </p>
    </div>

  </div>
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
