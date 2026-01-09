# CORS Fix - The Real Solution

## The Real Problem

❌ **Google Apps Script does NOT support OPTIONS requests for Web Apps**

When you send a POST request with `Content-Type: application/json`:
1. Browser sends OPTIONS preflight request
2. Google Apps Script **ignores** it (doOptions() does nothing)
3. No CORS headers are returned
4. Browser blocks the request before doPost() runs

The common advice about "doOptions() handling CORS preflight" is **false** - Apps Script ignores OPTIONS requests entirely.

## The Solution

✅ **Use `Content-Type: application/x-www-form-urlencoded` instead of JSON**

This is a "simple" content type that:
- Does NOT trigger CORS preflight
- Gets automatic CORS headers from Google Apps Script (when deployed with "Anyone" access)
- Works reliably across all browsers

## What Changed

### 1. Apps Script (Code.gs)

**Before (BROKEN):**
```javascript
function doPost(e) {
  const requestData = JSON.parse(e.postData.contents); // Forces application/json
  // ...
}
```

**After (WORKING):**
```javascript
function doPost(e) {
  const params = e.parameter; // Works with form-encoded data
  const data = JSON.parse(params.data); // Data is passed as form parameter
  // ...
}
```

### 2. Admin Dashboard (admin.js)

**Before (BROKEN):**
```javascript
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json', // Triggers preflight
  },
  body: JSON.stringify({...})
});
```

**After (WORKING):**
```javascript
const formData = new URLSearchParams({
  action: 'saveQuote',
  secret: CONFIG.appsScript.sharedSecret,
  data: JSON.stringify(quoteData)
});

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded', // No preflight!
  },
  body: formData.toString()
});
```

## Deployment Steps

### Step 1: Update Apps Script
1. Open your Google Sheet → Extensions → Apps Script
2. Delete ALL existing code
3. Copy the entire contents of `google-apps-script/Code.gs` from this repository
4. Click Save
5. Verify line 35 has: `SHARED_SECRET: 'lp-test-9994',`

### Step 2: Deploy/Update Deployment
1. Click **Deploy** → **Manage deployments**
2. If you have an existing deployment:
   - Click the pencil icon (✏️)
   - Verify "Who has access" is set to **Anyone**
   - Click **Deploy**
3. If no deployment exists:
   - Click **Deploy** → **New deployment**
   - Choose **Web app**
   - Set "Execute as": **Me**
   - Set "Who has access": **Anyone**
   - Click **Deploy**
   - Copy the Web App URL

### Step 3: Update config.js (if needed)
If you created a new deployment, update the URL in config.js:
```javascript
appsScript: {
    enabled: true,
    webAppUrl: 'YOUR_NEW_URL_HERE',
    sharedSecret: 'lp-test-9994'
}
```

### Step 4: Deploy to GitHub Pages
1. Commit and push changes:
   ```bash
   git add .
   git commit -m "Fix CORS issue with form-encoded requests"
   git push
   ```
2. Wait for GitHub Pages to deploy (2-3 minutes)

### Step 5: Test
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart your browser
3. Open admin dashboard
4. Try to send a quote
5. Should see: ✅ "Quote saved to Google Sheets!"

## Why This Works

### Simple Requests (No Preflight)
According to CORS spec, a request is "simple" if:
- Method is GET, HEAD, or POST
- Content-Type is one of:
  - `application/x-www-form-urlencoded` ✅
  - `multipart/form-data` ✅
  - `text/plain` ✅
- No custom headers

### Non-Simple Requests (Requires Preflight)
- Content-Type: `application/json` ❌
- Custom headers like Authorization ❌
- Methods like PUT, DELETE, PATCH ❌

Google Apps Script automatically adds CORS headers for simple requests when deployed with "Anyone" access, but it **cannot** handle preflight requests.

## Security Note

**Is "Anyone" access safe?**

YES, because:
- The `sharedSecret` protects all write operations
- Requests without the secret are rejected
- The script only accesses your Google Sheet
- All executions are logged and auditable

To make it more secure:
- Change `lp-test-9994` to a longer, random string
- Update in both Code.gs and config.js
- Keep the secret confidential

## Troubleshooting

### Still getting CORS error?
1. Verify deployment is set to "Anyone" access
2. Clear browser cache completely and restart browser
3. Check that Code.gs matches the repository version
4. Verify SHARED_SECRET matches in both files
5. Make sure you deployed the updated admin.js to GitHub Pages

### "Authentication failed" error?
- Check that `sharedSecret` in config.js matches `SHARED_SECRET` in Code.gs
- Both are case-sensitive

### "Failed to fetch" error?
- Check that the Web App URL is correct in config.js
- Try opening the URL in browser - should show JSON response

## What About doOptions()?

The doOptions() function has been **removed** from the code because:
- Google Apps Script ignores it
- It creates false expectations
- It's not needed with form-encoded requests

## Technical Deep Dive

### Why Apps Script Doesn't Support OPTIONS

Google Apps Script Web Apps are designed as simple endpoints:
- They run server-side only
- They don't have traditional HTTP server features
- They're optimized for simple GET/POST operations

When you deploy with "Anyone" access:
- Google adds CORS headers automatically for simple requests
- Google does NOT route OPTIONS requests to your code
- There's no way to handle preflight in Apps Script

### Alternative Solutions (Not Recommended)

1. **Use GET instead of POST**: Works but semantically incorrect for data modification
2. **Use JSONP**: Old technique, requires callback handling
3. **Proxy server**: Adds complexity and latency
4. **Google Cloud Run**: Overkill for this use case

The form-encoded approach is the simplest and most reliable solution.

---

**Last Updated**: 2024-01-09
**Tested With**: Google Apps Script (latest), Chrome 120+, GitHub Pages
