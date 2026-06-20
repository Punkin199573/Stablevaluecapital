-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow anonymous insert for subscriptions" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admin full access to subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admin full access to campaigns" ON newsletter_campaigns;
DROP POLICY IF EXISTS "Admin full access to admin users" ON admin_users;

-- Allow all operations for service role (used by backend)
CREATE POLICY "Service role full access to subscribers" ON newsletter_subscribers
  FOR ALL USING (true);

CREATE POLICY "Service role full access to campaigns" ON newsletter_campaigns
  FOR ALL USING (true);

CREATE POLICY "Service role full access to admin users" ON admin_users
  FOR ALL USING (true);