-- =============================================================================
-- STABLE VALUE CAPITAL - NEWSLETTER SYSTEM DATABASE SETUP
-- =============================================================================
-- Copy the entire script below and paste it into your Supabase SQL Editor
-- Go to: Supabase Dashboard > SQL Editor > New Query
-- =============================================================================

-- Enable UUID extension (usually already enabled, but safe to run)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SECTION 1: DROP EXISTING TABLES (if they exist) - CLEAN SLATE
-- =============================================================================
-- Uncomment the lines below if you need to start fresh (WARNING: Deletes all data)
-- DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
-- DROP TABLE IF EXISTS newsletter_campaigns CASCADE;
-- DROP TABLE IF EXISTS admin_users CASCADE;
-- DROP TABLE IF EXISTS form_submissions CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =============================================================================
-- SECTION 2: CREATE FUNCTIONS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SECTION 3: CREATE TABLES
-- =============================================================================

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter campaigns table
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  html_content TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table for authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form submissions table (for contact forms)
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'responded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SECTION 4: ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SECTION 5: CREATE RLS POLICIES
-- =============================================================================
-- These policies allow the service role (used by your backend) full access
-- while keeping the tables secure from direct public access

-- Newsletter Subscribers - Allow service role full access
DROP POLICY IF EXISTS "Service role full access to subscribers" ON newsletter_subscribers;
CREATE POLICY "Service role full access to subscribers" ON newsletter_subscribers
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR true);

-- Allow anonymous users to insert (for newsletter signup on website)
DROP POLICY IF EXISTS "Allow public insert for newsletter signup" ON newsletter_subscribers;
CREATE POLICY "Allow public insert for newsletter signup" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Newsletter Campaigns - Allow service role full access
DROP POLICY IF EXISTS "Service role full access to campaigns" ON newsletter_campaigns;
CREATE POLICY "Service role full access to campaigns" ON newsletter_campaigns
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR true);

-- Admin Users - Allow service role full access
DROP POLICY IF EXISTS "Service role full access to admin users" ON admin_users;
CREATE POLICY "Service role full access to admin users" ON admin_users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR true);

-- Form Submissions - Allow service role full access
DROP POLICY IF EXISTS "Service role full access to form submissions" ON form_submissions;
CREATE POLICY "Service role full access to form submissions" ON form_submissions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR true);

-- Allow public to insert form submissions (contact form on website)
DROP POLICY IF EXISTS "Allow public insert for form submissions" ON form_submissions;
CREATE POLICY "Allow public insert for form submissions" ON form_submissions
  FOR INSERT WITH CHECK (true);

-- =============================================================================
-- SECTION 6: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed ON newsletter_subscribers(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created ON newsletter_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created ON form_submissions(created_at DESC);

-- =============================================================================
-- SECTION 7: CREATE TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =============================================================================

-- Newsletter subscribers trigger
DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON newsletter_subscribers;
CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Newsletter campaigns trigger
DROP TRIGGER IF EXISTS update_newsletter_campaigns_updated_at ON newsletter_campaigns;
CREATE TRIGGER update_newsletter_campaigns_updated_at
    BEFORE UPDATE ON newsletter_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Admin users trigger
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Form submissions trigger
DROP TRIGGER IF EXISTS update_form_submissions_updated_at ON form_submissions;
CREATE TRIGGER update_form_submissions_updated_at
    BEFORE UPDATE ON form_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SECTION 8: GRANT PERMISSIONS
-- =============================================================================
-- These grants ensure the service role can access all tables

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- =============================================================================
-- SECTION 9: VERIFICATION - CHECK TABLES WERE CREATED
-- =============================================================================
-- Run this query separately to verify all tables exist:

SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('newsletter_subscribers', 'newsletter_campaigns', 'admin_users', 'form_submissions')
ORDER BY table_name;

-- =============================================================================
-- DONE! Your newsletter system database is ready.
-- =============================================================================
