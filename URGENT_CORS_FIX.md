# 🚨 URGENT: CORS Error Fix Required

## Your Issue

You're seeing this error when trying to save quotes from the admin dashboard:

```
Access to fetch at 'https://script.google.com/macros/s/AKfycbzciOrxnUsYGrZ3Yh1QNe3zKCbMdGN_Cm7pvL11PZTvX36K3DBCVVxUaLPLR2tjyKUs2Q/exec' 
from origin 'https://lucasphanpersonal.github.io' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## What Happened

The Google Apps Script you deployed is using an outdated `doOptions()` function that returns plain text instead of JSON. Google Apps Script only adds CORS headers to JSON responses, not plain text responses.

## The Fix (5 Minutes)

### Step 1: Open Your Apps Script

1. Open your Google Sheet that contains the quote responses
2. Click **Extensions** → **Apps Script**
3. You should see your `Code.gs` file

### Step 2: Find and Replace doOptions() Function

1. In the Apps Script editor, press **Ctrl+F** (or **Cmd+F** on Mac) to open Find
2. Search for: `function doOptions`
3. You should see this code:

```javascript
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

4. **Replace the entire function** with this:

```javascript
/**
 * Handle OPTIONS requests (CORS preflight)
 * This is required for cross-origin POST requests from the admin dashboard
 * 
 * IMPORTANT: Returns JSON to ensure Google Apps Script adds CORS headers
 */
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

5. Click **Save** (💾 icon or Ctrl+S / Cmd+S)

### Step 3: Verify Deployment Settings (CRITICAL!)

1. In the Apps Script editor, click **Deploy** → **Manage deployments**
2. Click the **pencil icon** (✏️) to edit your active deployment
3. Check these settings:
   - **Execute as**: Me (your Google account)
   - **Who has access**: **Anyone** ⚠️ MUST be "Anyone"
   
4. If "Who has access" is NOT set to "Anyone", change it now
5. Click **Deploy**
6. Wait 2-3 minutes for changes to propagate through Google's servers

### Step 4: Test the Fix

1. **Clear your browser cache**:
   - Chrome/Edge: Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
   - Select "Cached images and files"
   - Click "Clear data"

2. **Go to your admin dashboard**: https://lucasphanpersonal.github.io/bus-site/admin.html

3. **Try to accept or decline a quote**:
   - Open any quote
   - Enter an amount
   - Click "Compose Email"

4. **You should see**: ✅ "Quote saved to Google Sheets!"

5. **Verify in your Google Sheet**:
   - Open your Google Sheet
   - Look for the "Quote Responses" tab
   - Your quote should appear there

## Why This Works

**Before Fix:**
- `doOptions()` returned plain text (`MimeType.TEXT`)
- Google Apps Script did NOT add CORS headers
- Browser blocked the request with CORS error

**After Fix:**
- `doOptions()` returns JSON (`MimeType.JSON`)
- Google Apps Script automatically adds `Access-Control-Allow-Origin: *` header
- Browser allows the request to proceed

## Troubleshooting

### Still Getting CORS Error?

1. **Did you save the changes?** Click the Save icon in Apps Script
2. **Is deployment set to "Anyone"?** This is the most common issue
3. **Did you wait 2-3 minutes?** Google's servers need time to propagate changes
4. **Did you clear browser cache?** Old cached responses can cause issues

### Try Creating a New Deployment

If the above doesn't work, try creating a completely new deployment:

1. In Apps Script, click **Deploy** → **New deployment**
2. Choose **Web app**
3. Set:
   - **Execute as**: Me
   - **Who has access**: **Anyone**
4. Click **Deploy**
5. **Copy the new web app URL**
6. Update your `config.js`:
   ```javascript
   appsScript: {
       enabled: true,
       webAppUrl: 'PASTE_NEW_URL_HERE',
       sharedSecret: 'lp-test-9994'
   }
   ```
7. Commit and push the updated config.js
8. Wait for GitHub Pages to deploy (2-3 minutes)
9. Test again

### Check Browser Console

1. Open admin dashboard
2. Press F12 to open DevTools
3. Go to "Console" tab
4. Try to save a quote
5. Look for any error messages
6. Check the "Network" tab for the OPTIONS and POST requests

### Check Apps Script Execution Logs

1. In Apps Script editor, click **Executions** (left sidebar)
2. Look for recent executions
3. Check for any errors
4. Verify that both OPTIONS and POST requests are succeeding

## Security Note

**Q: Is "Anyone" access safe?**

**A: YES!** Here's why:

- ✅ The shared secret (`lp-test-9994`) protects all write operations
- ✅ Requests without the secret are rejected
- ✅ No sensitive data is exposed without authentication
- ✅ The script can only access your Google Sheet, nothing else
- ✅ You can monitor all executions in the Apps Script logs

## Need More Help?

If you're still having issues:

1. Read `CORS_FIX_GUIDE.md` for detailed troubleshooting
2. Read `CORS_FIX_TECHNICAL_DETAILS.md` for technical deep dive
3. Check your browser console for specific error messages
4. Verify your Apps Script execution logs for server-side errors

## What Changed in the Repository

We've updated the `google-apps-script/Code.gs` file in the repository with the correct version. Future deployments will work correctly. However, your **existing deployment** needs to be manually updated following the steps above.

---

**Once you've applied this fix, your admin dashboard will work perfectly! ✅**
