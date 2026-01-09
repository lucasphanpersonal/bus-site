# Troubleshooting Status Updates and Google Sheets Sync

This guide helps you verify that quote status updates and Google Sheets synchronization are working correctly after the recent fixes.

## What Was Fixed

The previous implementation used `mode: 'no-cors'` for API requests to Google Apps Script, which prevented the admin dashboard from reading responses. This meant:
- ❌ No way to know if requests succeeded or failed
- ❌ Authentication errors were invisible
- ❌ Data validation errors went undetected
- ❌ Success messages appeared even when saves failed

**The Fix**: Removed `mode: 'no-cors'` and added proper response handling so the dashboard can now:
- ✅ Read response status codes
- ✅ Parse JSON responses from the Apps Script
- ✅ Detect authentication failures
- ✅ Show accurate success/error messages
- ✅ Stop the workflow if save fails

## Prerequisites for the Fix to Work

### 1. Apps Script Deployment Configuration

The Google Apps Script **MUST** be deployed with these exact settings:

- **Execute as**: Me ([your email])
- **Who has access**: **Anyone** ⚠️ **CRITICAL**

Why "Anyone" access is required:
- Google Apps Script only sends CORS headers (Cross-Origin Resource Sharing) when deployed with "Anyone" access
- Without CORS headers, browsers block cross-origin requests
- The shared secret in the code protects against unauthorized access

**How to Verify**:
1. Open the Apps Script editor (Extensions → Apps Script in your Google Sheet)
2. Click **Deploy** → **Manage deployments**
3. Click the pencil icon (✏️) to edit your deployment
4. Check that "Who has access" is set to **Anyone**
5. If not, change it to "Anyone" and click **Deploy**

### 2. Shared Secret Must Match

The `sharedSecret` in `config.js` must EXACTLY match the `SHARED_SECRET` in `Code.gs`:

**In config.js**:
```javascript
appsScript: {
    enabled: true,
    webAppUrl: 'https://script.google.com/macros/s/AKfycby.../exec',
    sharedSecret: 'your-secret-here',  // ← This value
}
```

**In Code.gs**:
```javascript
const CONFIG = {
    SHARED_SECRET: 'your-secret-here',  // ← Must match exactly
    // ...
};
```

**How to Verify**:
1. Open `config.js` and note the `sharedSecret` value
2. Open the Apps Script editor and find the `SHARED_SECRET` value
3. Compare them character-by-character (case-sensitive)
4. If they don't match, update one to match the other
5. If you change `Code.gs`, save the script (changes are instant)
6. If you change `config.js`, commit and push changes

### 3. Web App URL Must Be Correct

**In config.js**:
```javascript
appsScript: {
    enabled: true,
    webAppUrl: 'https://script.google.com/macros/s/AKfycby.../exec',  // ← Check this
}
```

**How to Verify**:
1. Open the Apps Script editor
2. Click **Deploy** → **Manage deployments**
3. Copy the "Web app" URL from the deployment list
4. Compare it with the URL in `config.js`
5. Make sure it ends with `/exec` (not `/dev`)

### 4. Apps Script Must Be Enabled

**In config.js**:
```javascript
appsScript: {
    enabled: true,  // ← Must be true
    // ...
}
```

## Testing the Fix

### Test 1: Initial Quote Send

This tests saving a new quote to Google Sheets.

1. **Open admin dashboard** and log in
2. **Click on any quote** that doesn't have a status badge (shows "⏳ Pending")
3. **Enter a quote amount** (e.g., 1500)
4. **Add some details** (optional)
5. **Click "📧 Send Quote"**

**Expected Results**:
- You should see: "💾 Saving quote..."
- Then: "✅ Quote saved with status: Sent"
- Your email client opens with pre-filled message
- The modal closes and the quote list refreshes
- The quote now shows a green "Sent" badge
- Check Google Sheets: A "Quote Responses" sheet appears with your quote

