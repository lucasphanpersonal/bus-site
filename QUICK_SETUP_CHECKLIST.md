# Quick Setup Checklist - Agreed Price Feature

## What You Need to Do

### Step 1: Update Google Apps Script (Required)
- [ ] Open your Google Sheet
- [ ] Click **Extensions > Apps Script**
- [ ] Copy code from `google-apps-script/Code.gs` in this repo
- [ ] Paste into Apps Script editor (replace all existing code)
- [ ] Click **💾 Save**
- [ ] Click **Deploy > Manage deployments**
- [ ] Click **✏️ Edit** next to existing deployment
- [ ] Select **New version** under Version dropdown
- [ ] Click **Deploy**
- [ ] Verify the Web app URL is still in your config.js

### Step 2: Test the Feature
- [ ] Go to admin dashboard and log in
- [ ] Open a quote with status "Sent"
- [ ] Click "Accept Quote"
- [ ] Enter agreed price (e.g., 1500)
- [ ] Click "✅ Accept & Compose Confirmation Email"
- [ ] Check Google Sheet - status should be "Accepted"
- [ ] Check Google Sheet - column N should have agreed price
- [ ] Dashboard should show updated "Total Revenue"

### Step 3: Troubleshoot (If Needed)

If status isn't updating:
- [ ] Open browser console (F12 → Console tab)
- [ ] Look for "Preparing to save quote" and "Quote data to save" logs
- [ ] Check Apps Script > Executions for any errors
- [ ] Verify shared secret matches:
  - Apps Script Code.gs line 35: `SHARED_SECRET`
  - config.js line 183: `sharedSecret`
- [ ] Make sure both are the same value

### Step 4: Clear Browser Cache
- [ ] Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- [ ] Select "Cached images and files"
- [ ] Click "Clear data"
- [ ] Reload admin dashboard

## What Changed in the UI

✅ **Quote List**: Accepted quotes show "Agreed: $X" instead of quote amount
✅ **Quote Detail**: Accepted quotes display both Quote Amount and Agreed Price
✅ **Dashboard**: New "Total Revenue" stat card
✅ **Accept Form**: New field for entering agreed price when accepting quotes
✅ **Google Sheet**: New column N for "Agreed Price"

## Need Help?

See these files for more information:
- `AGREED_PRICE_UPDATE.md` - Detailed setup and troubleshooting
- `AGREED_PRICE_FEATURE_SUMMARY.md` - Visual guide and workflow

## Common Issues

**"Status not updating"**
→ Redeploy Apps Script with new code

**"Agreed price not showing"**
→ Clear browser cache and reload

**"Apps Script errors"**
→ Check Executions tab for details

**"Column N doesn't exist"**
→ Apps Script will create it automatically on first save
