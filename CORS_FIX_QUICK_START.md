# Quick Start: Fix CORS Error in 5 Minutes

If your admin dashboard shows this error:
```
Access to fetch has been blocked by CORS policy
```

Follow these steps to fix it immediately:

## Step 1: Update Your Apps Script (2 minutes)

1. Open your Google Sheet
2. Click **Extensions** → **Apps Script**
3. Find the `doOptions()` function in your code
4. **Replace it** with this updated version (or add it after `doGet()` if missing):

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

5. Click **Save** (💾) - That's it! No need to redeploy.

## Step 2: Check Deployment Settings (2 minutes)

1. In Apps Script, click **Deploy** → **Manage deployments**
2. Click the pencil icon (✏️) to edit
3. Verify **"Who has access"** is set to **"Anyone"**
4. If it wasn't, change it and click **Deploy**

## Step 3: Test (1 minute)

1. Clear your browser cache (Ctrl+Shift+Delete)
2. Go to your admin dashboard
3. Try to send a quote
4. ✅ Should work now!

## Still Not Working?

See [CORS_FIX_GUIDE.md](CORS_FIX_GUIDE.md) for detailed troubleshooting.

## Visual Reference

Your `Code.gs` should look like this after the edit:

```javascript
// ... other code above ...

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  const response = {
    status: 'ok',
    message: 'Bus Charter Quote Management API is running',
    timestamp: new Date().toISOString()
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle OPTIONS requests (CORS preflight)  ← UPDATED FUNCTION
 * This is required for cross-origin POST requests from the admin dashboard
 */
function doOptions(e) {                     ← UPDATE THIS
  const response = {                        ← MUST RETURN JSON
    status: 'ok',                           ← FOR CORS TO WORK
    message: 'CORS preflight successful'    ← 
  };                                        ← 
  return ContentService                     ← 
    .createTextOutput(JSON.stringify(response)) ← 
    .setMimeType(ContentService.MimeType.JSON); ← 
}                                           ← 

/**
 * Save a new quote response
 */
function handleSaveQuote(data) {
  // ... rest of the code ...
```

## Why This Works

- Browsers send an OPTIONS request before POST requests (called "preflight")
- Without `doOptions()`, that preflight request fails
- The `doOptions()` function MUST return JSON format (not plain text)
- JSON format triggers Google Apps Script to add CORS headers automatically
- When deployed with "Anyone" access, Google adds: `Access-Control-Allow-Origin: *`
- With proper CORS headers, the browser allows the POST request to proceed

**Key Insight**: Using `ContentService.MimeType.JSON` is critical - plain text responses don't trigger CORS header addition in Google Apps Script.

That's it! The fix is simple but essential for cross-origin requests to work.