**If It Fails**:
- Look for a red error message at the top right
- Open browser console (F12) → Console tab
- Look for error messages starting with "Error saving quote:"
- Common issues:
  - "Authentication failed" → Shared secret mismatch
  - "Apps Script web app URL not configured" → Missing or wrong URL
  - "Failed to fetch" → Web app URL is wrong or deployment is broken
  - Network error → Check internet connection

### Test 2: Accept Quote

This tests updating an existing quote's status.

1. **Open a quote** that has a green "Sent" badge
2. **Scroll to "Accept Quote" section** (green border)
3. **Enter agreed price** (can be same or different from original)
4. **Add notes** (optional)
5. **Click "✅ Accept & Compose Confirmation Email"**

**Expected Results**:
- You should see: "💾 Saving quote..."
- Then: "✅ Quote updated with status: Accepted"
- Email client opens with confirmation message
- The modal closes and quote list refreshes
- The quote now shows a blue "Accepted" badge
- Check Google Sheets: The quote's status is updated to "Accepted" and the agreed price is filled in

**If It Fails**:
- Check browser console for errors
- Verify the quote exists in the "Quote Responses" sheet
- Check that the Quote Request ID column matches the timestamp

### Test 3: Decline Quote

This tests declining a quote.

1. **Open a quote** that has a green "Sent" badge
2. **Scroll to "Decline Quote" section** (red border)
3. **Enter a reason** (optional)
4. **Click "❌ Decline & Compose Email"**

**Expected Results**:
- You should see: "💾 Saving quote..."
- Then: "✅ Quote updated with status: Declined"
- Email client opens with decline message
- The modal closes and quote list refreshes
- The quote now shows a red "Declined" badge
- Check Google Sheets: Status is "Declined", reason is in Additional Details

## Common Issues and Solutions

### Issue: "Authentication failed"

**Symptom**: Red error message says "Authentication failed. Please check your shared secret in config.js"

**Cause**: The shared secret in `config.js` doesn't match the one in `Code.gs`

**Solution**:
1. Open both files side-by-side
2. Copy the secret from one to the other (make sure they match exactly)
3. Save both files
4. Try again

### Issue: "Apps Script is not properly configured"

**Symptom**: Red error message says "Apps Script is not properly configured"

**Cause**: Missing or incorrect web app URL in `config.js`

**Solution**:
1. Open Apps Script editor
2. Click Deploy → Manage deployments
3. Copy the Web app URL
4. Paste it into `config.js` under `appsScript.webAppUrl`
5. Make sure `appsScript.enabled` is `true`
6. Commit and push changes

### Issue: Quote saves but status doesn't update in UI

**Symptom**: See success message but the badge doesn't change color

**Cause**: The `loadQuotes()` call after saving might be too fast

**Solution**:
1. Manually refresh the page (F5 or Ctrl+R)
2. The updated status should appear
3. If it doesn't, check the Google Sheet directly
4. If the sheet shows the correct status but the dashboard doesn't, there may be a caching issue

**Workaround**:
- Close and reopen the quote detail modal
- The updated information should load

### Issue: CORS Error in Console

**Symptom**: Browser console shows "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause**: The Apps Script web app is not deployed with "Anyone" access

**Solution**:
1. Open Apps Script editor
2. Click Deploy → Manage deployments
3. Click the pencil icon to edit
4. Change "Who has access" to **Anyone**
5. Click Deploy
6. Try again

### Issue: "TypeError: Failed to fetch"

**Symptom**: Red error message with fetch failure

**Possible Causes**:
1. Wrong web app URL
2. Internet connection issue
3. Google Apps Script is down (rare)
4. Browser blocking the request

**Solutions**:
1. **Test the URL directly**:
   - Copy the web app URL from `config.js`
   - Paste it into a new browser tab
   - You should see: `{"status":"ok","message":"Bus Charter Quote Management API is running",...}`
   - If you get an error, the URL is wrong or the deployment is broken

2. **Check internet connection**:
   - Try loading google.com
   - Check other websites work

3. **Clear browser cache**:
   - Press Ctrl+Shift+Delete (Chrome/Edge)
   - Clear cached images and files
   - Try again

4. **Try a different browser**:
   - If it works in another browser, there's a browser-specific issue

