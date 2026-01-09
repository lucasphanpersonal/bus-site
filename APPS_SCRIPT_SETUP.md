# Google Apps Script Setup Guide

This guide will walk you through deploying the Google Apps Script that enables quote management features in the admin dashboard.

## What This Enables

Once set up, admins will be able to:
- ✅ **Save quote responses** directly from the admin dashboard to Google Sheets
- ✅ **Edit existing quotes** and update amounts/details
- ✅ **Track quote status** (Sent, Draft, Accepted, Declined)
- ✅ **View saved quotes** with color-coded status indicators
- ✅ **Update quote status** without resending emails

## Prerequisites

Before starting, make sure you have:
- ✅ Completed Google Sheets integration setup (see GOOGLE_SHEETS_SETUP.md)
- ✅ Your Google Sheet with form responses is accessible
- ✅ Admin access to the Google account that owns the sheet

## Setup Steps

### Step 1: Open Google Apps Script Editor

1. Open your Google Sheet (the one linked to your Google Form with quote responses)
2. Click **Extensions** in the menu bar
3. Click **Apps Script**
4. A new tab will open with the Apps Script editor

### Step 2: Add the Script Code

1. In the Apps Script editor, you should see a file called `Code.gs` with some default code
2. **Delete all the default code** in the editor
3. Open the file `google-apps-script/Code.gs` in this repository
4. **Copy the entire contents** of that file
5. **Paste it** into the Apps Script editor
6. Click the **Save** icon (💾) or press `Ctrl+S` (Windows) / `Cmd+S` (Mac)
7. Optionally, rename the project (click "Untitled project" at the top) to something like "Bus Charter Quote Management"

### Step 3: Configure Your Shared Secret

The script uses a shared secret for basic authentication. **You must change this from the default!**

1. In the Apps Script editor, find this line near the top of the code (around line 29):
   ```javascript
   SHARED_SECRET: 'CHANGE_THIS_SECRET_BEFORE_DEPLOYING',
   ```

2. **Change it to your own unique secret**. For example:
   ```javascript
   SHARED_SECRET: 'my-unique-secret-2024-xyz789',
   ```
   
   > **Important**: Make this secret unique and don't share it publicly. This is what protects your Google Sheet from unauthorized writes. Use a long, random string.

3. **Save the file** (Ctrl+S / Cmd+S)

4. **Keep this secret handy** - you'll need to add the same value to your `config.js` file later

### Step 4: Test the Setup (Optional but Recommended)

Before deploying, let's test that the script can access your sheet:

1. In the Apps Script editor, find the function dropdown at the top (it probably says "doPost")
2. Click the dropdown and select **testSetup**
3. Click the **Run** button (▶️) next to the dropdown
4. **First time only**: You'll be prompted to authorize the script
   - Click **Review Permissions**
   - Choose your Google account
   - You may see a warning "Google hasn't verified this app" - this is normal for your own scripts
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow**
5. Check the **Execution log** at the bottom of the screen
6. You should see messages like:
   ```
   Testing setup...
   Spreadsheet name: [Your Sheet Name]
   Form Responses sheet exists: true
   Quote Responses sheet exists: true
   Setup test complete!
   ```

If you see any errors, double-check that:
- You're using the correct Google account (the one that owns the spreadsheet)
- The spreadsheet has a sheet named "Form Responses 1" (or update the name in the CONFIG section of the script)

### Step 5: Deploy as Web App

Now we'll make the script accessible from your admin dashboard:

1. In the Apps Script editor, click **Deploy** in the top right
2. Select **New deployment**
3. Click the gear icon (⚙️) next to "Select type"
4. Choose **Web app**
5. Configure the deployment settings:
   
   **Description**: Enter something like "Quote Management API v1"
   
   **Execute as**: Select **Me ([your email])**
   > This is important! It allows the script to write to your Google Sheet.
   
   **Who has access**: Select **Anyone**
   > Don't worry - the script validates all requests with your shared secret, so it's protected.

