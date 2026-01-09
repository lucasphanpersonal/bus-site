# Troubleshooting: Quote Responses Not Saving to Google Sheets

This guide specifically addresses the issue where quote responses appear to succeed but don't actually save to Google Sheets, and the "Quote Responses" sheet is not being created.

## Symptoms

- ✅ Admin clicks "Send Quote" button
- ✅ Email client opens with pre-filled message
- ❌ Quote doesn't appear in Google Sheets
- ❌ "Quote Responses" sheet is not created (in new/empty spreadsheets)
- ❓ May or may not see error messages

## Recent Improvements (2024-01-09)

We've added better error handling to catch these issues:

### New Error Detection

1. **HTTP Response Validation**: Now checks if the Apps Script actually responded successfully before assuming it worked
2. **JSON Parse Error Handling**: Catches cases where Apps Script returns HTML error pages instead of JSON
3. **Configuration Validation**: Checks if Apps Script is properly configured before attempting to save
4. **Silent Failure Prevention**: Shows warning when Apps Script is disabled (previously failed silently)

### What You'll Now See

With the improved error handling, you should see ONE of these messages:

#### Success Messages
- `💾 Saving quote...` → `✅ Quote saved with status: Sent`
- `💾 Saving quote...` → `✅ Quote updated with status: Accepted/Declined`

#### Warning Messages
- `⚠️ Warning: Apps Script is disabled. Quote will NOT be saved to Google Sheets!`
- Shows when `appsScript.enabled` is `false` in config.js

#### Error Messages
- `❌ Apps Script web app URL is not configured`
- `❌ Apps Script shared secret is not configured or too short`
- `⚠️ Failed to save quote: Authentication failed`
- `⚠️ Failed to save quote: HTTP 404: Not Found`
- `⚠️ Failed to save quote: Invalid response from Apps Script`

## Step-by-Step Diagnostic Process

### Step 1: Check Browser Console

**Action**: Open browser console (Press F12, then click Console tab)

**Look for**:
- Any red error messages
- Messages starting with "Apps Script HTTP response status:"
- Messages starting with "Error saving quote:"

**Common Console Outputs**:

```
✅ Good:
Apps Script HTTP response status: 200 OK
Apps Script response: {success: true, message: "Quote saved successfully", ...}
Quote saved successfully to Sheets

❌ Bad - Authentication Failed:
Apps Script HTTP response status: 200 OK
Apps Script response: {success: false, message: "Authentication failed"}
Error saving quote: Authentication failed

❌ Bad - Wrong URL:
Apps Script HTTP response status: 404 Not Found
Error saving quote: HTTP 404: Not Found. The Apps Script may not be deployed correctly...

❌ Bad - Not JSON:
Failed to parse Apps Script response as JSON: <!DOCTYPE html>...
Error saving quote: Invalid response from Apps Script
```

### Step 2: Verify Apps Script Configuration

#### A. Check if Apps Script is Enabled

**File**: `config.js`

```javascript
appsScript: {
    enabled: true,  // ← MUST be true
    webAppUrl: 'https://script.google.com/macros/s/AKfycby.../exec',
    sharedSecret: 'your-secret-here'
}
```

**If `enabled: false`**:
- You'll see: `⚠️ Warning: Apps Script is disabled`
- **Fix**: Change to `enabled: true`

#### B. Check Web App URL

**Test the URL**:
1. Copy the `webAppUrl` from config.js
2. Paste it into a new browser tab
3. Press Enter

**Expected Result**:
```json
{
  "success": true,
  "message": "Bus Charter Quote Management API is running",
  "timestamp": "2024-01-09T...",
  "note": "Send POST requests with Content-Type: application/x-www-form-urlencoded"
}
```

**If You Get**:
- `404 Not Found` → URL is wrong or Apps Script not deployed
- Blank page or HTML error → Apps Script deployment issue
- CORS error → Not a problem for GET requests, but indicates deployment issue

**How to Get the Correct URL**:
1. Open your Google Sheet
2. Click Extensions → Apps Script
3. Click Deploy → Manage deployments
4. Copy the "Web app" URL from the list
5. **Make sure it ends with `/exec`** (not `/dev`)

#### C. Check Shared Secret

**Files to Check**: `config.js` AND `google-apps-script/Code.gs`

**In config.js**:
```javascript
appsScript: {
    sharedSecret: 'lp-test-9994'  // ← Note this value
}
```

**In Code.gs** (Apps Script editor):
```javascript
const CONFIG = {
    SHARED_SECRET: 'lp-test-9994',  // ← Must match exactly
    // ...
};
```

**Important**:
- Values MUST match exactly (case-sensitive)
- Must be at least 8 characters long
- No extra spaces or quotes

**If They Don't Match**:
- You'll see: `⚠️ Failed to save quote: Authentication failed`
- **Fix**: Update one to match the other

### Step 3: Check Apps Script Deployment

#### A. Verify Deployment Settings

