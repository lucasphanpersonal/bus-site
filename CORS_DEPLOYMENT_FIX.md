# CORS Deployment Fix - Step by Step

## Problem
You're seeing this error:
```
Access to fetch at 'https://script.google.com/macros/s/AKfycbzciOrxnUsYGrZ3Yh1QNe3zKCbMdGN_Cm7pvL11PZTvX36K3DBCVVxUaLPLR2tjyKUs2Q/exec' 
from origin 'https://lucasphanpersonal.github.io' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
The Google Apps Script web app is not properly configured to allow cross-origin requests from your GitHub Pages site. This happens when:
- The deployment is not set to "Anyone" access
- The script is using an old deployment
- There's a caching issue with the deployment

## Solution: Create a Fresh Deployment

### Step 1: Open Apps Script Editor
1. Go to your Google Sheet with the form responses
2. Click **Extensions** → **Apps Script**

### Step 2: Update the Script Code
1. In the Apps Script editor, you should see `Code.gs`
2. **Delete ALL existing code**
3. Go to this repository's `google-apps-script/Code.gs` file
4. **Copy the ENTIRE contents** (all 372 lines)
5. **Paste into the Apps Script editor**
6. Click **Save** (💾) or press Ctrl+S / Cmd+S
7. Wait for "Saved" confirmation

### Step 3: Verify Key Configuration
After pasting, verify these lines in the code:

**Line 35 - Shared Secret** (should match config.js):
```javascript
SHARED_SECRET: 'lp-test-9994',
```

**Lines 95-105 - doOptions function** (handles CORS preflight):
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

If these don't match, fix them and save again.

### Step 4: Delete Old Deployments
1. Click **Deploy** → **Manage deployments**
2. For EACH existing deployment:
   - Click the **Archive** button (📦)
   - Confirm archiving
3. Close the deployments dialog

### Step 5: Create New Deployment
1. Click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure with EXACT settings:
   - **Description**: "Quote Management API - CORS Enabled"
   - **Execute as**: **Me (your-email@gmail.com)**
   - **Who has access**: **Anyone** ⚠️ CRITICAL: Must be "Anyone"
5. Click **Deploy**
6. **Authorize the script** if prompted:
   - Click "Review Permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to [Project Name] (unsafe)"
   - Click "Allow"
7. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycby...NEW_ID.../exec
   ```
8. **Save this URL** - you'll need it in the next step

### Step 6: Test the Deployment
1. Open the Web App URL in your browser (paste the URL from step 5)
2. You should see a JSON response like:
   ```json
   {
     "status": "ok",
     "message": "Bus Charter Quote Management API is running",
     "timestamp": "2024-...",
     "corsEnabled": true,
     "deploymentInfo": {...}
   }
   ```
3. If you see this, the deployment is working!
4. If you get an error or don't see JSON, repeat steps 4-5

### Step 7: Update config.js
1. In your repository, open `config.js`
2. Find the `appsScript` section (around line 180)
3. Update the `webAppUrl` with your NEW URL:
   ```javascript
   appsScript: {
       enabled: true,
       webAppUrl: 'https://script.google.com/macros/s/YOUR_NEW_URL_HERE/exec',
       sharedSecret: 'lp-test-9994'
   }
   ```
4. Save the file
5. Commit and push to GitHub:
   ```bash
   git add config.js
   git commit -m "Update Apps Script URL with CORS-enabled deployment"
   git push
   ```

### Step 8: Wait for GitHub Pages Deployment
1. Go to your repository on GitHub
2. Click **Actions** tab
3. Wait for the deployment to complete (usually 2-3 minutes)
4. You'll see a green checkmark when done

### Step 9: Clear Browser Cache
1. **Close all browser tabs** with your admin dashboard
2. **Clear browser cache**:
   - Chrome/Edge: Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
   - Select "Cached images and files"
   - Select "All time"
   - Click "Clear data"
3. **Restart your browser** (fully quit and reopen)

### Step 10: Test the Fix
1. Open your admin dashboard: https://lucasphanpersonal.github.io/bus-site/admin.html
2. Log in with password: `admin123`
3. Open any quote
4. Enter a quote amount
5. Click "Compose Email"
6. **You should see**: ✅ "Quote saved to Google Sheets!"
7. **Verify in Google Sheet**:
   - Open your Google Sheet
   - Look for "Quote Responses" tab
   - Your quote should appear there

## Verification Checklist

Before declaring success, verify:

