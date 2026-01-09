# Quote ID System Setup Guide

## Overview

The unique quote ID system has been implemented to fix the status update issue where quotes couldn't be reliably matched between form submissions and saved responses. This system generates a human-readable, unique identifier for each quote submission.

## Quote ID Format

**Format**: `QUOTE-YYYYMMDD-XXXXX`

**Examples**:
- `QUOTE-20260109-A1B2C`
- `QUOTE-20260109-X5T9K`
- `QUOTE-20260215-ZP4M7`

**Components**:
- `QUOTE` - Fixed prefix
- `YYYYMMDD` - Date of submission (e.g., 20260109 for January 9, 2026)
- `XXXXX` - Random 5-character alphanumeric code (uppercase letters and numbers)

## What Changed

### 1. Form Submission
- Each quote now generates a unique ID when submitted
- Quote ID is displayed prominently on the success page
- Quote ID is submitted to Google Forms along with other data

### 2. Admin Dashboard
- Quote IDs are displayed on quote cards
- Quote IDs are shown in the detail modal
- Quote matching now uses the reliable quote ID instead of timestamps

### 3. Status Updates
- Status updates now use quote ID for matching (fixing the previous issue)
- Backward compatible: Falls back to timestamp for old quotes without IDs

## Setup Instructions

### Step 1: Add Quote ID Field to Google Form

1. Open your Google Form (the one linked in `config.js`)
2. Click the **+** button to add a new question
3. **IMPORTANT**: Add this as the FIRST question (right after the timestamp)
4. Configure the question:
   - **Question text**: "Quote ID"
   - **Question type**: "Short answer"
   - **Required**: Yes (check the "Required" toggle)
5. Save the form

### Step 2: Get the Entry ID

1. Right-click on your Google Form page and select **"View Page Source"** or **"Inspect"**
2. Press `Ctrl+F` (or `Cmd+F` on Mac) to search
3. Search for the text "Quote ID" (the question you just added)
4. Look for `entry.` followed by numbers near your question
   - Example: `entry.1234567890`
5. Copy the full entry ID (including `entry.`)

### Step 3: Update config.js

1. Open `config.js` in your project
2. Find the `googleForm.fields` section
3. Replace the placeholder entry ID for `quoteId`:

```javascript
fields: {
    quoteId: 'entry.1234567890',     // Replace with YOUR actual entry ID
    tripDays: 'entry.630078859',
    // ... rest of fields
}
```

### Step 4: Update Google Sheets Column Mapping

Your Google Sheets will now have an extra column (Quote ID) after the Timestamp column.

**New Column Order**:
- Column A: Timestamp
- **Column B: Quote ID** (NEW)
- Column C: Trip Days
- Column D: Passengers
- (etc.)

The column mapping in `config.js` has already been updated. Verify it matches your sheet:

```javascript
googleSheets: {
    columns: {
        timestamp: 0,      // Column A
        quoteId: 1,        // Column B - NEW
        tripDays: 2,       // Column C (was Column B)
        passengers: 3,     // Column D (was Column C)
        // ... etc.
    }
}
```

### Step 5: Test the System

1. **Submit a test quote** through your form
2. **Check the success page** - You should see the quote ID displayed prominently
3. **Check Google Sheets** - The quote ID should appear in Column B
4. **Open admin dashboard** - The quote should display with its ID
5. **Test status update** - Try saving a quote response and verify it updates correctly

## Verification Checklist

- [ ] Added "Quote ID" question to Google Form as the first question
- [ ] Got the entry ID from the form source code
- [ ] Updated `config.js` with the correct entry ID for `quoteId`
- [ ] Verified Google Sheets column mapping matches the new structure
- [ ] Tested form submission and saw quote ID on success page
- [ ] Verified quote ID appears in Google Sheets Column B
- [ ] Tested admin dashboard displays quote IDs
- [ ] Tested status update functionality works correctly

## How It Fixes the Status Update Issue

**Previous Problem**:
- Quotes were matched using timestamps (e.g., "1/9/2026, 5:30:00 PM")
- Timestamps had formatting differences between storage and retrieval
- Quote matching failed, causing status updates to fail

**New Solution**:
- Quotes are matched using unique IDs (e.g., "QUOTE-20260109-A1B2C")
- IDs are consistent across all systems
- Matching is reliable and always works
- Backward compatible with old quotes (falls back to timestamp)

## Troubleshooting

### Quote ID not appearing on success page
- Check that `formData.quoteId` is being generated in `script.js`
- Check browser console for JavaScript errors
- Verify the quote ID is being passed in URL parameters

### Quote ID not saving to Google Sheets
- Verify you added the "Quote ID" field to your Google Form
- Check that the entry ID in `config.js` matches your form
- Test form submission and check the form responses

### Status updates still not working
- Ensure you're testing with NEW quotes (that have quote IDs)
- Old quotes without IDs will fall back to timestamp matching
- Check Apps Script execution logs for errors
- Verify `config.js` Apps Script settings are correct

### Column mapping errors in admin dashboard
- Verify the column indices in `config.js` match your actual Google Sheets
- Remember: Column A = index 0, Column B = index 1, etc.
- The Quote ID should be in Column B (index 1)

## Benefits of the Quote ID System

1. **Reliable Matching**: Quotes are matched accurately every time
2. **Human-Readable**: Easy for staff to reference in communications
3. **Customer Reference**: Customers can reference their quote ID in emails/calls
4. **Backward Compatible**: Old quotes still work (fallback to timestamp)
5. **Unique**: Each quote has a globally unique identifier
6. **Sortable**: IDs contain date information for easy sorting
7. **Professional**: Gives a more professional appearance to the system

## Future Enhancements

Potential improvements that could be made:

- Add quote ID to email confirmations sent to customers
- Include quote ID in admin notification emails
- Add search functionality in admin dashboard by quote ID
- Generate QR codes for quote IDs for easy mobile access
- Add quote ID to printed quotes/invoices

---

**Note**: This guide assumes you've already completed the basic setup from the main README.md. If you haven't set up Google Forms, Google Sheets, or the Apps Script yet, complete those first.
