# Agreed Price Feature - Update Guide

## What Changed

We've added an "Agreed Price" column to the Quote Responses sheet that stores the final negotiated price when a quote is accepted.

## Required Steps to Enable This Feature

### 1. Update Your Google Apps Script

You need to redeploy your Google Apps Script with the updated code:

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Replace the entire contents of `Code.gs` with the updated code from `google-apps-script/Code.gs` in this repository
4. Click **Save** (💾 icon)
5. Click **Deploy > Manage deployments**
6. Click the ✏️ (Edit) icon next to your existing deployment
7. Under "Version", select "New version"
8. Add a description like "Added agreed price column"
9. Click **Deploy**
10. Copy the new Web app URL (it should be the same as before)

### 2. Update the Column Header (Optional but Recommended)

If you want to manually add the header to an existing sheet:

1. Open your Google Sheet
2. Go to the "Quote Responses" tab
3. In cell **N1**, add the header: `Agreed Price`

**OR** let the Apps Script create it automatically:
- The next time a quote is saved, the script will automatically add the column if it doesn't exist

### 3. Test the Feature

1. Go to admin dashboard
2. Open a quote that has already been sent (status: "Sent")
3. Click "Accept Quote"
4. Enter the agreed price (e.g., 1500)
5. Click "✅ Accept & Compose Confirmation Email"
6. Check your Google Sheet - the status should update to "Accepted" and the agreed price should appear in column N

## How It Works

### Workflow:

1. **Pending → Sent**: Admin enters quote amount → Saved to "Quote Amount" column
2. **Sent → Accepted**: Admin enters agreed price → Saved to "Agreed Price" column (may differ from original quote)
3. **Sent → Declined**: Status updates to "Declined", no agreed price saved

### Display Logic:

- **Quote List**: For accepted quotes, shows "Agreed: $X" badge instead of quote amount
- **Quote Detail**: For accepted quotes, shows both "Quote Amount" and "Agreed Price"
- **Dashboard Stats**: "Total Revenue" shows sum of all agreed prices from accepted quotes

## Troubleshooting

### Status Not Updating When Accepting/Declining

**Symptom**: When you accept or decline a quote, the status doesn't change in Google Sheets.

**Causes & Solutions**:

1. **Apps Script Not Updated**: 
   - Make sure you redeployed the Apps Script with the new code
   - Check that the deployment version is the latest

2. **Shared Secret Mismatch**:
   - Open your Apps Script (`Code.gs`)
   - Check the `SHARED_SECRET` value (around line 35)
   - Make sure it matches the `sharedSecret` in your `config.js` (around line 183)

3. **Browser Console Errors**:
   - Open browser developer tools (F12)
   - Go to the Console tab
   - Look for any errors when accepting/declining a quote
   - The console will show logs like "Preparing to save quote" and "Quote data to save"

4. **Apps Script Execution Logs**:
   - Open your Apps Script editor
   - Click **Executions** in the left sidebar
   - Check for any failed executions
   - Click on a failed execution to see the error details

### Agreed Price Not Showing

**Symptom**: The agreed price field is not appearing or not saving.

**Solutions**:

1. Make sure you've updated the Apps Script (see step 1 above)
2. Check that column N exists in your "Quote Responses" sheet
3. Clear your browser cache (Ctrl+Shift+Delete)
4. Reload the admin dashboard

### Testing the Apps Script Directly

You can test if the Apps Script is working:

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Run the `testSetup()` function:
   - Click on the `testSetup` function in the file list
   - Click the ▶️ Run button
   - Check the logs in the **Execution log** panel
4. It should show:
   - Spreadsheet name
   - Whether sheets exist
   - Whether the Quote Responses sheet was created

## Data Structure

The Quote Responses sheet now has these columns:

| Column | Field | Description |
|--------|-------|-------------|
| A | Timestamp | Last modified date |
| B | Quote Request ID | Links to the original request |
| C | Customer Name | Customer's name |
| D | Customer Email | Customer's email |
| E | Quote Amount | Initial quote amount |
| F | Additional Details | Notes, terms, conditions |
| G | Status | Pending, Sent, Accepted, or Declined |
| H | Admin Name | Who sent the quote |
| I | Sent Date | When the quote was sent |
| J | Trip Summary | Trip details |
| K | Total Miles | Distance |
| L | Total Passengers | Number of passengers |
| M | Trip Days | Number of days |
| **N** | **Agreed Price** | **Final negotiated price (NEW)** |

## Questions?

If you're still having issues, check:
1. Browser console for JavaScript errors
2. Apps Script execution logs for server errors
3. Ensure your Google Sheet is still shared with "Anyone with the link"
4. Verify the Apps Script web app URL in config.js is correct
