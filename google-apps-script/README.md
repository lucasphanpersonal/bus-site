# Google Apps Script for Quote Management

This directory contains the Google Apps Script code that enables write access to Google Sheets for the admin dashboard.

## What This Does

The Apps Script acts as a middleware API that allows the admin dashboard to:
- ✅ Save quote responses to Google Sheets
- ✅ Update existing quote responses  
- ✅ Track quote status (Sent, Draft, Accepted, Declined)
- ✅ Maintain a separate "Quote Responses" sheet with all admin-generated quotes

## Setup Instructions

### Step 1: Open Your Google Sheet

1. Navigate to your Google Sheet that contains the form responses
2. Make sure you're logged in with the Google account that owns the sheet

### Step 2: Open Apps Script Editor

1. Click **Extensions** → **Apps Script** in your Google Sheet
2. A new tab will open with the Apps Script editor

### Step 3: Add the Script

1. Delete any existing code in the editor
2. Open the `Code.gs` file in this directory
3. Copy the entire contents
4. Paste it into the Apps Script editor
5. Click the **Save** icon (💾) or press Ctrl+S / Cmd+S

### Step 4: Configure the Shared Secret

The script uses a shared secret for basic authentication. You should change this:

1. In the Apps Script editor, find this line near the top:
   ```javascript
   SHARED_SECRET: 'bus-charter-secret-2024',
   ```

2. Change it to a unique value (keep it secret!):
   ```javascript
   SHARED_SECRET: 'your-unique-secret-here',
   ```

3. Save the file

4. **Important**: You'll need to add the same secret to your `config.js` file later

### Step 5: Test the Setup (Optional)

1. In the Apps Script editor, select the `testSetup` function from the dropdown at the top
2. Click the **Run** button (▶️)
3. You may be prompted to authorize the script - click **Review Permissions** and authorize
4. Check the **Execution log** at the bottom - it should show success messages

### Step 6: Deploy as Web App

**IMPORTANT**: The web app must be deployed with "Anyone" access to allow the admin dashboard to read responses from the Apps Script. Google Apps Script automatically handles CORS (Cross-Origin Resource Sharing) for web apps deployed with "Anyone" access, which enables the admin dashboard to receive and process responses from the script.

The script includes a `doOptions()` function that handles CORS preflight requests (OPTIONS method), which is required when the admin dashboard makes POST requests with custom headers (Content-Type: application/json). This ensures that cross-origin requests from your GitHub Pages site to the Google Apps Script work properly.

1. Click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "Quote Management API v1" (or any description)
   - **Execute as**: **Me** (this allows the script to write to your sheet)
   - **Who has access**: **Anyone** ⚠️ **CRITICAL**: Must be set to "Anyone" to enable CORS
5. Click **Deploy**
6. You may need to authorize again - follow the prompts
7. Copy the **Web app URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
8. Save this URL - you'll need it for the next step

**Security Note**: Even though the web app is accessible to "Anyone", it's protected by the shared secret. All requests without the correct secret will be rejected.

### Step 7: Update config.js

1. Open your `config.js` file
2. Find or add the `appsScript` section:
   ```javascript
   appsScript: {
       enabled: true,
       webAppUrl: 'YOUR_WEB_APP_URL_HERE',
       sharedSecret: 'your-unique-secret-here' // Must match Code.gs
   }
   ```

3. Replace `YOUR_WEB_APP_URL_HERE` with the URL you copied
4. Replace `your-unique-secret-here` with the same secret you set in Step 4
5. Save the file

### Step 8: Verify It Works

1. Open your admin dashboard
2. Click on any quote
3. Enter a quote amount and click "Compose Email"
4. The quote should be saved to Google Sheets
5. Check your Google Sheet - a new tab called "Quote Responses" should appear with your quote

## What Gets Saved

When an admin sends a quote, the following information is saved to the "Quote Responses" sheet:

| Column | Description |
|--------|-------------|
| Timestamp | When the quote was sent |
| Quote Request ID | Links back to the original customer request |
| Customer Name | Name from the request |
| Customer Email | Email address |
| Quote Amount | The dollar amount quoted |
| Additional Details | Any custom notes added by admin |
| Status | Sent, Draft, Accepted, or Declined |
| Admin Name | Who sent the quote |
| Sent Date | ISO timestamp |
| Trip Summary | Summary of the trip |
| Total Miles | Calculated distance |
| Total Passengers | Number of passengers |
| Trip Days | Number of days |

## Security Notes

### Shared Secret

The script uses a simple shared secret for authentication. This is **not production-grade security** but is sufficient for:
- ✅ Personal use
- ✅ Small business operations
- ✅ Internal tools
- ✅ Low-risk data

### For Production Use

If you need stronger security, consider:
- Implementing OAuth 2.0 authentication
- Using signed JWTs
- Setting up a proper backend server
- Limiting access to specific IP addresses

