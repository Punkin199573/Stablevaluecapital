# Newsletter & Email Configuration Guide

## Changes Made

The admin newsletter system has been significantly improved to provide:

### Frontend (Admin Dashboard)
✅ **HTML Email Support** - Add custom HTML emails for professional formatting
✅ **Custom Recipients** - Send to specific email addresses instead of just subscribers
✅ **Test Email Feature** - Send test emails directly to punkin199573@gmail.com
✅ **Better UI** - Clear labels and explanations for each field

### Backend (API)
✅ **Proper Resend Integration** - Uses `RESEND_API_KEY` environment variable
✅ **Test Mode Support** - Sends test emails without creating campaign records
✅ **Flexible Recipients** - Supports subscribers, custom emails, or test recipients
✅ **Better Error Handling** - Detailed error messages for debugging

## Setup Instructions

### 1. Get Resend API Key

1. Go to https://resend.com
2. Sign up or log in
3. Navigate to API Keys section
4. Copy your API key (starts with `re_`)

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your actual values:

```
# Resend API Key (from https://resend.com/api-keys)
RESEND_API_KEY=re_your_actual_key_here

# Admin authentication token (choose a secure string)
ADMIN_NEWSLETTER_TOKEN=your-secure-random-token
NEXT_PUBLIC_ADMIN_TOKEN=your-secure-random-token

# Supabase credentials (if using database for subscribers)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

### 3. Verify Resend Domain

For production, verify your domain with Resend:
1. Log in to https://resend.com
2. Go to Domains section
3. Add and verify your domain
4. Once verified, emails will have better deliverability

For testing, Resend provides a test domain by default.

## Using the New Features

### Access Admin Dashboard
1. Go to `/admin/login`
2. Enter your admin token
3. Navigate to "Send Newsletter" tab

### Create and Send Newsletter

**Fields:**
- **Newsletter Title** - Email subject line
- **Newsletter Content** - Plain text content (required)
- **HTML Content** - Optional custom HTML for rich formatting
- **Custom Recipients** - Optional comma-separated emails. Leave empty to send to all subscribers.

**Options:**
1. **Send Newsletter** - Sends to custom recipients or all subscribers
2. **Send Test to punkin199573@gmail.com** - Sends test email to your account

### Example HTML Email

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; }
      .container { max-width: 600px; margin: 0 auto; }
      .header { background: #0066FF; color: white; padding: 20px; }
      .content { padding: 20px; background: #f9f9f9; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Your Newsletter Title</h1>
      </div>
      <div class="content">
        <p>Your content here with <strong>bold</strong> and <em>italic</em> text.</p>
        <a href="https://example.com">Click here for more</a>
      </div>
    </div>
  </body>
</html>
```

## Testing

### Test Email Flow
1. Add content and HTML
2. Click "Send Test to punkin199573@gmail.com"
3. Check your inbox (may be in spam)
4. Verify email formatting and content

### Troubleshooting

**"Email service not configured"**
- Ensure `RESEND_API_KEY` is set in `.env.local`
- Restart the dev server after changing env vars

**"Invalid admin token"**
- Verify token matches `ADMIN_NEWSLETTER_TOKEN` in `.env.local`
- Token is case-sensitive

**Emails not being delivered**
- Check Resend dashboard for bounce/rejection reasons
- Verify recipient email addresses are valid
- For production, verify your domain with Resend

**Invalid HTML in emails**
- Ensure HTML is properly formatted
- Test with a simpler HTML template first
- Avoid external stylesheets; use inline styles

## API Reference

### Send Newsletter Endpoint
`POST /api/admin/newsletter-send`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Body Examples:**

Send to subscribers:
```json
{
  "title": "Newsletter Title",
  "content": "Plain text content",
  "htmlContent": "<html>...</html>"
}
```

Send to custom recipients:
```json
{
  "title": "Newsletter Title",
  "content": "Plain text content",
  "recipientEmails": ["user1@example.com", "user2@example.com"]
}
```

Send test email:
```json
{
  "title": "Newsletter Title",
  "content": "Plain text content",
  "testMode": true,
  "testEmail": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "campaignId": "uuid",
  "sent": 5,
  "failed": 0,
  "total": 5,
  "testMode": false
}
```
