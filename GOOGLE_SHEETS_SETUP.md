# Google Sheets Integration Setup Guide

This guide will walk you through setting up Google Sheets as the backend for your admin dashboard, so you can access all customer quotes from any device.

## Why Use Google Sheets Integration?

**Without Google Sheets integration:**
- ❌ Admin dashboard only shows quotes submitted from the same browser
- ❌ Can't see customer quotes (they're stored on customer devices)
- ❌ Data not accessible across browsers or devices

**With Google Sheets integration:**
- ✅ Admin dashboard shows ALL quotes from all customers
- ✅ Accessible from any device, any browser, anywhere
- ✅ Centralized data storage on Google's servers
- ✅ Same beautiful UI with maps and formatted data
- ✅ Free and no server hosting required

## Prerequisites

You should already have:
- ✅ A Google Form set up for quote submissions
- ✅ Google Maps API key configured

## Step 1: Link Google Form to Google Sheets

1. Open your Google Form
2. Click the **"Responses"** tab
3. Click the green Sheets icon (📊) that says "Create Spreadsheet"
4. Choose **"Create a new spreadsheet"**
5. Click **"Create"**

Google will create a new Google Sheet and automatically link it to your form. All future form submissions will be automatically added to this sheet.

## Step 2: Get Your Spreadsheet ID

1. The new Google Sheet will open automatically
2. Look at the URL in your browser, it will look like:
   ```
   https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t/edit
   ```
3. Copy the long ID between `/d/` and `/edit` - this is your **Spreadsheet ID**
   
   In the example above, the Spreadsheet ID is: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t`

## Step 3: Make the Spreadsheet Publicly Readable

For the admin dashboard to read data, the spreadsheet must be publicly accessible:

1. In your Google Sheet, click the **"Share"** button (top right)
2. Click **"Change to anyone with the link"**
3. Make sure it's set to **"Viewer"** (not Editor)
4. Click **"Done"**

**Security Note:** This makes the data readable by anyone with the link. The data is not indexed by Google or searchable publicly, but anyone with the Spreadsheet ID could theoretically access it. For most businesses, this is acceptable, but if you handle highly sensitive data, consider implementing a backend with proper authentication.

## Step 4: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select the **same project** you used for Google Maps API
3. Click on **"APIs & Services"** → **"Library"**
4. Search for **"Google Sheets API"**
5. Click on it and click **"Enable"**

That's it! Your existing Google Maps API key will now work with Google Sheets API.

## Step 5: Verify Column Order

1. Open your Google Sheet linked to the form
2. Check the order of columns (they should match the form fields)
3. The default order should be:

   | A | B | C | D | E | F | G | H | I |
   |---|---|---|---|---|---|---|---|---|
   | Timestamp | Trip Days | Passengers | Name | Email | Phone | Company | Description | Notes |

4. If your columns are in a different order, you'll need to adjust the column mapping in `config.js` (Step 7)

## Step 6: Update config.js

Open `config.js` in your code editor and find the `googleSheets` section:

```javascript
googleSheets: {
    enabled: false,  // Change this to true
    spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE',  // Paste your Spreadsheet ID here
    apiKey: '',  // Leave empty to use Maps API key, or add different key
    sheetName: 'Form Responses 1',  // Usually correct by default
    columns: {
        timestamp: 0,      // Column A (0-indexed)
        tripDays: 1,       // Column B
        passengers: 2,     // Column C
        name: 3,           // Column D
        email: 4,          // Column E
        phone: 5,          // Column F
        company: 6,        // Column G
        description: 7,    // Column H
        notes: 8           // Column I
    }
}
```

**Make these changes:**

1. Change `enabled: false` to `enabled: true`
2. Replace `'YOUR_SPREADSHEET_ID_HERE'` with your actual Spreadsheet ID from Step 2
3. Leave `apiKey` empty (it will use your Maps API key automatically)
4. Verify `sheetName` matches your sheet tab name (usually "Form Responses 1")
5. If your columns are in a different order, adjust the numbers in the `columns` section

**Example with real Spreadsheet ID:**

```javascript
googleSheets: {
    enabled: true,  // ✓ Changed to true
    spreadsheetId: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',  // ✓ Your ID
    apiKey: '',  // ✓ Empty = use Maps API key
    sheetName: 'Form Responses 1',
    columns: {
        timestamp: 0,
        tripDays: 1,
        passengers: 2,
        name: 3,
        email: 4,
        phone: 5,
        company: 6,
        description: 7,
        notes: 8
    }
}
```

## Step 7: Test the Integration

1. Submit a test quote through your form
2. Verify it appears in Google Sheets (should be automatic)
3. Open the admin dashboard
4. Login with your admin password
5. You should see:
   - Green banner saying "Reading quotes from Google Sheets"
   - Your test quote in the list
   - All the same beautiful formatting with maps

## Troubleshooting

### "API access denied" Error

**Problem:** The Sheets API returns a 403 error

**Solution:**
1. Make sure Google Sheets API is enabled in Google Cloud Console
2. Make sure the spreadsheet is shared publicly (Anyone with link can view)
3. Check that your API key is correct

### "Spreadsheet not found" Error

**Problem:** The Sheets API returns a 404 error

**Solution:**
1. Double-check the Spreadsheet ID in config.js
2. Make sure you copied the ID correctly (no extra spaces or characters)
3. Verify the spreadsheet exists and hasn't been deleted

### No Quotes Showing Up

**Problem:** The admin dashboard loads but shows "No quote requests yet"

**Solution:**
1. Check that `enabled: true` in config.js
2. Submit a test quote through the form and verify it appears in Google Sheets
3. Check browser console (F12) for error messages
4. Verify the sheet name matches (usually "Form Responses 1")

### Column Mapping Issues

**Problem:** Data appears jumbled or in wrong fields

**Solution:**
1. Open your Google Sheet and check the column order
2. Count the columns starting from 0 (A=0, B=1, C=2, etc.)
3. Update the `columns` mapping in config.js to match your sheet

## Understanding How It Works

### Data Flow

```
Customer submits quote
        ↓
