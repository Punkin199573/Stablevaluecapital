# Newsletter Testing Guide

## Prerequisites

Before testing the newsletter sending functionality, ensure you have:

1. **Resend API Key** - Get from https://resend.com/api-keys
2. **Admin Token** - A secure string for authentication
3. **.env.local file** - Set up with the above values

## Quick Setup for Testing

### 1. Create .env.local

```bash
cat > .env.local << 'EOF'
# Resend Email Service
RESEND_API_KEY=re_YOUR_ACTUAL_KEY_HERE

# Admin Authentication
ADMIN_NEWSLETTER_TOKEN=test-admin-token-12345
NEXT_PUBLIC_ADMIN_TOKEN=test-admin-token-12345

# Supabase (if you have it set up)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
EOF
```

### 2. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 3. Access Admin Panel

1. Navigate to `http://localhost:3000/admin/login`
2. Enter your admin token: `test-admin-token-12345`
3. Click "Login"

## Test Scenario 1: Send Test Email

**Objective:** Verify email sending works with Resend

**Steps:**
1. Go to Admin Dashboard → "Send Newsletter" tab
2. Fill in:
   - **Title:** "Test Newsletter - June 6, 2024"
   - **Content:** "This is a test email from Stable Value Capital."
3. Leave **HTML Content** and **Custom Recipients** empty
4. Click **"📧 Send Test to punkin199573@gmail.com"**
5. Wait for success message

**Expected Result:**
- Message shows: "Test email sent to punkin199573@gmail.com"
- Email arrives in punkin199573@gmail.com inbox (check spam folder too)
- Email contains the title and content you entered

## Test Scenario 2: HTML Email

**Objective:** Verify custom HTML formatting works

**Steps:**
1. Go to Admin Dashboard → "Send Newsletter" tab
2. Fill in:
   - **Title:** "HTML Test Newsletter"
   - **Content:** "Fallback plain text content"
   - **HTML Content:**
   ```html
   <!DOCTYPE html>
   <html>
     <head>
       <style>
         body { font-family: Arial, sans-serif; }
         .container { max-width: 600px; margin: 0 auto; }
         .header { background: #0066FF; color: white; padding: 20px; text-align: center; }
         .content { padding: 20px; }
         .button { background: #0066FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
       </style>
     </head>
     <body>
       <div class="container">
         <div class="header">
           <h1>Special Investment Opportunity</h1>
         </div>
         <div class="content">
           <p>Dear Valued Client,</p>
           <p>We have a new investment opportunity available for qualified investors.</p>
           <a href="https://example.com" class="button">Learn More</a>
           <p>Best regards,<br>Stable Value Capital Team</p>
         </div>
       </div>
     </body>
   </html>
   ```
3. Click **"📧 Send Test to punkin199573@gmail.com"**

**Expected Result:**
- Email arrives with formatted HTML styling
- Buttons, colors, and layout are displayed correctly
- Links are clickable

## Test Scenario 3: Custom Recipients

**Objective:** Verify sending to specific email addresses

**Prerequisites:**
- You need valid email addresses to test with
- Optional: Add newsletter subscribers to your Supabase database

**Steps:**
1. Go to Admin Dashboard → "Send Newsletter" tab
2. Fill in:
   - **Title:** "Custom Recipients Test"
   - **Content:** "This email is sent to specific recipients."
   - **Custom Recipients:** Enter comma-separated emails:
   ```
   punkin199573@gmail.com, another-test@example.com
   ```
3. Click **"Send Newsletter"**

**Expected Result:**
- Message shows: "Newsletter sent to X recipients, Y failed"
- Emails arrive to specified addresses
- No campaign record created if test fails

## Test Scenario 4: Subscriber List (if using Supabase)

**Objective:** Verify sending to all newsletter subscribers

**Prerequisites:**
- Supabase database configured with newsletter_subscriptions table
- Subscribers added to the database

**Steps:**
1. Go to Admin Dashboard → "Send Newsletter" tab
2. Fill in:
   - **Title:** "Newsletter to All Subscribers"
   - **Content:** "Content for all subscribers"
3. Leave **Custom Recipients** empty
4. Click **"Send Newsletter"**

**Expected Result:**
- Message shows: "Newsletter sent to X subscribers"
- Campaign record is created in database
- All active subscribers receive the email

## Troubleshooting

### Issue: "Email service not configured"

**Cause:** `RESEND_API_KEY` not set or incorrect

**Fix:**
1. Check `.env.local` has `RESEND_API_KEY=re_xxx`
2. Verify the key is valid at https://resend.com
3. Restart dev server: `Ctrl+C` and `npm run dev`

### Issue: "Unauthorized" or "Invalid admin token"

**Cause:** Admin token doesn't match

**Fix:**
1. Verify token in `.env.local`
2. Copy exact token (including case) to login
3. Restart dev server after changing token

### Issue: Emails not arriving

**Possibilities:**
1. **Spam folder:** Check spam/promotions folder
2. **Verification needed:** Resend may require domain verification for production
3. **Bounced emails:** Check Resend dashboard for bounce reasons
4. **Invalid recipient:** Verify email address format

### Issue: HTML not rendering

**Cause:** Malformed or unsupported HTML

**Fix:**
1. Ensure HTML is valid (use https://validator.w3.org/)
2. Avoid external stylesheets; use inline styles only
3. Use simple HTML elements (p, div, a, img, etc.)
4. Test with the example HTML above first

### Issue: "Failed to fetch subscribers"

**Cause:** Supabase connection issue or table missing

**Fix:**
1. Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Verify table exists: `newsletter_subscriptions`
3. Check Supabase connection in browser console
4. For custom recipients, you don't need Supabase set up

## Monitoring & Debugging

### View API Response in Browser

Open browser DevTools (F12) and:
1. Go to Network tab
2. Send a newsletter
3. Click on the `newsletter-send` request
4. View Response tab to see detailed results

### Check Server Logs

```bash
# If dev server is running, check console output
# Look for messages like:
# "[v0] Newsletter send error: ..."
# "RESEND_API_KEY not configured"
```

### Monitor Email Delivery

1. Go to https://resend.com/dashboard
2. Check Email section for delivery status
3. View bounce/rejection reasons
4. Review logs for each sent email

## Success Criteria

✅ **Setup is successful when:**
- Dev server starts without errors
- Admin login works with your token
- Test email to punkin199573@gmail.com arrives within 1-2 minutes
- HTML emails display formatting correctly
- Custom recipients receive emails
- No errors in browser console or server logs

## Next Steps

After testing is successful:

1. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "feat: improve newsletter with HTML and custom recipients"
   git push
   ```

2. **Set Environment Variables in Vercel:**
   - Go to https://vercel.com
   - Select your project
   - Settings → Environment Variables
   - Add `RESEND_API_KEY`, `ADMIN_NEWSLETTER_TOKEN`, `NEXT_PUBLIC_ADMIN_TOKEN`

3. **Test in Production:**
   - Access `/admin/login` on your deployed site
   - Send test email
   - Verify it arrives correctly

## API Testing with cURL

You can also test the API directly:

```bash
# Test sending newsletter via API
curl -X POST http://localhost:3000/api/admin/newsletter-send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-admin-token-12345" \
  -d '{
    "title": "Test Newsletter",
    "content": "Hello, this is a test!",
    "testMode": true,
    "testEmail": "punkin199573@gmail.com"
  }'
```

Expected successful response:
```json
{
  "success": true,
  "sent": 1,
  "failed": 0,
  "total": 1,
  "testMode": true
}
```
