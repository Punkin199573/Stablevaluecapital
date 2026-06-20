# Supabase Setup Instructions for Newsletter System

## Step-by-Step Instructions

### 1. Access Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (Stable Value Capital)
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### 2. Copy and Paste the SQL Script
Copy the entire contents of `SUPABASE_SETUP.sql` and paste it into the SQL Editor.

### 3. Execute the Script
Click "Run" to execute the SQL script. This will:
- Create 4 tables: newsletter_subscribers, newsletter_campaigns, admin_users, form_submissions
- Set up Row Level Security (RLS) policies
- Create performance indexes
- Set up automatic timestamp triggers

### 4. Verify Tables Were Created
After running the script, verify by checking the Table Editor. You should see:
- newsletter_subscribers
- newsletter_campaigns
- admin_users
- form_submissions

### 5. Important Environment Variables
Make sure these are set in your Vercel project settings:

```
RESEND_API_KEY=re_xxxxxxxxxxxx
ADMIN_NEWSLETTER_TOKEN=your-secure-token-here
NEXT_PUBLIC_ADMIN_TOKEN=your-secure-token-here
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Supabase AI Prompt

Copy and paste the following prompt into Supabase AI Assistant (click the sparkle icon in SQL Editor):

```
I need you to create a newsletter system for Stable Value Capital. We are using the Resend email service and need the following tables and structure:

1. **newsletter_subscribers** - Store email subscribers with fields:
   - id (UUID, primary key)
   - email (unique, required)
   - status (active/unsubscribed/bounced)
   - subscribed_at, unsubscribed_at, created_at, updated_at timestamps

2. **newsletter_campaigns** - Track email campaigns with:
   - id (UUID, primary key)
   - title, content (required), html_content (optional)
   - status (draft/scheduled/sending/sent/failed)
   - sent_at, recipient_count, sent_count, failed_count
   - created_at, updated_at timestamps

3. **form_submissions** - Contact form submissions with:
   - id (UUID, primary key)
   - first_name, last_name, email, phone, subject, message
   - status (new/reviewing/responded)
   - created_at, updated_at timestamps

4. **admin_users** - Admin authentication with:
   - id, email, password_hash, is_active, last_login
   - created_at, updated_at timestamps

Requirements:
- Enable Row Level Security on all tables
- Allow service_role full access (for backend API)
- Allow public INSERT only for newsletter_subscribers and form_submissions (for website forms)
- Create indexes on frequently queried columns (email, status, dates)
- Auto-update updated_at timestamp on any changes

Please generate the complete SQL migration script that I can run directly in the SQL Editor.
```

## Troubleshooting

### If you get "relation already exists" errors:
The table already exists. You can either:
1. Skip the CREATE TABLE statement for that table
2. DROP the table first (WARNING: this deletes all data): `DROP TABLE IF EXISTS table_name CASCADE;`

### If RLS policies fail:
Make sure you're using the service role key in your backend, not the anon key.

### If emails aren't being tracked:
Check that the campaigns table insert is working. Run this query to verify:
```sql
SELECT * FROM newsletter_campaigns ORDER BY created_at DESC LIMIT 5;
```

### To check subscriber count:
```sql
SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'active';
```
