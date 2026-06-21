import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
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

    const resend = getResend();
    const supabase = getSupabaseAdmin();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const emailId = searchParams.get('emailId');

    // If specific email requested
    if (emailId) {
      const { data, error } = await resend.emails.get(emailId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, email: data });
    }

    // Get recent emails from Resend
    const { data: emailsResult, error: listError } = await resend.emails.list({ limit: 100 });

    if (listError) {
      console.error('[Analytics] Error listing emails:', listError);
      return NextResponse.json({ error: 'Failed to fetch emails from Resend' }, { status: 500 });
    }

    // Get campaigns with analytics
    const { data: campaigns, error: campaignError } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (campaignError) {
      console.error('[Analytics] Error fetching campaigns:', campaignError);
    }

    // Calculate aggregate stats
    const stats = {
      totalSent: emailsResult?.data?.length || 0,
      delivered: 0,
      bounced: 0,
      opened: 0,
      clicked: 0,
      complained: 0,
    };

    // Count email statuses
    const emailStatusCounts: Record<string, number> = {};
    emailsResult?.data?.forEach((email: any) => {
      const lastEvent = email.last_event || 'sent';
      emailStatusCounts[lastEvent] = (emailStatusCounts[lastEvent] || 0) + 1;

      switch (lastEvent) {
        case 'delivered':
          stats.delivered++;
          break;
        case 'bounced':
          stats.bounced++;
          break;
        case 'opened':
          stats.opened++;
          stats.delivered++; // opened implies delivered
          break;
        case 'clicked':
          stats.clicked++;
          stats.opened++; // clicked implies opened
          stats.delivered++;
          break;
        case 'complained':
          stats.complained++;
          break;
      }
    });

    // If specific campaign, get detailed analytics
    let campaignAnalytics = null;
    if (campaignId) {
      // Fetch detailed email info for campaign
      const { data: trackingData, error: trackingError } = await supabase
        .from('email_tracking')
        .select('*')
        .eq('campaign_id', campaignId);

      if (!trackingError && trackingData && trackingData.length > 0) {
        campaignAnalytics = {
          totalTracked: trackingData.length,
          delivered: trackingData.filter((t: any) => t.status === 'delivered' || t.status === 'opened' || t.status === 'clicked').length,
          opened: trackingData.filter((t: any) => t.status === 'opened' || t.status === 'clicked').length,
          clicked: trackingData.filter((t: any) => t.status === 'clicked').length,
          bounced: trackingData.filter((t: any) => t.status === 'bounced').length,
        };
      }

      // Get campaign with updated analytics
      const { data: campaignData } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignData) {
        campaignAnalytics = {
          ...campaignAnalytics,
          sentCount: campaignData.sent_count,
          failedCount: campaignData.failed_count,
          opensCount: campaignData.opens_count,
          clicksCount: campaignData.clicks_count,
        };
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      emailStatusCounts,
      campaigns: campaigns || [],
      campaignAnalytics,
    });
  } catch (error) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Sync analytics from Resend for a specific campaign
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, resendEmailIds } = body;

    if (!campaignId || !resendEmailIds || !Array.isArray(resendEmailIds)) {
      return NextResponse.json({ error: 'Campaign ID and email IDs required' }, { status: 400 });
    }

    const resend = getResend();
    const supabase = getSupabaseAdmin();

    let delivered = 0,
      opened = 0,
      clicked = 0,
      bounced = 0,
      complained = 0;

    // Fetch status for each email
    for (const emailId of resendEmailIds.slice(0, 50)) {
      try {
        const { data: emailData, error } = await resend.emails.get(emailId);
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

        // Upsert tracking record
        const recipientEmail = (emailData as any).to?.[0] || 'unknown';
        await supabase.from('email_tracking').upsert(
          {
            campaign_id: campaignId,
            resend_email_id: emailId,
            recipient_email: recipientEmail,
            status: lastEvent,
            delivered_at: lastEvent === 'delivered' ? new Date().toISOString() : null,
            opened_at: lastEvent === 'opened' || lastEvent === 'clicked' ? new Date().toISOString() : null,
            clicked_at: lastEvent === 'clicked' ? new Date().toISOString() : null,
            bounced_at: lastEvent === 'bounced' ? new Date().toISOString() : null,
          },
          { onConflict: 'resend_email_id' }
        );
      } catch (e) {
        console.error('[Analytics] Error fetching email:', emailId, e);
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
    });
  } catch (error) {
    console.error('[Analytics] Sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync analytics' },
      { status: 500 }
    );
  }
}