**Action**:
1. Open Apps Script editor (Extensions → Apps Script)
2. Click Deploy → Manage deployments
3. Click the pencil icon (✏️) to edit your deployment

**Required Settings**:
- **Execute as**: Me ([your email])
- **Who has access**: **Anyone** ⚠️ CRITICAL - Must be "Anyone"

**Why "Anyone" is Required**:
- Google Apps Script only adds CORS headers when deployed with "Anyone" access
- Without CORS headers, browsers block cross-origin requests
- The shared secret protects against unauthorized access

**If Set to "Only myself" or "Anyone within [organization]"**:
- Browsers will block the request with CORS error
- Frontend can't read the response
- May appear to work but actually fails silently

#### B. Test Apps Script Directly

**Action**: Run the `testSetup` function

**Steps**:
1. Open Apps Script editor
2. Select `testSetup` from the function dropdown (top of editor)
3. Click Run (▶️) button
4. Check the Execution log (at bottom)

**Expected Output**:
```
Testing setup...
Spreadsheet name: [Your Sheet Name]
Form Responses sheet exists: true
Creating Quote Responses sheet... (or "Quote Responses sheet exists: true")
Setup test complete!
```

**If You Get Authorization Prompt**:
1. Click "Review Permissions"
2. Choose your Google account
3. Click "Advanced" → "Go to [Your Project]"
4. Click "Allow"
5. Run `testSetup` again

**If It Fails**:
- Check the error message in the execution log
- Common errors:
  - "Sheet not found" → The script can't find "Form Responses 1"
  - "Permission denied" → Authorization issue
  - Other errors → Read the specific error message

#### C. Check Recent Executions

**Action**:
1. Open Apps Script editor
2. Click **Executions** (📋 icon) in the left sidebar
3. Look for recent executions

**What to Look For**:
- ✅ Status: "Completed" (green checkmark)
- ❌ Status: "Failed" (red X)

**If Failed Executions Exist**:
1. Click on the failed execution
2. Read the error message
3. Common errors:
   - "Authorization required" → Run `testSetup` to authorize
   - "Authentication failed" → Shared secret mismatch
   - "Sheet not found" → Missing "Form Responses 1" sheet
   - Other → Follow the specific error guidance

### Step 4: Check Google Sheets

#### A. Verify Spreadsheet ID

**Action**:
1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
3. Copy the SPREADSHEET_ID part
4. Compare with `config.js`:

```javascript
googleSheets: {
    spreadsheetId: '180fD_bqLFvRc0WjS8fXeXsomc_feqd2R_Nz5HSpLi8k',  // ← Must match
    // ...
}
```

**If IDs Don't Match**:
- Apps Script will try to write to the wrong spreadsheet
- **Fix**: Update config.js with the correct ID

#### B. Check Sheet Permissions

**Action**:
1. Open your Google Sheet
2. Click the "Share" button (top right)

