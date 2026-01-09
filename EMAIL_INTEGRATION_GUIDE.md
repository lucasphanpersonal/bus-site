# Email Integration Guide

## Overview

This guide explains how to add **automatic email sending** to your bus charter quote website instead of just opening an email client. Since this is a static website (no backend server), we need to use third-party email services.

## The Challenge

The current implementation uses `mailto:` links which open the user's email client. To send emails automatically, we need:
1. A backend server or service to send emails (frontend JavaScript cannot send emails directly for security reasons)
2. SMTP credentials or an email API
3. Integration code to connect the frontend to the email service

## Recommended Solutions

### Option 1: EmailJS (Easiest - Recommended)

**Best for:** Small to medium businesses, quick setup, no backend needed

EmailJS is a service that lets you send emails directly from JavaScript without a backend server.

#### Setup Steps:

1. **Sign up at [EmailJS](https://www.emailjs.com/)**
   - Free tier: 200 emails/month
   - Paid plans start at $8/month for more emails

2. **Create an Email Service**
   - Connect your Gmail, Outlook, or custom SMTP
   - EmailJS will use your email to send messages

3. **Create an Email Template**
   - Design your quote confirmation template
   - Use template variables like `{{customer_name}}`, `{{quote_details}}`, etc.

4. **Get Your Credentials**
   - Public Key (User ID)
   - Service ID
   - Template ID

5. **Install EmailJS in your project**

Add to the `<head>` section of `index.html`:
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script type="text/javascript">
    (function(){
        emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your public key
    })();
</script>
```

6. **Update `script.js` to send confirmation emails**

Add this function:
```javascript
/**
 * Send confirmation email to customer using EmailJS
 */
async function sendConfirmationEmail(formData) {
    try {
        const templateParams = {
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            company: formData.company,
            passengers: formData.passengers,
            trip_description: formData.description,
            trip_days: formatTripDaysForEmail(formData.tripDays),
            notes: formData.notes || 'None',
            submission_date: new Date().toLocaleString()
        };

        await emailjs.send(
            'YOUR_SERVICE_ID',    // Replace with your Service ID
            'YOUR_TEMPLATE_ID',   // Replace with your Template ID
            templateParams
        );
        
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
        // Don't block the form submission if email fails
    }
}

function formatTripDaysForEmail(tripDays) {
    return tripDays.map((day, idx) => {
        return `Day ${idx + 1}: ${day.date} from ${day.startTime} to ${day.endTime}
Pick-up: ${day.pickup}
Drop-offs: ${day.dropoffs.join(', ')}`;
    }).join('\n\n');
}
```

7. **Call the function after form submission**

In the `handleSubmit` function in `script.js`, add:
```javascript
// After submitToGoogleForms(formData);
await sendConfirmationEmail(formData);
```

#### EmailJS Template Example:

```
Subject: Your Bus Charter Quote Request - Confirmation

Dear {{customer_name}},

Thank you for submitting a quote request for charter bus services!

We have received your request with the following details:

Contact Information:
- Name: {{customer_name}}
- Email: {{customer_email}}
- Phone: {{customer_phone}}
- Company: {{company}}

Trip Details:
- Passengers: {{passengers}}
- Description: {{trip_description}}

{{trip_days}}

Special Notes: {{notes}}

Our team will review your request and get back to you within 24 hours with a detailed quote.

If you have any urgent questions, please call us at (555) 123-4567.

Best regards,
Bus Charter Services Team
```

#### Advantages:
- ✅ Easy setup (15-30 minutes)
- ✅ No backend server required
- ✅ Free tier available
- ✅ Works with static hosting (GitHub Pages, Netlify)
- ✅ Reliable delivery
- ✅ Email templates with variables

#### Limitations:
- Limited free emails (200/month)
- Emails sent from your connected account
- Public key visible in client code (but that's okay, it's meant to be public)

---

### Admin Notification Feature

The website now includes a feature to send automatic email notifications to an admin when new quotes are received. This helps you stay on top of incoming quote requests.

#### Setup Steps:

1. **Create Admin Notification Template in EmailJS**
   - In your EmailJS dashboard, create a new email template
   - Name it something like "Admin Quote Notification"
   - Get the Template ID

2. **Admin Template Example:**

```
Subject: New Bus Charter Quote Request Received

New Quote Request Received!

A new quote request has been submitted on {{submission_date}}.

Customer Information:
- Name: {{customer_name}}
- Email: {{customer_email}}
- Phone: {{customer_phone}}
- Company: {{company}}

Trip Details:
- Passengers: {{passengers}}
- Description: {{trip_description}}

Trip Schedule:
{{trip_days}}

Special Notes:
{{notes}}

Route Information:
{{route_info}}

Please review and respond to the customer as soon as possible.

---
This notification was sent to: {{admin_email}}
```

3. **Configure in config.js:**

```javascript
emailjs: {
    enabled: true,  // Must be enabled
    publicKey: 'YOUR_PUBLIC_KEY',
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_CUSTOMER_TEMPLATE_ID',
    
    adminNotification: {
        enabled: true,  // Enable admin notifications
        adminEmail: 'huabaohuang622@gmail.com',  // Admin email (currently hardcoded)
        adminTemplateId: 'YOUR_ADMIN_TEMPLATE_ID'  // Admin notification template
    }
}
```

4. **Security Note:**

⚠️ **IMPORTANT**: The admin email is currently hardcoded in the configuration. For production use, consider:
- Moving sensitive configuration to environment variables
- Using secret management services (AWS Secrets Manager, Azure Key Vault, Google Cloud Secret Manager)
- Using platform-specific environment variables (Netlify, Vercel)
- Implementing proper backend authentication

See the TODO comment in `config.js` for more details.

#### Template Variables Available:

The admin notification email template has access to these variables:
- `{{admin_email}}` - Admin email address
- `{{customer_name}}` - Customer's name
- `{{customer_email}}` - Customer's email
- `{{customer_phone}}` - Customer's phone
- `{{company}}` - Company/organization name
- `{{passengers}}` - Number of passengers
- `{{trip_description}}` - Trip description
- `{{trip_days}}` - Formatted trip days with dates, times, and locations
- `{{notes}}` - Special notes from customer
- `{{route_info}}` - Computed route information (distance, time, etc.)
- `{{submission_date}}` - Date and time of submission

#### How It Works:

1. Customer submits a quote request
2. Form is submitted to Google Forms (primary storage)
3. Customer receives confirmation email (if enabled)
4. Admin receives notification email (if enabled)
5. Customer is redirected to success page

The admin notification is sent asynchronously and will not block the form submission if it fails.

---

### Option 2: Netlify Forms + Functions (Serverless)

**Best for:** Sites hosted on Netlify, moderate volume

If you deploy to Netlify, you can use Netlify Forms with Functions to send emails.

#### Setup Steps:

1. **Deploy to Netlify** (if not already)

2. **Add Netlify Function**

Create `netlify/functions/send-email.js`:
```javascript
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const formData = JSON.parse(event.body);

    // Configure your email service
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: formData.email,
        subject: 'Your Bus Charter Quote Request - Confirmation',
        html: `
            <h2>Thank you for your quote request!</h2>
            <p>Dear ${formData.name},</p>
            <p>We have received your request for ${formData.passengers} passengers.</p>
            <p>Our team will review and respond within 24 hours.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send email' })
        };
    }
};
```

3. **Update `script.js` to call the function**:
```javascript
async function sendConfirmationEmail(formData) {
    try {
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Email sending failed');
        }
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}
```

4. **Set environment variables in Netlify**:
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASSWORD`: Your email password or app password

#### Advantages:
- ✅ Full control over email content
- ✅ No third-party email service needed
- ✅ Scales with Netlify functions
- ✅ Free tier: 125k function invocations/month

#### Limitations:
- Requires Netlify hosting
- Need to manage email credentials
- More complex setup

---

### Option 3: Formspree (Simplest)

**Best for:** Very simple setups, minimal customization

Formspree is a form backend service that can send emails automatically.

#### Setup Steps:

1. **Sign up at [Formspree](https://formspree.io/)**
   - Free tier: 50 submissions/month
   - Paid: $10/month for 1000 submissions

2. **Create a new form** and get your endpoint URL

3. **Update form submission in `script.js`**:
```javascript
async function submitToFormspree(formData) {
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            passengers: formData.passengers,
            tripDays: JSON.stringify(formData.tripDays),
            description: formData.description,
            notes: formData.notes
        })
    });
    
    return response.ok;
}
```

4. **Configure Formspree to send confirmation emails**:
   - Enable "Autoresponder" in Formspree settings
   - Customize the email template

#### Advantages:
- ✅ Extremely easy setup (5 minutes)
- ✅ No code changes needed
- ✅ Automatic email sending
- ✅ Spam protection included

#### Limitations:
- Limited customization
- Limited free tier
- Less control over email content

---

### Option 4: SendGrid API (Professional)

**Best for:** High volume, professional needs, full customization

SendGrid is a professional email delivery service with excellent deliverability.

#### Setup Steps:

1. **Sign up at [SendGrid](https://sendgrid.com/)**
   - Free tier: 100 emails/day forever
   - Paid plans for higher volume

2. **Create an API key** in SendGrid dashboard

3. **Create a proxy endpoint** (required - can't call SendGrid directly from frontend)

Option A: Use a simple Cloudflare Worker (free):
```javascript
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
    }

    const formData = await request.json()

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            personalizations: [{
                to: [{ email: formData.email }],
                subject: 'Your Bus Charter Quote Request'
            }],
            from: { email: 'noreply@yourdomain.com' },
            content: [{
                type: 'text/html',
                value: `<p>Thank you ${formData.name}!</p>`
            }]
        })
    })

    return new Response('Email sent', { status: 200 })
}
```

4. **Call the worker from your frontend**

#### Advantages:
- ✅ Professional email service
- ✅ Excellent deliverability
- ✅ Detailed analytics
- ✅ 100 emails/day free forever

#### Limitations:
- Requires backend proxy
- More complex setup
- Need to manage API keys securely

---

## Comparison Table

| Solution | Setup Time | Monthly Cost | Emails/Month | Complexity | Backend Required |
|----------|-----------|--------------|--------------|------------|------------------|
| EmailJS | 20 mins | $0-8 | 200-1000 | Low | No |
| Netlify Functions | 1 hour | $0 | Unlimited* | Medium | Serverless |
| Formspree | 5 mins | $0-10 | 50-1000 | Very Low | No |
| SendGrid | 2 hours | $0 | 3000 | Medium-High | Proxy only |

*Within Netlify's function limits

## Recommended Implementation Plan

### For Most Users: EmailJS

1. **Week 1: Setup EmailJS**
   - Sign up and configure
   - Create email templates
   - Test with your own email

2. **Week 2: Integrate**
   - Add EmailJS to `index.html`
   - Update `script.js`
   - Test full flow

3. **Week 3: Refine**
   - Improve email templates
   - Add error handling
   - Monitor delivery

### Implementation Code for EmailJS

Here's the complete code to add to your project:

**1. Update `config.js`:**
```javascript
emailjs: {
    enabled: true,
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID'
}
```

**2. Add to `index.html` (in `<head>`):**
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script type="text/javascript">
    (function(){
        if (CONFIG.emailjs && CONFIG.emailjs.enabled && CONFIG.emailjs.publicKey) {
            emailjs.init(CONFIG.emailjs.publicKey);
        }
    })();
</script>
```