### API Key Restrictions

The script is deployed with "Anyone" access, but:
- It validates the shared secret on every request
- Failed authentication returns generic error messages
- No sensitive data is returned without authentication
- The script only has access to the sheets you specify

## Troubleshooting

### "Authorization Required" Error

**Problem**: Script asks for authorization every time

**Solution**: 
1. In Apps Script editor, click **Deploy** → **Manage deployments**
2. Click the pencil icon to edit the deployment
3. Make sure "Execute as" is set to "Me"
4. Click **Deploy**

### "Authentication Failed" Error

**Problem**: Admin dashboard shows authentication failed

**Solution**:
1. Check that `sharedSecret` in `config.js` matches `SHARED_SECRET` in `Code.gs`
2. Both are case-sensitive and must match exactly
3. Re-deploy the Apps Script after making changes

### Quote Not Saving

**Problem**: No error but quote doesn't appear in sheet

**Solution**:
1. Check the Apps Script execution logs:
   - Open Apps Script editor
   - Click **Executions** in the left sidebar
   - Look for recent executions and any errors
2. Make sure the web app URL in `config.js` is correct
3. Try running the `testSetup` function to verify setup

### "Sheet Not Found" Error

**Problem**: Error says "Quote Responses sheet not found"

**Solution**:
- This should auto-create the sheet on first save
- If not, manually create a sheet named "Quote Responses" with the headers listed above
- Or run the `testSetup` function which creates the sheet

### Network Error

**Problem**: "Failed to fetch" or network errors

**Solution**:
1. Check that the web app URL is accessible (open it in a browser - you should see a JSON response)
2. Make sure you're not blocking cross-origin requests
3. Check browser console for specific error messages

### CORS Policy Error

**Problem**: "Access to fetch has been blocked by CORS policy: Response to preflight request doesn't pass access control check"

**Solution**:

This error occurs when the Google Apps Script web app doesn't properly respond to CORS preflight requests. Follow these steps IN ORDER:

1. **Verify the Code**:
   - Open Apps Script editor (Extensions → Apps Script)
   - Ensure the `doOptions()` function is present and returns JSON:
   ```javascript
   function doOptions(e) {
     const response = {
       status: 'ok',
       message: 'CORS preflight successful'
     };
     return ContentService
       .createTextOutput(JSON.stringify(response))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
   - If missing or different, update it with the code above
   - Click **Save** (💾)

2. **Check Deployment Settings** (CRITICAL):
   - Click **Deploy** → **Manage deployments**
   - Click the pencil icon (✏️) to edit your deployment
   - Verify these EXACT settings:
     * **Execute as**: Me (your Google account)
     * **Who has access**: **Anyone** ⚠️ MUST be "Anyone", not "Only myself" or organization
   - If you changed anything, click **Deploy**
   - Wait 2-3 minutes for changes to propagate

3. **Create New Deployment** (if step 2 didn't work):
   - Click **Deploy** → **New deployment**
   - Select **Web app**
   - Set:
     * Execute as: **Me**
     * Who has access: **Anyone**
   - Click **Deploy**
   - Copy the new web app URL
   - Update `config.js` with the new URL

4. **Test the Fix**:
   - Clear browser cache (Ctrl+Shift+Delete)
   - Open admin dashboard
   - Try to send a quote
   - Check browser console (F12) for any remaining errors

**Why This Works**: Google Apps Script automatically adds CORS headers (`Access-Control-Allow-Origin: *`) ONLY when the web app is deployed with "Anyone" access AND the `doOptions()` function returns a JSON response. The JSON mime type triggers Google's automatic CORS header addition.

## Updating the Script

When you need to update the Apps Script:

1. Edit the code in the Apps Script editor
2. Save the changes
3. You **do NOT** need to create a new deployment
4. Changes take effect immediately for the existing deployment
5. If you need to test before deploying, use the `testSetup` function

## Limitations

### Google Apps Script Quotas

Free tier limits:
- **Execution time**: 6 minutes per execution
- **URL Fetch calls**: 20,000 per day
- **Triggers**: 20 per script, 90 minutes execution time per day

For this use case, these limits are more than sufficient (you'd need to send thousands of quotes per day to hit them).

### Data Size

- Each sheet can have up to 5 million cells
- With 13 columns, that's ~384,000 rows
- More than enough for most businesses

## Support

If you encounter issues:

1. Check the Apps Script execution logs (see Troubleshooting above)
2. Look at the browser console in your admin dashboard (F12)
3. Review the setup steps to ensure everything is configured correctly
4. Try the `testSetup` function to isolate the issue

## Additional Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Web Apps Guide](https://developers.google.com/apps-script/guides/web)
- [SpreadsheetApp Reference](https://developers.google.com/apps-script/reference/spreadsheet)