**Requirements**:
- The account running the Apps Script (you) must have Editor access
- The sheet can be private (doesn't need to be public)

**If You Don't Have Editor Access**:
- Apps Script can't create sheets or write data
- **Fix**: Get the owner to give you Editor access

#### C. Manual Sheet Creation Test

**Action**: Create the "Quote Responses" sheet manually

**Steps**:
1. Open your Google Sheet
2. Click the "+" button at the bottom (next to sheet tabs)
3. Right-click the new sheet → Rename to "Quote Responses"
4. Try sending a quote again

**Result**:
- If it works now → Apps Script couldn't create the sheet due to permissions
- If it still fails → Different issue (check earlier steps)

### Step 5: Test with Network Tab

**For Advanced Users**:

**Action**:
1. Open browser console (F12)
2. Go to **Network** tab
3. Filter by "Fetch/XHR"
4. Click "Send Quote" in admin dashboard
5. Look for a request to `script.google.com`

**Click on the Request** to see:

**Request Details**:
- **URL**: Should match your `webAppUrl`
- **Method**: Should be "POST"
- **Status**: Should be "200 OK"

**Request Payload** (Form Data):
- `action`: "saveQuote" or "updateQuote"
- `secret`: [your shared secret]
- `data`: [JSON string with quote data]

**Response**:
- **Good**: `{"success":true,"message":"Quote saved successfully",...}`
- **Bad**: `{"success":false,"message":"Authentication failed"}` (or other error)
- **Worse**: HTML error page instead of JSON

**Common Network Issues**:
- Status `404` → Wrong URL
- Status `403` → Possible CORS or authentication issue
- Status `500` → Apps Script execution error
- Response is HTML → Apps Script returned an error page

## Common Root Causes and Fixes

### 1. Apps Script Not Deployed

**Symptoms**:
- Error: `HTTP 404: Not Found`
- Testing the URL in browser returns 404

**Fix**:
1. Open Apps Script editor
2. Click Deploy → New deployment
3. Select type: Web app
4. Configure:
   - Execute as: Me
   - Who has access: Anyone
5. Click Deploy
6. Copy the new web app URL
7. Update `config.js` with the new URL

### 2. Apps Script Deployed with Wrong Access

**Symptoms**:
- CORS errors in console
- Appears to work but actually fails

**Fix**:
1. Open Apps Script editor
2. Click Deploy → Manage deployments
3. Click pencil icon to edit
4. Change "Who has access" to **Anyone**
5. Click Deploy

### 3. Shared Secret Mismatch

**Symptoms**:
- Error: `Authentication failed`
- Console shows: `Apps Script response: {success: false, message: "Authentication failed"}`

**Fix**:
1. Open `config.js` → note the `sharedSecret` value
2. Open Apps Script editor → note the `SHARED_SECRET` value
3. Update one to match the other exactly
4. If you change Code.gs, just save (changes are instant)
5. If you change config.js, commit and push

### 4. Apps Script Disabled in Config

**Symptoms**:
- Warning: `Apps Script is disabled. Quote will NOT be saved`
- Email opens but nothing saves

**Fix**:
1. Open `config.js`
2. Find `appsScript.enabled`
3. Change from `false` to `true`
4. Commit and push changes

### 5. Wrong Spreadsheet in Apps Script

**Symptoms**:
- No errors shown
- Quote Responses sheet appears in WRONG spreadsheet

**Cause**: The Apps Script is attached to a different spreadsheet

**Fix**:
1. Open the CORRECT Google Sheet (the one you want to use)
2. Click Extensions → Apps Script
3. Delete existing code and paste the Code.gs content
4. Follow deployment steps again
5. Update config.js with the new web app URL

### 6. Apps Script Not Authorized

**Symptoms**:
- Error in Apps Script executions: "Authorization required"
- testSetup function fails with permission error

**Fix**:
1. Open Apps Script editor
2. Select `testSetup` from dropdown
3. Click Run (▶️)
4. When prompted, click "Review Permissions"
5. Follow authorization flow
6. Run testSetup again to verify

## Prevention: Pre-Deployment Checklist

Before deploying your site, verify:

- [ ] Apps Script is deployed as Web app with "Anyone" access
- [ ] Tested web app URL in browser (returns JSON)
- [ ] Shared secret matches in config.js and Code.gs
- [ ] Shared secret is at least 8 characters
- [ ] appsScript.enabled is true in config.js
- [ ] Web app URL ends with /exec (not /dev)
- [ ] Spreadsheet ID in config.js matches your actual spreadsheet
- [ ] Run testSetup function successfully
- [ ] No failed executions in Apps Script logs
- [ ] Test sending a quote before going live

## Still Not Working?

If you've followed all steps and it still doesn't work:

1. **Start Fresh**:
   - Create a brand new deployment (Deploy → New deployment)
   - Use the new web app URL
   - Test with a simple quote

2. **Check Browser**:
   - Try a different browser (Chrome, Firefox, Edge)
   - Disable browser extensions temporarily
   - Clear cache and cookies

3. **Check Google Status**:
   - Visit [Google Workspace Status](https://www.google.com/appsstatus)
   - Verify Apps Script is operational

4. **Collect Debug Info**:
   - Browser console log (full output)
   - Apps Script execution logs (screenshot)
   - Network tab request/response (screenshot)
   - Your config.js settings (redact secrets)

## Reference: How the Save Flow Works

Understanding the flow helps with debugging:

1. **User clicks "Send Quote"** in admin dashboard
2. **Frontend validates config** (checks enabled, URL, secret)
3. **Frontend prepares data** (formats quote information)
4. **Frontend sends POST request** to Apps Script web app
5. **Apps Script validates request** (checks shared secret)
6. **Apps Script gets spreadsheet** (SpreadsheetApp.getActiveSpreadsheet())
7. **Apps Script checks for "Quote Responses" sheet**
8. **If sheet doesn't exist**, Apps Script creates it with headers
9. **Apps Script appends quote data** to the sheet
10. **Apps Script returns success response** (JSON)
11. **Frontend receives response** and checks success
12. **Frontend reloads quotes** (shows updated status)
13. **Frontend opens email client** (mailto: link)

**Any step can fail** - the improved error handling now catches and reports which step failed.

## Success Indicators

You know it's working when:

✅ Browser console shows: "Quote saved successfully to Sheets"
✅ No red error messages appear
✅ "Quote Responses" sheet exists in Google Sheets
✅ Your quote appears as a new row in "Quote Responses" sheet
✅ Status column shows "Sent" (or "Accepted"/"Declined")
✅ Quote list in dashboard shows the correct status badge
✅ Apps Script Executions shows "Completed" status
✅ No failed executions in Apps Script logs

## Related Documentation

- `APPS_SCRIPT_SETUP.md` - Complete setup guide
- `TROUBLESHOOTING_STATUS_UPDATES.md` - Status update troubleshooting
- `google-apps-script/README.md` - Apps Script documentation
- `google-apps-script/Code.gs` - The actual Apps Script code
