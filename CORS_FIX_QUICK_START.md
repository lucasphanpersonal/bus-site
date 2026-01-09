# Quick Start: Fix CORS Error in 5 Minutes

If your admin dashboard shows this error:
```
Access to fetch has been blocked by CORS policy
```

Follow these steps to fix it immediately:

## Step 1: Update Your Apps Script (2 minutes)

1. Open your Google Sheet
2. Click **Extensions** → **Apps Script**
3. Find the `doGet()` function in your code
4. Right **after** the `doGet()` function (after the closing `}`), paste this:

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
 * Handle OPTIONS requests (CORS preflight)  ← NEW FUNCTION
 * This is required for cross-origin POST requests from the admin dashboard
 */
function doOptions(e) {                     ← ADD THIS
  return ContentService                     ← ADD THIS
    .createTextOutput('')                   ← ADD THIS
    .setMimeType(ContentService.MimeType.TEXT); ← ADD THIS
}                                           ← ADD THIS

/**
 * Save a new quote response
 */
function handleSaveQuote(data) {
  // ... rest of the code ...
```

## Why This Works

- Browsers send an OPTIONS request before POST requests (called "preflight")
- Without `doOptions()`, that preflight request fails
- With `doOptions()`, the preflight succeeds and POST works
- Google Apps Script automatically adds CORS headers when set to "Anyone"

That's it! The fix is simple but essential for cross-origin requests to work.
