# EmailJS Setup Instructions for Admin Notifications

This guide will help you set up EmailJS so that you receive an email at **huabaohuang622@gmail.com** whenever a client submits a quote request.

## Current Status

✅ **Admin notification feature is enabled** in `config.js`  
❌ **EmailJS is not configured yet** - You need to complete the steps below

## Why You're Not Receiving Emails

The admin notification feature requires EmailJS to be configured with:
1. A free EmailJS account
2. Your EmailJS API keys (publicKey, serviceId)
3. An email template for admin notifications (adminTemplateId)

## Step-by-Step Setup (15-20 minutes)

### Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" (free tier includes 200 emails/month)
3. Verify your email address

### Step 2: Connect Your Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended if you use Gmail)
   - **Outlook** (if you use Outlook/Hotmail)
   - Or any other SMTP service
4. Follow the prompts to connect your email account
5. **Important:** Note down your **Service ID** (e.g., `service_abc123`)

### Step 3: Create Admin Notification Email Template

1. In EmailJS dashboard, go to **Email Templates**
2. Click **Create New Template**
3. Name it "Admin Quote Notification" or similar
4. Use this template content:

```
Subject: New Bus Charter Quote Request from {{customer_name}}

New Quote Request Received!

A new quote request was submitted on {{submission_date}}.

CUSTOMER INFORMATION:
- Name: {{customer_name}}
- Email: {{customer_email}}
- Phone: {{customer_phone}}
- Company: {{company}}

TRIP DETAILS:
- Number of Passengers: {{passengers}}
- Description: {{trip_description}}

TRIP SCHEDULE:
{{trip_days}}

SPECIAL NOTES:
{{notes}}

ROUTE INFORMATION:
{{route_info}}

Please review and respond to the customer as soon as possible.

---
This notification was sent to: {{admin_email}}
```

5. In the **To email** field, use: `{{admin_email}}`
6. Click **Save**
7. **Important:** Note down your **Template ID** (e.g., `template_xyz456`)

### Step 4: Get Your Public Key

1. In EmailJS dashboard, go to **Account** → **General**
2. Find your **Public Key** (also called User ID)
3. **Important:** Note down your **Public Key** (e.g., `user_1a2b3c4d5e`)

### Step 5: Configure Your Website

You have two options:

#### Option A: Using config-local.js (Recommended for local development)

1. Copy the example file:
   ```bash
   cp config-local.js.example config-local.js
   ```

2. Edit `config-local.js` and add your EmailJS credentials:
   ```javascript
   const CONFIG_LOCAL = {
       emailjs: {
           enabled: true,
           publicKey: 'YOUR_PUBLIC_KEY_HERE',      // From Step 4
           serviceId: 'YOUR_SERVICE_ID_HERE',      // From Step 2
           templateId: '',                         // Leave empty if not sending customer confirmations
           
           adminNotification: {
               enabled: true,
               adminEmail: 'huabaohuang622@gmail.com',
               adminTemplateId: 'YOUR_ADMIN_TEMPLATE_ID_HERE'  // From Step 3
           }
       }
   };
   ```

3. Save the file (this file is git-ignored and won't be committed)

#### Option B: Using environment variables (Recommended for production)

If you're deploying to Netlify, Vercel, or GitHub Pages, you can set environment variables:

1. In your hosting platform, add these environment variables:
   - `EMAILJS_PUBLIC_KEY`: Your public key from Step 4
   - `EMAILJS_SERVICE_ID`: Your service ID from Step 2
   - `EMAILJS_ADMIN_TEMPLATE_ID`: Your admin template ID from Step 3

2. Update your config loading code to read from environment variables

### Step 6: Test Your Setup

1. Go to your website
2. Fill out and submit a test quote request
3. Check the browser console for any errors
4. Check **huabaohuang622@gmail.com** inbox for the notification email
5. Check your spam folder if you don't see it in inbox

## Troubleshooting

### "EmailJS library not loaded"
- Make sure you're viewing the page through a web server (not `file://`)
- Check that the EmailJS script is loading in `index.html`

### "Admin notification template ID is not configured"
- Make sure you set `adminTemplateId` in your config
- Double-check the template ID in EmailJS dashboard

### "Failed to send admin notification"
- Check browser console for specific error message
- Verify all three values are correct: publicKey, serviceId, adminTemplateId
- Make sure the email service is connected in EmailJS dashboard
- Check EmailJS dashboard for error logs

### Email goes to spam
- Add the sender email to your contacts
- Mark the email as "Not Spam"
- Future emails should go to inbox

### Not receiving emails at all
- Check EmailJS dashboard → Activity Log to see if emails are being sent
- Verify your email service is properly connected
- Check your monthly quota (200 emails/month on free tier)

## Security Notes

⚠️ **Important Security Information:**

1. **Public Key is safe to expose** - EmailJS public keys are meant to be used in frontend code
2. **Never commit config-local.js** - It's already in .gitignore
3. **For production**, consider using environment variables or secret management services
4. **Monitor your EmailJS usage** to prevent quota exhaustion

## About Route Information (N/A Values)

You mentioned seeing "N/A" values for distance and duration. This can happen when:

1. **Google Maps API fails** - Check browser console for errors
2. **Rate limiting** - Too many API calls in short time
3. **Invalid addresses** - Some addresses may not be recognized
4. **API key restrictions** - Make sure your Google Maps API key allows Distance Matrix API

The route computation happens **before** the email is sent, so if route computation fails, the email will still be sent but with "Route information not available" instead of actual values.

## Next Steps

After completing this setup:

1. ✅ Submit a test quote
2. ✅ Verify you receive the admin notification email
3. ✅ Check that route information is included (if Google Maps API is working)
4. ✅ Review the driving time warnings (new feature added!)

## New Feature: Driving Time Warnings ⚠️

We've added a new warning system that alerts both you and the customer when:

- **Total driving time exceeds total booked hours**
- **Per-day driving time exceeds that day's booked hours**

These warnings appear in:
- The route summary modal (before submission)
- The admin email notification
- The admin dashboard

This helps identify unrealistic itineraries and prevents booking issues.

## Need Help?

- EmailJS Documentation: https://www.emailjs.com/docs/
- Full Email Integration Guide: See `EMAIL_INTEGRATION_GUIDE.md`
- Google Maps Setup: See `GOOGLE_SHEETS_SETUP.md`

---

**Remember:** Once you complete these steps, every new quote submission will automatically send an email to **huabaohuang622@gmail.com**! 🎉