### Issue: Success message but nothing in Google Sheets

**Symptom**: Dashboard says "Quote saved" but Google Sheets is empty

**Cause**: The Apps Script execution might have failed silently

**Solution**:
1. Open the Apps Script editor
2. Click **Executions** (📋) in the left sidebar
3. Look for recent executions
4. Click on any failed executions to see error details
5. Common errors:
   - "Authorization required" → Run the `testSetup` function and authorize
   - "Sheet not found" → The script couldn't find "Form Responses 1" sheet
   - Other errors → Read the error message and fix accordingly

## Debugging Tips

### Enable Detailed Logging

Open browser console (F12) before testing. You'll see detailed logs:

```
Preparing to save quote: {emailType: "initial", newStatus: "Sent", ...}
Quote data to save: {quoteRequestId: "2024-01-09T...", ...}
Saving quote to Sheets: {quoteRequestId: "2024-01-09T...", ...}
Apps Script response: {success: true, message: "Quote saved successfully", ...}
Quote saved successfully to Sheets
```

If something fails, you'll see:
```
Error saving quote to Sheets: Error: Authentication failed
```

### Test Apps Script Directly

You can test the Apps Script without using the dashboard:

1. Open the Apps Script editor
2. Click **Executions** in the left sidebar
3. See if there are any failed executions
4. Run the `testSetup` function:
   - Select `testSetup` from the function dropdown
   - Click Run (▶️)
   - Check the execution log for success/error messages

### Check Google Sheets Directly

After attempting to save a quote:

1. Open your Google Sheet
2. Look for a tab called "Quote Responses"
3. Check if your quote appears there
4. Verify the Status column shows the correct status
5. Check the Timestamp to see when it was last updated

### Network Tab Analysis

For advanced debugging:

1. Open browser console (F12)
2. Go to **Network** tab
3. Filter by "Fetch/XHR"
4. Perform a quote save action
5. Look for a request to `script.google.com`
6. Click on it to see:
   - Request headers
   - Request payload (the data being sent)
   - Response status code
   - Response body

## Still Having Issues?

If none of the above solutions work:

1. **Double-check all prerequisites** in the "Prerequisites for the Fix to Work" section
2. **Try the test workflow** step-by-step, noting exactly where it fails
3. **Collect debugging information**:
   - Browser console errors (F12 → Console)
   - Apps Script execution logs (Apps Script editor → Executions)
   - Network request details (F12 → Network → click on the request)
4. **Check the APPS_SCRIPT_SETUP.md** guide for comprehensive setup instructions
5. **Review recent changes** to `config.js` or `Code.gs` that might have broken something

## Verification Checklist

Use this checklist to verify everything is working:

- [ ] Apps Script deployed with "Anyone" access
- [ ] Shared secret matches in both config.js and Code.gs
- [ ] Web app URL is correct and ends with /exec
- [ ] appsScript.enabled is true in config.js
- [ ] Can test web app URL directly in browser (returns JSON)
- [ ] Initial quote send works and creates "Quote Responses" sheet
- [ ] Quote appears in Google Sheets with correct data
- [ ] Status badge updates in dashboard after save
- [ ] Accept quote works and updates status to "Accepted"
- [ ] Agreed price is saved when accepting
- [ ] Decline quote works and updates status to "Declined"
- [ ] No error messages in browser console
- [ ] No failed executions in Apps Script logs

If all items are checked, the system is working correctly! ✅

## Recent Changes Summary

**What Changed** (January 2024):
- Removed `mode: 'no-cors'` from fetch requests
- Added proper JSON response parsing
- Added authentication error detection
- Added specific error messages for different failure types
- Increased error message display time from 3s to 5s
- Added early return on save failure (prevents email composition)
- Updated documentation to emphasize "Anyone" access requirement

**Why It Matters**:
- The dashboard can now detect when saves fail
- Users see accurate error messages
- Authentication issues are immediately visible
- The workflow stops if save fails, preventing data loss

**Migration Required**:
- No changes needed to config.js
- No changes needed to Code.gs
- Just ensure "Anyone" access is set in deployment (may already be set)