**3. Add to `script.js` (after form submission):**
```javascript
// In handleSubmit function, after await submitToGoogleForms(formData);
if (CONFIG.emailjs && CONFIG.emailjs.enabled) {
    await sendConfirmationEmail(formData).catch(err => {
        console.warn('Email sending failed:', err);
        // Continue anyway - email is optional
    });
}
```

## Testing Email Integration

1. **Test with your own email first**
2. **Verify email arrives in inbox (not spam)**
3. **Check all variables render correctly**
4. **Test on mobile devices**
5. **Monitor delivery rates**

## Troubleshooting

**Emails not arriving:**
- Check spam folder
- Verify email service configuration
- Check API credentials
- Review service quotas

**Emails in spam:**
- Configure SPF/DKIM records (advanced)
- Use a verified sending domain
- Avoid spam trigger words
- Keep content professional

**Rate limits exceeded:**
- Upgrade service plan
- Implement queuing
- Add delay between sends

## Security Considerations

- ⚠️ Never expose SMTP passwords in frontend code
- ✅ Use API keys designed for frontend (like EmailJS public key)
- ✅ Implement rate limiting to prevent abuse
- ✅ Validate email addresses before sending
- ✅ Use HTTPS for all API calls

## Next Steps

1. Choose an email service based on your needs
2. Follow the setup guide for your chosen service
3. Test thoroughly before going live
4. Monitor email delivery and adjust as needed
5. Consider adding admin notification emails too

---

**Need help?** Most services have excellent documentation and support. Start with EmailJS for the easiest path to automatic emails!
