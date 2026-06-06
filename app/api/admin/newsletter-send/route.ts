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
    const { title, content, htmlContent, testMode, testEmail, recipientEmails } = body;

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

    // Send email to each recipient
    for (const recipient of targetRecipients) {
      try {
        const emailResponse = await resend.emails.send({
          from: 'Stable Value Capital <noreply@stablevaluecapital.com>',
          to: recipient.email,
          subject: title,
          html: htmlContent || generateDefaultHtml(content),
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

// Helper function to generate default HTML from plain text
function generateDefaultHtml(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0066FF 0%, #00FFFF 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-bottom: 30px; }
          .footer { text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Stable Value Capital</h1>
            <p style="margin: 10px 0 0 0;">Premium Wealth Management</p>
          </div>
          <div class="content">
            ${content.split('\n').map(line => line.trim() ? `<p>${escapeHtml(line)}</p>` : '').join('')}
          </div>
          <div class="footer">
            <p>Stable Value Capital | London, United Kingdom<br>
            © 2024 Stable Value Capital. All rights reserved.<br>
            <a href="mailto:unsubscribe@stablevaluecapital.com" style="color: #0066FF; text-decoration: none;">Unsubscribe</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
