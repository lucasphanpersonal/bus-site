# Email Response System Guide

This guide explains how to use the email response system to send quotes directly from the admin dashboard.

## Overview

The admin dashboard includes a built-in email response system that allows you to:
- ✅ Compose quote responses directly from the admin interface
- ✅ Include trip details, pricing, and terms automatically
- ✅ Send via your default email client (Gmail, Outlook, Apple Mail, etc.)
- ✅ Configure your business email and signature
- ✅ Optionally BCC yourself for record-keeping

## How It Works

### Step 1: View Quote Details

1. Log in to the admin dashboard
2. Click on any quote request to open the detail modal
3. Scroll to the bottom to see the **"Send Quote Response"** section

### Step 2: Enter Quote Amount

1. Enter the quote amount in dollars (e.g., 1500 for $1,500)
2. Optionally add additional details (terms, conditions, special offers, etc.)

### Step 3: Compose Email

1. Click the **"📧 Compose Email"** button
2. Your default email client will open with a pre-filled email containing:
   - Customer's email address (To:)
   - Professional subject line
   - Quote amount prominently displayed
   - Complete trip summary with all details
   - Your business signature
   - Optional BCC to yourself

### Step 4: Review and Send

1. Review the email in your email client
2. Make any edits if needed
3. Add attachments if desired (contracts, terms, etc.)
4. Click Send in your email client

## Email Template

The system automatically generates a professional email with:

```
Dear [Customer Name],

Thank you for your bus charter quote request. We're pleased to provide you with the following quote:

QUOTE AMOUNT: $[Amount]

TRIP SUMMARY:
Day 1: [Date]
  Time: [Start] - [End]
  Distance: [Miles] miles
  Duration: [Hours]
  Pickup: [Location]
  Dropoffs: [Locations]

TOTALS:
- Total Distance: [Miles] miles
- Total Booking Time: [Hours]
- Number of Passengers: [Count]
- Trip Days: [Number]

ADDITIONAL DETAILS:
[Your custom details]

This quote is valid for 30 days. Please let us know if you have any questions or would like to proceed with booking.

[Your Business Signature]
```

## Configuration

### Setting Up Your Business Email

Edit `config.js` and update the email section:

```javascript
email: {
    // Your business email (appears as From address)
    fromEmail: 'reservations@yourbusiness.com',
    
    // Your business name
    businessName: 'Your Bus Charter Company',
    
    // Optional: BCC email for record-keeping
    bccEmail: 'records@yourbusiness.com',
    
    // Email template settings
    templates: {
        subject: 'Your Bus Charter Quote',
        signature: `
Best regards,
Your Bus Charter Company Team

Phone: (555) 123-4567
Email: reservations@yourbusiness.com
Website: www.yourbusiness.com
        `.trim()
    }
}
```

### Customizing the Signature

The signature supports basic text formatting. You can include:
- Company name
- Phone number
- Email address
- Website URL
- Physical address
- Operating hours
- Any other contact information

**Example Multi-line Signature:**

```javascript
signature: `
Best regards,
Jane Smith
Sales Manager
ABC Bus Charter Services

Phone: (555) 123-4567
Email: jane@abcbusses.com
Website: www.abcbusses.com
123 Main Street, Boston, MA 02101

Operating Hours: Mon-Fri 8AM-6PM, Sat 9AM-4PM
`.trim()
```

## Features

### Automatic Trip Summary

The system automatically includes:
- All trip days with dates and times
- Pickup and dropoff locations for each day
- Distance calculations (if available)
- Booking duration
- Total passengers
- Overnight trip indicators

### Professional Formatting

Emails are formatted professionally with:
- Clear section headers
- Organized data layout
- Easy-to-read structure
- All relevant trip information

### Editable Before Sending

The mailto: link opens your email client, allowing you to:
- Edit any part of the message
- Add or remove information
- Attach files (contracts, insurance, terms)
- Change the subject line
- Add CC or BCC recipients manually

## How Email Sending Works

### Technical Details

The system uses `mailto:` links which:
- Work with all email clients (Gmail, Outlook, Apple Mail, Thunderbird, etc.)
- Don't require server-side email configuration
- Don't expose your email password or credentials
- Are secure and standard
- Work on desktop and mobile devices

### Supported Email Clients

✅ **Desktop:**
- Gmail (via browser)
- Outlook
- Apple Mail
- Thunderbird
- Windows Mail
- Any other default email client

✅ **Mobile:**
- Gmail app
- Outlook app
- Apple Mail app
- Default mail apps

### What Happens Behind the Scenes

1. Admin fills out quote form
2. JavaScript builds email content with trip details
3. Creates a `mailto:` URL with encoded parameters
4. Browser opens default email client
5. Email appears pre-filled but not sent
6. Admin reviews and sends manually

## Best Practices

### 1. Always Review Before Sending

- Double-check the quote amount
- Verify trip details are correct
- Ensure dates and times match the request
- Check for any special notes or requirements

