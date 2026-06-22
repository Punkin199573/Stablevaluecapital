import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase';

function getEmailClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('Email service not configured');
  }
  return new Resend(key);
}

function verifyAdminToken(token: string): boolean {
  const adminToken = process.env.ADMIN_NEWSLETTER_TOKEN || process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  return !!adminToken && token === adminToken;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const emailClient = getEmailClient();
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const emailId = searchParams.get('emailId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    // If specific email requested
    if (emailId) {
      const { data, error } = await emailClient.emails.get(emailId);
      if (error) {
        return NextResponse.json({ error: 'Failed to fetch email details' }, { status: 400 });
      }
      return NextResponse.json({ success: true, email: data });
    }

    // Get emails with pagination
    let allEmails: any[] = [];
    let afterId: string | undefined = undefined;
    const maxPages = 10; // Fetch up to 1000 emails max

    for (let i = 0; i < maxPages; i++) {
      const listParams: any = { limit: 100 };
      if (afterId) {
        listParams.after = afterId;
      }

      const { data: emailsResult, error: listError } = await emailClient.emails.list(listParams);

      if (listError) {
        console.error('[Analytics] Error listing emails:', listError);
        break;
      }

      if (emailsResult?.data && emailsResult.data.length > 0) {
        allEmails = allEmails.concat(emailsResult.data);
        afterId = emailsResult.data[emailsResult.data.length - 1].id;
        if (emailsResult.data.length < 100) break;
      } else {
        break;
      }
    }

    // Get campaigns with analytics from database
    const { data: campaigns, error: campaignError } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (campaignError) {
      console.error('[Analytics] Error fetching campaigns:', campaignError);
    }

    // Calculate aggregate stats from database (more accurate)
    const { data: dbStats } = await supabase
      .from('newsletter_campaigns')
      .select('sent_count, failed_count, opens_count, clicks_count, delivered_count, bounced_count, complained_count')
      .eq('status', 'sent');

    const stats = {
      totalSent: dbStats?.reduce((sum: number, c: any) => sum + (c.sent_count || 0), 0) || allEmails.length,
      delivered: dbStats?.reduce((sum: number, c: any) => sum + (c.delivered_count || 0), 0) || 0,
      bounced: dbStats?.reduce((sum: number, c: any) => sum + (c.bounced_count || 0), 0) || 0,
      opened: dbStats?.reduce((sum: number, c: any) => sum + (c.opens_count || 0), 0) || 0,
      clicked: dbStats?.reduce((sum: number, c: any) => sum + (c.clicks_count || 0), 0) || 0,
      complained: dbStats?.reduce((sum: number, c: any) => sum + (c.complained_count || 0), 0) || 0,
    };

    // If specific campaign, get detailed analytics
    let campaignAnalytics = null;
    let emailLogs: any[] = [];

    if (campaignId) {
      // Get tracking data for campaign
      const { data: trackingData, error: trackingError } = await supabase
        .from('email_tracking')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (!trackingError && trackingData) {
        emailLogs = trackingData.map((t: any) => ({
          id: t.id,
          email: t.recipient_email,
          status: t.status,
          sentAt: t.created_at,
          deliveredAt: t.delivered_at,
          openedAt: t.opened_at,
          clickedAt: t.clicked_at,
          bouncedAt: t.bounced_at,
        }));

        campaignAnalytics = {
          totalTracked: trackingData.length,
          delivered: trackingData.filter((t: any) => ['delivered', 'opened', 'clicked'].includes(t.status)).length,
          opened: trackingData.filter((t: any) => ['opened', 'clicked'].includes(t.status)).length,
          clicked: trackingData.filter((t: any) => t.status === 'clicked').length,
          bounced: trackingData.filter((t: any) => t.status === 'bounced').length,
          failed: trackingData.filter((t: any) => ['bounced', 'failed'].includes(t.status)).length,
        };
      }

      // Get campaign details
      const { data: campaignData } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignData) {
        campaignAnalytics = {
          ...campaignAnalytics,
          sentCount: campaignData.sent_count || 0,
          failedCount: campaignData.failed_count || 0,
          opensCount: campaignData.opens_count || 0,
          clicksCount: campaignData.clicks_count || 0,
          deliveredCount: campaignData.delivered_count || 0,
          bouncedCount: campaignData.bounced_count || 0,
          title: campaignData.title,
          createdAt: campaignData.created_at,
          sentAt: campaignData.sent_at,
        };
      }
    }

    // Build email logs from all emails if no campaign specified
    if (!campaignId && allEmails.length > 0) {
      emailLogs = allEmails.slice(0, 200).map((email: any) => ({
        id: email.id,
        email: email.to?.[0] || 'Unknown',
        subject: email.subject || 'No Subject',
        status: email.last_event || 'sent',
        sentAt: email.created_at,
      }));
    }

    return NextResponse.json({
      success: true,
      stats,
      campaigns: campaigns || [],
      campaignAnalytics,
      emailLogs,
      totalPages: Math.ceil(allEmails.length / limit),
    });
  } catch (error) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Sync analytics for a campaign (batch processing)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, emailIds } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    const emailClient = getEmailClient();
    const supabase = getSupabaseAdmin();

    // Get all tracking records for this campaign
    const { data: trackingRecords, error: trackError } = await supabase
      .from('email_tracking')
      .select('id, resend_email_id, recipient_email')
      .eq('campaign_id', campaignId);

    if (trackError || !trackingRecords || trackingRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No emails to sync',
        analytics: { delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 }
      });
    }

    let delivered = 0, opened = 0, clicked = 0, bounced = 0, complained = 0;
    const batchSize = 50;

    // Process in batches
    for (let i = 0; i < trackingRecords.length; i += batchSize) {
      const batch = trackingRecords.slice(i, i + batchSize);

      for (const record of batch) {
        try {
          if (!record.resend_email_id) continue;

          const { data: emailData, error } = await emailClient.emails.get(record.resend_email_id);
          if (error || !emailData) continue;

          const lastEvent = (emailData as any).last_event || 'sent';

          switch (lastEvent) {
            case 'delivered':
              delivered++;
              break;
            case 'opened':
              delivered++;
              opened++;
              break;
            case 'clicked':
              delivered++;
              opened++;
              clicked++;
              break;
            case 'bounced':
              bounced++;
              break;
            case 'complained':
              complained++;
              delivered++;
              break;
          }

          // Update tracking record
          await supabase
            .from('email_tracking')
            .update({
              status: lastEvent,
              delivered_at: ['delivered', 'opened', 'clicked'].includes(lastEvent) ? new Date().toISOString() : null,
              opened_at: ['opened', 'clicked'].includes(lastEvent) ? new Date().toISOString() : null,
              clicked_at: lastEvent === 'clicked' ? new Date().toISOString() : null,
              bounced_at: lastEvent === 'bounced' ? new Date().toISOString() : null,
            })
            .eq('id', record.id);

        } catch (e) {
          console.error('[Analytics] Error syncing email:', record.resend_email_id, e);
        }
      }
    }

    // Update campaign analytics
    await supabase
      .from('newsletter_campaigns')
      .update({
        delivered_count: delivered,
        opens_count: opened,
        clicks_count: clicked,
        bounced_count: bounced,
        complained_count: complained,
        last_analytics_sync: new Date().toISOString(),
      })
      .eq('id', campaignId);

    return NextResponse.json({
      success: true,
      analytics: { delivered, opened, clicked, bounced, complained },
      totalProcessed: trackingRecords.length,
    });
  } catch (error) {
    console.error('[Analytics] Sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync analytics' },
      { status: 500 }
    );
  }
}
