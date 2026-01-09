# Admin Quote Management User Guide

This guide explains how to use the quote management features in the admin dashboard to save, edit, and track your quote responses.

## Overview

The quote management system allows you to:
- 💾 Save quote responses directly from the admin dashboard
- ✏️ Edit and update existing quotes
- 📊 Track quote status (Sent, Draft, Accepted, Declined)
- 👀 See which quotes have been responded to at a glance
- 📧 Compose emails with pre-filled quote information

## Prerequisites

Before you can use these features, you need to:
1. ✅ Complete the Google Sheets integration setup
2. ✅ Deploy the Google Apps Script (see [APPS_SCRIPT_SETUP.md](APPS_SCRIPT_SETUP.md))
3. ✅ Enable Apps Script in your `config.js`

## Sending Your First Quote

### Step 1: Open the Quote Request

1. Log into the admin dashboard
2. You'll see a list of all quote requests
3. Quotes without responses show a yellow "⏳ Pending" badge
4. Click on any quote to open the detail view

### Step 2: Review the Trip Details

In the quote detail modal, you'll see:
- Customer contact information
- Full trip details with dates, times, and locations
- Route information (distance, driving time, booking hours)
- Map visualization of the routes
- Any notable information (multi-day trips, large groups, etc.)

### Step 3: Enter Your Quote

Scroll down to the "Send Quote Response" section:

1. **Enter Quote Amount**: Type the dollar amount (e.g., 1500)
2. **Add Details** (optional): Include any additional terms, conditions, or notes
3. Click **"📧 Compose Email"**

### What Happens Next

When you click "Compose Email":

1. ✅ The quote is **automatically saved to Google Sheets**
2. ✅ You'll see a confirmation: "✅ Quote saved to Google Sheets!"
3. ✅ Your email client opens with a **pre-filled message** containing:
   - The quote amount
   - Complete trip summary
   - All trip details
   - Your business signature
4. ✅ You can edit the email before sending if needed
5. ✅ Click Send in your email client to send the quote

## Editing a Saved Quote

If you need to update a quote after saving it:

### Step 1: Open the Quote

1. Open the same quote request in the admin dashboard
2. You'll now see the saved quote information at the top:
   - Quote amount
   - Status
   - When it was sent
   - Any additional details

### Step 2: Edit the Quote

1. Click the **"✏️ Edit Quote"** button (this focuses the input fields)
2. Update the quote amount or additional details
3. Click **"Update & Compose Email"**

### What Happens

- ✅ The quote is **updated in Google Sheets**
- ✅ Your email client opens with the updated information
- ✅ You can send the updated quote to the customer

## Managing Quote Status

You can track the status of each quote through the process:

### Available Statuses

| Status | Meaning | Use When |
|--------|---------|----------|
| 🟢 **Sent** | Quote has been sent to customer | You've sent the initial quote email |
| 🟡 **Draft** | Quote is being prepared | You're still working on pricing |
| 🔵 **Accepted** | Customer accepted the quote | Customer confirms they want to book |
| 🔴 **Declined** | Customer declined the quote | Customer decides not to proceed |

### Updating Status

1. Open the quote detail modal
2. Find the status dropdown (only visible for saved quotes)
3. Select the new status
4. Click **"💾 Update Status"**
5. The status updates immediately in Google Sheets
6. The dashboard refreshes to show the new status

### Status Without Sending Email

You can update the status **without** composing a new email:

- Useful when customer calls or emails you directly
- Useful for keeping track of progress
- Just change the dropdown and click "Update Status"

## Understanding Status Badges

In the quote list view, you'll see status indicators:

- 🟢 **Green badge** (Sent): Quote has been sent
- 🟡 **Yellow badge** (Draft): Quote is in draft
- 🔵 **Blue badge** (Accepted): Customer accepted
- 🔴 **Red badge** (Declined): Customer declined
- ⏳ **Yellow badge** (Pending): No quote sent yet

This makes it easy to see at a glance which quotes need attention.

## Viewing Saved Quote Details

When viewing a quote that has a saved response:

### What You'll See

1. **Status Badge**: Shows current status with color coding
2. **Quote Amount**: Prominently displayed
3. **Sent Information**: Who sent it and when
4. **Additional Details**: Any custom notes added
5. **Edit Button**: Quick access to edit the quote
6. **Pre-filled Form**: Form fields automatically filled with saved data

### Quote Amount in List View

For quotes with responses, the list view shows:
- **Quote Amount** instead of "Booking Hours"
- This helps you quickly see how much each job is worth

## Tips and Best Practices

### 1. Save Quotes Even If You Don't Send Immediately

You can:
- Enter a quote amount
- Set status to "Draft"
- Update status when you send later

This helps you:
- Track quotes you're working on
- Come back to unfinished quotes
- Remember what you quoted

### 2. Use Additional Details Effectively

Include in the additional details:
- Payment terms (deposit, final payment)
- What's included (driver, fuel, tolls)
- What's NOT included (gratuity, parking)
- Cancellation policy
- Special conditions or requirements

### 3. Update Status Promptly

Keep statuses current to:
- Know which quotes are still pending
- See your conversion rate (Accepted vs total)
- Follow up on sent quotes that haven't been accepted
- Track why quotes were declined (add notes)

### 4. Review Before Sending

Even though the email is pre-filled:
- Always review the email before sending
- Check all dates and details are correct
- Verify the quote amount matches your calculation
- Add personal touches if desired