### 2. Customize the Message

Feel free to:
- Add a personal greeting
- Include promotional offers
- Mention any current specials
- Add payment terms or deposit requirements
- Include booking instructions

### 3. Attach Supporting Documents

Consider attaching:
- Service agreement or contract
- Terms and conditions
- Insurance information
- Vehicle specifications
- Safety certifications
- Previous customer testimonials

### 4. Set Follow-up Reminders

After sending a quote:
- Note the date sent
- Set a reminder to follow up in 2-3 days
- Keep track of which quotes converted to bookings

### 5. Use BCC for Record-Keeping

Configure the `bccEmail` setting to:
- Keep copies of all sent quotes
- Track your sales pipeline
- Have records for accounting
- Build an email archive

## Troubleshooting

### Email Client Doesn't Open

**Problem:** Clicking "Compose Email" doesn't open your email client

**Solutions:**
1. Set a default email client in your operating system:
   - **Windows:** Settings → Apps → Default Apps → Email
   - **Mac:** Mail app → Preferences → Default email reader
   - **Linux:** System Settings → Default Applications → Mail
2. Use a desktop email client instead of web-only email
3. If using web-only email (like Gmail), the browser may block the popup

### Email Is Blank or Missing Content

**Problem:** Email opens but doesn't contain the quote information

**Solutions:**
1. Make sure you entered a quote amount before clicking "Compose Email"
2. Check that JavaScript is enabled in your browser
3. Try refreshing the page and opening the quote again
4. Check browser console (F12) for error messages

### Special Characters Display Incorrectly

**Problem:** Quotes, apostrophes, or special characters look wrong in the email

**Solutions:**
1. Edit the email in your email client before sending
2. Replace problematic characters manually
3. This is a known limitation of mailto: encoding

### BCC Not Working

**Problem:** BCC email isn't included when email opens

**Solutions:**
1. Add the BCC recipient manually in your email client
2. Check that `bccEmail` is configured correctly in config.js
3. Some email clients don't support BCC in mailto: links - add it manually

## Alternatives to mailto:

If mailto: links don't work well for your setup, consider these alternatives:

### Option 1: Copy to Clipboard

Add a "Copy Email" button that copies the email text to clipboard, then paste into your email client manually.

### Option 2: Backend Email Service

For larger operations, implement a backend email service:
- SendGrid
- Mailgun
- Amazon SES
- SMTP server

This requires backend development but provides:
- Automatic sending
- Email tracking
- Templates stored on server
- Better formatting options

### Option 3: Integration with Email Service

Integrate with services like:
- Gmail API
- Microsoft Graph (for Outlook)
- Third-party email platforms

Requires OAuth authentication but provides richer features.

## Tips for Better Quote Response

### 1. Response Time Matters

- Respond within 24 hours for better conversion rates
- Set up email notifications for new quote requests
- Check the dashboard regularly

### 2. Be Competitive but Profitable

- Research market rates for your area
- Factor in all costs (fuel, driver, insurance, wear)
- Consider demand and seasonality
- Add value with quality service, not just low prices

### 3. Build Trust

- Include testimonials or reviews
- Mention safety certifications
- Share your experience and fleet details
- Provide references if requested

### 4. Clear Terms

Always include:
- Payment terms (deposit required, when due, accepted methods)
- Cancellation policy
- What's included (driver, fuel, tolls, etc.)
- What's not included (gratuity, parking, etc.)
- Any additional fees or conditions

### 5. Call to Action

End with:
- Clear next steps to book
- Deadline for accepting the quote
- Your direct phone number for questions
- Alternative contact methods

## FAQ

**Q: Can customers reply to the quote email?**  
A: Yes! The email comes from your configured business email, so replies go directly to you.

**Q: Is the email sent immediately when I click "Compose Email"?**  
A: No, it opens in your email client for review. You must click Send in your email program.

**Q: Can I track if customers opened the email?**  
A: Not with the current mailto: system. You'd need a backend email service for tracking.

**Q: Can I save quotes as drafts?**  
A: The amounts you enter aren't saved. Copy important details before closing the modal.

**Q: Can I send the same quote to multiple customers?**  
A: Each quote is unique to one customer. Open each quote separately to respond.

**Q: What if I make a mistake in the quote amount?**  
A: Since you review in your email client before sending, you can correct it there.

**Q: Can I use HTML formatting in my signature?**  
A: The signature is plain text. You can add line breaks but not HTML formatting.

**Q: Will this work on mobile devices?**  
A: Yes, if you have a mobile email app configured as your default mail client.

## Future Enhancements

Potential improvements for the email system:

- [ ] Save quote amounts and notes to database
- [ ] Track sent quotes and responses
- [ ] Email templates for different quote types
- [ ] Automatic follow-up reminders
- [ ] Integration with accounting software
- [ ] Digital signature for contracts
- [ ] Online payment links
- [ ] Booking confirmation system

---

**Need Help?** Check the browser console (F12) for error messages or contact your system administrator.