6. Click **Deploy**
7. You may need to authorize again - follow the same steps as in Step 4
8. **Copy the Web app URL** - it will look something like:
   ```
   https://script.google.com/macros/s/AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```
9. **Save this URL somewhere safe** - you'll need it in the next step

### Step 6: Update Your config.js

Now we need to tell your admin dashboard where to find the Apps Script:

1. Open the `config.js` file in your project
2. Find the `appsScript` section (should be near the end of the file)
3. Update it with your values:
   ```javascript
   appsScript: {
       enabled: true,  // Change from false to true
       webAppUrl: 'https://script.google.com/macros/s/AKfycbzXXXXXXXXXXXXXXXXXXXXXX/exec',  // Paste your web app URL here
       sharedSecret: 'my-unique-secret-2024-xyz789',  // Must match the secret in Step 3
   }
   ```
4. **Save the file**
5. Commit and push the changes to your repository (if using version control)

### Step 7: Verify It Works

Let's test the complete integration:

1. Open your admin dashboard
2. Log in with your admin password
3. Click on any quote request to open the detail modal
4. Scroll down to the "Send Quote Response" section
5. Enter a quote amount (e.g., 1500)
6. Optionally add additional details
7. Click **"📧 Compose Email"**
8. You should see:
   - A message "💾 Saving quote..."
   - Then "✅ Quote saved to Google Sheets!"
   - Your email client opens with the pre-filled quote

9. **Check your Google Sheet**:
   - Go back to your Google Sheet
   - You should now see a new tab called **"Quote Responses"**
   - The new tab should have your saved quote with all the details

10. **Test editing**:
    - Close the email client (don't send yet if you don't want to)
    - Refresh the admin dashboard and open the same quote again
    - You should now see the saved quote information at the top
    - Try changing the quote amount and click "Update & Compose Email"
    - Check the Google Sheet - the quote should be updated

11. **Test status update**:
    - Change the status dropdown to "Draft" or "Accepted"
    - Click "💾 Update Status"
    - You should see "✅ Quote status updated successfully!"
    - Check the Google Sheet - the status should be updated

## What Gets Created

When you save your first quote, the Apps Script automatically creates a new sheet in your spreadsheet with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| Timestamp | When the quote was last updated | 1/9/2024, 10:30:15 AM |
| Quote Request ID | Links to the original request | 2024-01-09T10:25:00.000Z |
| Customer Name | From the quote request | John Smith |
| Customer Email | From the quote request | john@example.com |
| Quote Amount | Dollar amount | 1500 |
| Additional Details | Custom notes from admin | Includes fuel surcharge |
| Status | Current status | Sent / Draft / Accepted / Declined |
| Admin Name | Who created/updated the quote | Admin |
| Sent Date | When first sent | 2024-01-09T10:30:00.000Z |
| Trip Summary | Summary of trip | Day 1: 2024-02-15... |
| Total Miles | Calculated distance | 125.5 |
| Total Passengers | Number of passengers | 45 |
| Trip Days | Number of days | 2 |

## Troubleshooting

### "Authentication failed" Error

**Problem**: Admin dashboard shows "Authentication failed" when trying to save quotes

**Solution**:
1. Check that `sharedSecret` in `config.js` matches `SHARED_SECRET` in the Apps Script `Code.gs`
2. Both are case-sensitive and must match exactly
3. After changing either value, save and redeploy (Apps Script) or commit changes (config.js)

### "Apps Script web app URL not configured" Error

**Problem**: Error when trying to save a quote

**Solution**:
1. Make sure you completed Step 6 and added the web app URL to `config.js`
2. The URL should start with `https://script.google.com/macros/s/`
3. Make sure `enabled: true` in the `appsScript` section

### Quote Saves But Doesn't Appear in Sheet

**Problem**: Dashboard says quote saved, but no new sheet appears

**Solution**:
1. Check the Apps Script execution logs:
   - Open the Apps Script editor
   - Click **Executions** (📋) in the left sidebar
   - Look for recent executions and click to see details
   - Check for any error messages
2. Make sure the "Execute as" setting is set to "Me" in the deployment configuration
3. Try running the `testSetup` function again to check for issues

