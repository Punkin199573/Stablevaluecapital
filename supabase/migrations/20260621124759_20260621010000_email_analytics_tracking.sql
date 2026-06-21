-- Add analytics columns to newsletter_campaigns
ALTER TABLE newsletter_campaigns 
ADD COLUMN IF NOT EXISTS opens_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivered_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounced_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS complained_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_analytics_sync TIMESTAMPTZ;

-- Create email_tracking table to track individual emails
CREATE TABLE IF NOT EXISTS email_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  resend_email_id VARCHAR(255) UNIQUE NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'bounced', 'opened', 'clicked', 'complained', 'suppressed')),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on email_tracking
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_tracking (service role access)
CREATE POLICY "Service role full access to email tracking" 
ON email_tracking FOR ALL 
TO public 
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_tracking_campaign ON email_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_status ON email_tracking(status);
CREATE INDEX IF NOT EXISTS idx_email_tracking_email ON email_tracking(recipient_email);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_analytics ON newsletter_campaigns(opens_count, clicks_count, delivered_count);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_tracking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_tracking_updated_at
BEFORE UPDATE ON email_tracking
FOR EACH ROW
EXECUTE FUNCTION update_email_tracking_timestamp();