- [ ] Apps Script code matches repository version exactly
- [ ] `SHARED_SECRET` in Code.gs is `'lp-test-9994'`
- [ ] `sharedSecret` in config.js is `'lp-test-9994'`
- [ ] Old deployments are archived
- [ ] New deployment is set to "Anyone" access
- [ ] Web App URL opens in browser and shows JSON
- [ ] config.js has the new Web App URL
- [ ] Changes are committed and pushed to GitHub
- [ ] GitHub Pages deployment is complete
- [ ] Browser cache is cleared
- [ ] Browser is restarted
- [ ] Admin dashboard can save quotes without CORS error

## Why This Works

### The CORS Problem
- Browsers enforce Same-Origin Policy for security
- Your admin dashboard (lucasphanpersonal.github.io) and Apps Script (script.google.com) are different origins
- Browsers send a "preflight" OPTIONS request to check if cross-origin requests are allowed
- Apps Script must respond with `Access-Control-Allow-Origin` header

### Google Apps Script CORS Behavior
- Apps Script **automatically adds CORS headers** when:
  - ✅ Deployed as Web App with "Anyone" access
  - ✅ Returns JSON responses (not plain text)
  - ✅ Has `doOptions()` function to handle preflight
- Apps Script **does NOT add CORS headers** when:
  - ❌ Deployed with "Only myself" or organization access
  - ❌ Returns plain text responses
  - ❌ Missing `doOptions()` function

### Why Fresh Deployment
- Old deployments may have incorrect settings
- Cached deployment configurations can cause issues
- Creating a new deployment ensures all settings are correct
- New deployment ID ensures no browser/CDN caching issues

## Troubleshooting

### Still Getting CORS Error After Following All Steps?

**1. Verify Deployment Settings Again**
- Go to Apps Script → Deploy → Manage deployments
- Click pencil icon on your deployment
- Double-check "Who has access" is "Anyone"
- If not, change it and click "Deploy"
- Wait 5 minutes for changes to propagate

**2. Check Browser Developer Console**
- Press F12 to open DevTools
- Go to "Network" tab
- Try to save a quote
- Look for OPTIONS and POST requests to script.google.com
- Click on the OPTIONS request
- Check the "Response Headers"
- Should see: `access-control-allow-origin: *`
- If not present, deployment is not configured correctly

**3. Check Apps Script Execution Logs**
- In Apps Script editor, click "Executions" (left sidebar)
- Look for recent executions
- Check if OPTIONS requests are being received
- Look for any error messages

**4. Test with CURL**
From terminal/command prompt:
```bash
# Test OPTIONS request (CORS preflight)
curl -X OPTIONS -H "Origin: https://lucasphanpersonal.github.io" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -i "YOUR_WEB_APP_URL_HERE"
```

You should see:
```
HTTP/2 200
access-control-allow-origin: *
```

If you don't see `access-control-allow-origin: *`, the deployment is not configured correctly.

**5. Try Incognito/Private Mode**
- Open admin dashboard in incognito/private window
- This eliminates any caching issues
- Try to save a quote
- If it works in incognito, clear cache and cookies in normal mode

**6. Check for Proxy/VPN Issues**
- Some corporate proxies block OPTIONS requests
- Try from a different network
- Try from mobile hotspot

### Authentication Failed Error (After CORS is Fixed)
If CORS is working but you see "Authentication failed":
- The shared secret doesn't match
- Check `SHARED_SECRET` in Code.gs
- Check `sharedSecret` in config.js
- Must be exactly the same (case-sensitive)
- Redeploy Apps Script if you change it

### Other Errors
- "Script function not found": Verify you copied entire Code.gs
- "Not authorized": Run from Apps Script editor to re-authorize
- "Execution time exceeded": Check for infinite loops in code

## Security Note

**Is "Anyone" access safe?**

**YES**, because:
- All write operations require the shared secret (`lp-test-9994`)
- Requests without the secret are rejected
- The script only accesses your Google Sheet
- All executions are logged and auditable
- No sensitive data is exposed without authentication

**To make it more secure:**
- Change `lp-test-9994` to a longer, random string
- Update in both Code.gs and config.js
- Keep the secret confidential
- Monitor execution logs regularly

## Need More Help?

If you're still having issues after following this guide:

1. Check all verification checkboxes above
2. Review error messages in browser console (F12)
3. Check Apps Script execution logs for server-side errors
4. Try the CURL test to isolate the issue
5. Create a completely new Google Sheet and start fresh

## Success!

Once you see "✅ Quote saved to Google Sheets!" in the admin dashboard, you're done! The CORS issue is resolved and your admin dashboard is fully functional.

---

**Last Updated**: 2024-01-09
**Tested With**: Google Apps Script (latest), Chrome 120+, GitHub Pages
