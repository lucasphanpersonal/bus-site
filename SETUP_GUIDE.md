# Google Forms Setup Guide

This guide will walk you through setting up your Google Form to work with the bus booking website.

## Step 1: Create Your Google Form

1. Go to [https://forms.google.com](https://forms.google.com)
2. Click the **"+"** button to create a new form
3. Give it a title like "Bus Charter Quote Request"

## Step 2: Add Form Fields

Add the following questions to your form in order:

### Field 1: Trip Days (Dates, Times & Locations)
- **Type**: Paragraph (Long answer text)
- **Question**: "Trip Days with Dates, Times, and Locations"
- **Required**: Yes
- **Description**: "We'll format this automatically from your input. Each day will include date, times, pickup location, and all dropoff locations."

### Field 2: Number of Passengers
- **Type**: Short answer (or Number if available)
- **Question**: "Number of Passengers"
- **Required**: Yes

### Field 3: Full Name
- **Type**: Short answer
- **Question**: "Full Name"
- **Required**: Yes

### Field 4: Email Address
- **Type**: Short answer or Email
- **Question**: "Email Address"
- **Required**: Yes
- **Validation**: Email (if using short answer)

**Alternative**: Enable "Collect email addresses" in form settings instead of creating this field manually.

### Field 5: Phone Number
- **Type**: Short answer
- **Question**: "Phone Number"
- **Required**: Yes

### Field 6: Company/Organization
- **Type**: Short answer
- **Question**: "Company or Organization (Optional)"
- **Required**: No

### Field 7: Trip Description
- **Type**: Paragraph (Long answer text)
- **Question**: "Brief Trip Description"
- **Required**: Yes
- **Description**: "Tell us about your event or trip"

### Field 8: Special Notes
- **Type**: Paragraph (Long answer text)
- **Question**: "Special Notes or Requirements"
- **Required**: No
- **Description**: "Any additional information or special requests"

## Step 3: Get Your Form ID

1. Click the **"Send"** button in the top right
2. Copy the form link (it will look like this):
   ```
   https://docs.google.com/forms/d/e/1FAIpQLSe_XXXXXXXXXXXXXXXXXXXXX/viewform
   ```
3. Your form ID is the part after `/d/e/` and before `/viewform`
4. Your action URL for `config.js` will be:
   ```
   https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/formResponse
   ```

## Step 4: Find Entry IDs

To get the entry IDs for each field:

### Method 1: Using Browser Inspector (Recommended)

1. Open your Google Form in preview mode (click the eye icon)
2. Right-click anywhere on the form and select **"Inspect"** or **"Inspect Element"**
3. Press `Ctrl+F` (Windows/Linux) or `Cmd+F` (Mac) to open the search
4. Search for `"entry."`
5. You'll see entries like:
   ```html
   <input name="entry.1234567890" ...>
   <textarea name="entry.9876543210" ...>
   ```
6. Note down each entry ID in the order you created the fields

### Method 2: Using View Source

1. Open your Google Form in preview mode
2. Right-click and select **"View Page Source"**
3. Search for `"entry."` in the source code
4. Each field will have a unique entry ID

### Example Mapping

If you find these entry IDs:
```
entry.123456789  → Trip Days (Dates, Times & Locations)
entry.234567890  → Number of Passengers
entry.345678901  → Full Name
entry.456789012  → Email Address
entry.567890123  → Phone Number
entry.678901234  → Company/Organization
entry.789012345  → Trip Description
entry.890123456  → Special Notes
```

## Step 5: Update config.js

Edit your `config.js` file and update the `googleForm` section:

```javascript
const CONFIG = {
    googleForm: {
        // Replace with your actual form URL
        actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe_XXXXXXXXXXXXXXXXXXXXX/formResponse',
        
        // Replace these with your actual entry IDs
        fields: {
            tripDays: 'entry.123456789',     // Contains dates, times, and locations for each day
            passengers: 'entry.234567890',
            name: 'entry.345678901',
            email: 'entry.456789012',
            phone: 'entry.567890123',
            company: 'entry.678901234',
            description: 'entry.789012345',
            notes: 'entry.890123456'
        }
    },
    // ... rest of config
};
```

## Step 6: Configure Form Settings

1. Click the **gear icon** (Settings) in your form
2. Under **"General"**:
   - ✅ Limit to 1 response (optional)
   - ✅ Collect email addresses (if not using manual email field)
3. Under **"Presentation"**:
   - ✅ Show progress bar (optional)
   - Set confirmation message: "Thank you! We'll contact you soon with a quote."
4. Click **"Save"**

## Step 7: Set Up Email Notifications

To receive email notifications when someone submits:

1. In your form, click the **"Responses"** tab
2. Click the three dots menu (⋮)
3. Select **"Get email notifications for new responses"**

Alternatively, link to a Google Sheet:
1. Click the Google Sheets icon in the Responses tab
2. Create or select a spreadsheet
3. Set up email notifications from the Sheet using Google Apps Script if needed

## Step 8: Test Your Integration

1. Open your website (index.html)
2. Fill out the form completely
3. Submit the form
4. Check your Google Form responses to verify the data was received

**Tip**: Open the browser console (F12) to see any errors or debug information.

## Common Issues

### Issue: Form submission shows success but no data in Google Forms
- **Solution**: Double-check that all entry IDs match exactly
- Verify the form action URL is correct

### Issue: CORS errors in console
- **Solution**: This is normal! Google Forms doesn't return CORS headers, so we use `mode: 'no-cors'`
- The form still submits successfully even with these console messages

### Issue: Email field not working
- **Solution**: If using Google Forms' built-in email collection, you might need to use `emailAddress` instead of an entry ID

### Issue: Form fields not mapping correctly
- **Solution**: Make sure the order of fields in your Google Form matches the order in which you noted the entry IDs

## Testing Without Google Forms

The website will work even without Google Forms configured:
- Submissions are logged to the browser console
- You can test all functionality before setting up the integration
- Replace the config values when ready to go live

## Security Tips

- 🔒 Never commit your actual `config.js` with real values to a public repository
- 🔒 Consider using environment variables for production
- 🔒 You can add response validation in Google Forms settings
- 🔒 Enable reCAPTCHA in Google Forms settings to prevent spam

---

Need help? Check the browser console for detailed error messages.