### 5. Keep Google Sheets as Backup

Your "Quote Responses" sheet is a valuable business record:
- Export it regularly for accounting
- Track trends over time
- Calculate conversion rates
- Review declined quotes to improve pricing

## Troubleshooting

### "Apps Script is not enabled" Message

**Problem**: You see a warning that Apps Script is disabled

**Solution**:
1. Check that `appsScript.enabled` is set to `true` in `config.js`
2. Make sure you completed the Apps Script setup
3. Refresh the admin dashboard

### Quote Doesn't Save

**Problem**: No success message after clicking "Compose Email"

**Solution**:
1. Check the browser console (F12) for errors
2. Verify the Apps Script web app URL is correct in `config.js`
3. Check that the shared secret matches in both places
4. See [APPS_SCRIPT_SETUP.md](APPS_SCRIPT_SETUP.md) for detailed troubleshooting

### Can't See Saved Quotes

**Problem**: Saved quotes don't appear when reopening the quote

**Solution**:
1. Refresh the admin dashboard
2. Check that quotes are actually in the "Quote Responses" sheet in Google Sheets
3. Verify the Quote Request ID column matches the timestamp of the request
4. Check Apps Script execution logs for errors

### Status Update Doesn't Work

**Problem**: Status doesn't change when you update it

**Solution**:
1. Make sure you clicked "Update Status" button
2. Wait for the confirmation message
3. Check the Google Sheet to verify the update
4. If it still doesn't work, check Apps Script execution logs

### Email Client Doesn't Open

**Problem**: Nothing happens when you click "Compose Email"

**Solution**:
1. This is a different issue from quote saving
2. See [EMAIL_RESPONSE_GUIDE.md](EMAIL_RESPONSE_GUIDE.md) for email client troubleshooting
3. The quote should still be saved even if email doesn't open
4. You can manually compose the email using the details shown

## Advanced Usage

### Tracking Multiple Versions

If you need to send multiple versions of a quote:

1. Send initial quote (saves as status "Sent")
2. Customer requests changes
3. Edit the quote with new amount
4. Click "Update & Compose Email"
5. The quote is updated (not duplicated)

**Note**: Currently, the system doesn't track version history. Each update overwrites the previous version. The timestamp shows when it was last modified.

### Bulk Status Updates

If you need to update multiple quotes:

1. Consider using the Google Sheet directly
2. Open the "Quote Responses" sheet
3. Filter by status
4. Update the Status column for multiple rows
5. Timestamps will still reflect last update

### Exporting Quote Data

To export your quote data for reporting:

1. Open the "Quote Responses" sheet in Google Sheets
2. File → Download → Choose format (Excel, CSV, PDF)
3. Use the data for:
   - Financial reports
   - Sales analysis
   - Conversion tracking
   - Customer relationship management

## Keyboard Shortcuts

While viewing a quote:

- **Tab**: Navigate between quote amount and details fields
- **Enter**: (In quote amount field) Moves to details field
- **Ctrl/Cmd + Enter**: Could be added for quick send (feature request)

## Mobile Usage

The admin dashboard works on mobile devices:

- ✅ View all quotes
- ✅ Open quote details
- ✅ See saved quote information
- ✅ Update status
- ⚠️ Composing emails may require mobile email app
- ⚠️ Editing on small screens can be challenging

**Tip**: For best experience, use a tablet or desktop for sending quotes.

## FAQ

**Q: Can I delete a saved quote?**  
A: Not from the UI currently. You can manually delete from the Google Sheet, or change status to "Declined" to mark it as no longer active.

**Q: Can I see a history of changes to a quote?**  
A: Not currently. The timestamp shows the last update, but previous versions aren't tracked. Consider this a feature for future enhancement.

**Q: What happens if I save the same quote twice?**  
A: The second save updates the first one - it doesn't create a duplicate. The quote is identified by the request timestamp.

**Q: Can multiple admins use this at the same time?**  
A: Yes! All admins see the same data from Google Sheets. However, if two admins edit the same quote simultaneously, the last save wins.

**Q: Is there a character limit for additional details?**  
A: Google Sheets cells can hold up to 50,000 characters. In practice, keep additional details to a few paragraphs for best results.

**Q: Can I customize the email template?**  
A: The email is generated in the admin.js file. You can modify the template, but it requires editing the code. The signature can be customized in config.js.

**Q: Does this work offline?**  
A: No, you need internet connection to save quotes (they're saved to Google Sheets in the cloud).

## Getting Help

If you need assistance:

1. Check this guide first for common questions
2. Review [APPS_SCRIPT_SETUP.md](APPS_SCRIPT_SETUP.md) for setup issues
3. Check the browser console (F12) for error messages
4. Review Apps Script execution logs for server-side errors
5. Check that Google Sheets integration is working correctly

## Future Enhancements

Potential improvements being considered:

- [ ] Version history for quotes
- [ ] Quote templates for different vehicle types
- [ ] Automatic quote calculation based on mileage
- [ ] Integration with calendar for availability
- [ ] Deposit tracking
- [ ] Automated follow-up reminders
- [ ] Quote comparison (show multiple quotes to customer)
- [ ] Customer portal for viewing quote status

---

**Happy Quoting!** 🚌💰

If you have suggestions for improving this guide or the quote management features, please open an issue on GitHub.
