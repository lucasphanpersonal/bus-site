# CORS Issue Fix Guide

## Problem

If you're seeing this error in your browser console when using the admin dashboard:

```
Access to fetch at 'https://script.google.com/macros/s/AKfycbz.../exec' from origin 'https://lucasphanpersonal.github.io' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This guide will help you fix it.

## What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature in web browsers that prevents websites from making requests to different domains unless explicitly allowed. 

When your admin dashboard (hosted on GitHub Pages) tries to save quotes to Google Apps Script (hosted on script.google.com), the browser first sends a "preflight" request using the OPTIONS method to check if the request is allowed.

## The Solution

The fix involves two parts:

### Part 1: Update Your Google Apps Script Code

Your `Code.gs` file needs a `doOptions()` function to handle CORS preflight requests.

**If you deployed your Apps Script BEFORE this fix was added**, you need to update it:

1. Open your Google Sheet
2. Click **Extensions** → **Apps Script**
3. Find the `doGet()` function in your code
4. Right after `doGet()`, add this new function:

```javascript
/**
 * Handle OPTIONS requests (CORS preflight)
 * This is required for cross-origin POST requests from the admin dashboard
 */
function doOptions(e) {
  // Return a response that allows the actual POST request to proceed
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

5. Click **Save** (💾)
6. The function will take effect immediately - no need to redeploy!

### Part 2: Verify Deployment Settings

The web app MUST be deployed with "Anyone" access for CORS to work:

1. In the Apps Script editor, click **Deploy** → **Manage deployments**
2. Click the pencil icon (✏️) to edit your deployment
3. Verify these settings:
   - **Execute as**: Me
   - **Who has access**: **Anyone** ⚠️ This is critical!
4. If you changed anything, click **Deploy**
5. Wait 1-2 minutes for changes to propagate

## Why Does This Work?

1. **doOptions() Function**: When the browser sends a preflight OPTIONS request, Google Apps Script now responds properly instead of returning an error.

2. **"Anyone" Access**: When the web app is set to "Anyone" access, Google Apps Script automatically adds the necessary CORS headers (`Access-Control-Allow-Origin: *`) to all responses, including the OPTIONS response.

3. **Shared Secret Protection**: Even though "Anyone" can access the web app, the shared secret in your config.js protects it from unauthorized writes.

## Testing the Fix

After applying the fix:

1. Clear your browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Open your admin dashboard
3. Try to send a quote
4. If you see "✅ Quote saved to Google Sheets!" - it works!
5. Check your Google Sheet to verify the quote was saved

## If It Still Doesn't Work

### Check Browser Console

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Look for any error messages
4. If you see CORS errors, continue with troubleshooting

### Try a New Deployment

Sometimes existing deployments have cached settings:

1. In Apps Script editor, click **Deploy** → **New deployment**
2. Choose **Web app**
3. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Copy the new URL
6. Update `config.js` with the new URL:
   ```javascript
   appsScript: {
       enabled: true,
       webAppUrl: 'YOUR_NEW_URL_HERE',
       sharedSecret: 'your-secret'
   }
   ```
7. Commit and push changes to GitHub

### Verify the Script is Accessible

1. Open your web app URL directly in a browser
2. You should see a JSON response like:
   ```json
   {
     "status": "ok",
     "message": "Bus Charter Quote Management API is running",
     "timestamp": "2024-01-09T21:30:00.000Z"
   }
   ```
3. If you see an error page or login screen, your deployment settings are wrong

### Check Network Tab

1. Open browser developer tools (F12)
2. Go to the Network tab
3. Try to send a quote
4. Look for the request to script.google.com
5. Click on it to see details
6. Check:
   - Request method: Should show OPTIONS first, then POST
   - Response headers: Should include `Access-Control-Allow-Origin`
   - Status code: OPTIONS should return 200

## Common Mistakes

### ❌ Wrong: Setting "Who has access" to "Only myself"
This prevents CORS from working because the browser can't access the script from a different domain.

**✅ Correct**: Set to "Anyone" and use shared secret for protection

### ❌ Wrong: Missing doOptions() function
Without this, preflight requests fail and POST requests are blocked.

**✅ Correct**: Add the doOptions() function as shown above

### ❌ Wrong: Using an old deployment
Old deployments may have cached settings that don't include proper CORS handling.

**✅ Correct**: Create a new deployment with correct settings

## Security Note

**Q: Is it safe to set "Who has access" to "Anyone"?**

**A: Yes, because:**
1. The script validates every request with the shared secret
2. Requests without the correct secret are rejected
3. Failed authentication returns generic error messages
4. No sensitive data is exposed without authentication
5. The script only has access to the specific spreadsheet you configured

The shared secret in your `config.js` acts as an API key that prevents unauthorized access.

## Still Having Issues?

If you've tried everything above and it still doesn't work:

1. Check the Apps Script execution logs:
   - Open Apps Script editor
   - Click **Executions** in left sidebar
   - Look for recent executions and error messages

2. Verify your configuration:
   - Check that `sharedSecret` in config.js matches `SHARED_SECRET` in Code.gs
   - Check that `webAppUrl` in config.js is correct and ends with `/exec`
   - Check that `appsScript.enabled` is set to `true`

3. Try a complete reset:
   - Delete all deployments in Apps Script
   - Create a fresh deployment with "Anyone" access
   - Update config.js with the new URL
   - Clear browser cache
   - Try again

## Reference Links

- [Google Apps Script Web Apps Documentation](https://developers.google.com/apps-script/guides/web)
- [CORS on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [APPS_SCRIPT_SETUP.md](./APPS_SCRIPT_SETUP.md) - Complete setup guide
- [TROUBLESHOOTING_STATUS_UPDATES.md](./TROUBLESHOOTING_STATUS_UPDATES.md) - Additional troubleshooting

## Summary

The key changes to fix CORS:

1. ✅ Add `doOptions()` function to Code.gs
2. ✅ Deploy web app with "Anyone" access
3. ✅ Use shared secret for authentication
4. ✅ Wait for changes to propagate
5. ✅ Clear browser cache and test

Following these steps should resolve the CORS policy error and allow your admin dashboard to save quotes successfully.