### "Failed to fetch" or Network Error

**Problem**: Can't connect to the Apps Script

**Solution**:
1. Test the web app URL directly:
   - Copy your web app URL
   - Paste it into a new browser tab
   - You should see a JSON response like: `{"status":"ok","message":"Bus Charter Quote Management API is running",...}`
   - If you get an error page, the deployment may not be working correctly
2. Check that you completed Step 5 correctly
3. Try creating a **new deployment** (Deploy → Manage deployments → Create new deployment)

### "Authorization Required" Every Time

**Problem**: Script asks for authorization on every execution

**Solution**:
1. In the Apps Script editor: Deploy → Manage deployments
2. Click the pencil icon (✏️) to edit your deployment
3. Make sure **"Execute as"** is set to **"Me"**, not "User accessing the web app"
4. Click **Deploy**
5. You may need to authorize one more time, but then it should work permanently

### Sheet Name Doesn't Match

**Problem**: Error about "Form Responses 1" not found

**Solution**:
1. Open your Google Sheet and check the actual name of the tab with form responses
2. In the Apps Script `Code.gs`, find this line:
   ```javascript
   FORM_RESPONSES_SHEET: 'Form Responses 1',
   ```
3. Change it to match your actual sheet name
4. Save and the script should work

## Updating the Script

If you need to make changes to the Apps Script later:

1. Open the Apps Script editor
2. Make your changes to the code
3. **Save the file** (Ctrl+S / Cmd+S)
4. The changes take effect **immediately** for the existing deployment
5. You do **NOT** need to create a new deployment
6. To verify, check the **Executions** log after the next quote save

## Security Notes

### Is This Secure Enough for My Business?

The shared secret authentication provides basic security suitable for:
- ✅ Personal use
- ✅ Small business operations (< 10 employees)
- ✅ Internal tools
- ✅ Non-sensitive customer data

It is **NOT** suitable for:
- ❌ Handling credit card information
- ❌ PHI (Protected Health Information)
- ❌ Large organizations with strict compliance requirements
- ❌ Highly sensitive personal data

### For Production Use

If you need enterprise-grade security:

1. **Implement OAuth 2.0**: Use Google's OAuth flow to authenticate users
2. **Use Service Accounts**: Set up proper Google Cloud service accounts
3. **Add IP Restrictions**: Limit which IP addresses can access the API
4. **Implement Rate Limiting**: Protect against abuse
5. **Use Signed Requests**: Add HMAC signatures to verify request authenticity
6. **Consider a Backend**: Move to a proper backend server with database

### Monitoring Usage

Keep track of your Apps Script usage:

1. Go to the Apps Script editor
2. Click **Executions** in the left sidebar
3. Review recent executions to monitor for:
   - Unexpected failures
   - Unusual activity patterns
   - Performance issues

### API Quotas

Google Apps Script free tier limits:
- **Execution time**: 6 minutes per execution
- **URL Fetch calls**: 20,000 per day
- **Script runtime**: 90 minutes per day (triggered functions)

For this use case, these limits are very generous. You'd need to save hundreds of quotes per day to approach the limits.

## Next Steps

Now that quote management is set up:

1. ✅ Test the complete workflow with real quotes
2. ✅ Train your team on how to use the status tracking features
3. ✅ Consider customizing the status options in `Code.gs` if needed
4. ✅ Set up regular backups of your Google Sheet
5. ✅ Monitor the Apps Script execution logs periodically

## Need Help?

If you encounter issues:

1. Check the **Execution logs** in Apps Script editor for detailed error messages
2. Check the **browser console** (F12) in your admin dashboard for client-side errors
3. Review this guide step-by-step to ensure nothing was missed
4. Check that all prerequisites (Google Sheets integration) are working correctly

## Additional Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Web Apps Guide](https://developers.google.com/apps-script/guides/web)
- [SpreadsheetApp Reference](https://developers.google.com/apps-script/reference/spreadsheet)
- [Apps Script Execution Logs](https://developers.google.com/apps-script/guides/logging)