Google Form receives it
        ↓
Automatically saved to Google Sheets
        ↓
Admin opens dashboard
        ↓
Dashboard calls Google Sheets API
        ↓
Reads data and formats it with maps
        ↓
Displays in beautiful UI
```

### What Gets Stored

Google Sheets stores the raw text data from form submissions. The admin dashboard:
- Reads this text data via API
- Parses it back into structured format
- Displays it with all the nice formatting
- Shows interactive maps using the location data
- Calculates and displays route information

### UI Features Preserved

Even though data comes from Google Sheets, you still get:
- ✅ Interactive Google Maps showing routes
- ✅ Formatted dates and times
- ✅ Booking hours calculations
- ✅ Distance and driving time displays
- ✅ "Notable Information" detection (long trips, large groups, etc.)
- ✅ Beautiful card-based layout
- ✅ Detailed modal views

## Advantages of Google Sheets

| Feature | Google Sheets |
|---------|---------------|
| See customer quotes | ✅ Yes |
| Access from any device | ✅ Yes |
| Access from any browser | ✅ Yes |
| Permanent storage | ✅ Yes |
| Backup | ✅ Yes |
| Team access | ✅ Yes |
| Setup complexity | ⚠️ 5-10 minutes |

## Cost

**Free!** Google Sheets integration uses:
- Google Sheets API (free quota: 100 requests per 100 seconds per user)
- Your existing Google Maps API key
- No server hosting costs
- No database costs

For a bus charter quote system, you'll be well within free quotas.

## Security Considerations

### Current Setup (Public Sheet)
- Anyone with the Spreadsheet ID can view the data
- Data is not indexed or searchable by Google
- Suitable for most small to medium businesses
- Similar to having a public webpage

### For Higher Security
If you need more security:
1. Use OAuth 2.0 authentication (requires backend)
2. Implement a backend API that reads from Sheets (hides the Spreadsheet ID)
3. Use service account credentials (requires backend)

For most charter bus businesses, the current public setup is adequate, as the Spreadsheet ID is not published anywhere visible and would need to be guessed or discovered.

## Configuration

The admin dashboard is configured to use Google Sheets as the data source. In `config.js`:

```javascript
googleSheets: {
    enabled: true,  // Must be true for admin dashboard to work
    // ... rest of config
}
```

The admin dashboard will automatically adapt and show the appropriate data source banner.

## Need Help?

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Verify all steps above are completed correctly
3. Test with a fresh form submission
4. Make sure the spreadsheet is linked to your form

## Next Steps

After setting up Google Sheets integration:
1. Test thoroughly with multiple quote submissions
2. Update your admin password (default is `admin123`)
3. Bookmark your admin dashboard URL
4. Train staff on accessing the dashboard
5. Consider setting up email notifications for new submissions

---

**Congratulations!** You now have a centralized, accessible admin dashboard that shows all customer quotes from any device. 🎉
