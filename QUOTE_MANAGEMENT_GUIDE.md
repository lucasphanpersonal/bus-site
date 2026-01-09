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
3. Click **"📧 Send Quote"**

### What Happens Next

When you click "Send Quote":

1. ✅ The quote is **automatically saved to Google Sheets** with status "Sent"
2. ✅ You'll see a confirmation: "✅ Quote saved with status: Sent"
3. ✅ Your email client opens with a **pre-filled message** containing:
   - The quote amount
   - Complete trip summary
   - All trip details
   - Your business signature
4. ✅ You can edit the email before sending if needed
5. ✅ Click Send in your email client to send the quote
6. ✅ The dashboard will automatically refresh to show the updated status

## Managing Quote Responses

After you send a quote, the customer will respond with either acceptance, decline, or request for negotiation. The admin dashboard provides state-specific actions based on where you are in the quote workflow.

### Accepting a Quote

When a customer accepts your quote (via phone, email, or other means):

1. **Open the quote** that was previously sent
2. You'll see the **Accept Quote** section with a green border
3. **Enter the Agreed Price** - this is the final price (may be different from original if negotiated)
4. **Add Additional Notes** (optional) - include payment terms, pickup details, etc.
5. Click **"✅ Accept & Compose Confirmation Email"**

**What Happens:**
- ✅ Quote status updates to "Accepted" in Google Sheets
- ✅ The agreed price is saved
- ✅ Email client opens with a professional **booking confirmation email**
- ✅ Dashboard refreshes to show the booking as confirmed

### Declining a Quote

When a customer declines your quote:

1. **Open the quote** that was previously sent
2. You'll see the **Decline Quote** section with a red border
3. **Enter a reason** (optional) - helps track why quotes are declined
4. Click **"❌ Decline & Compose Email"**

**What Happens:**
- ✅ Quote status updates to "Declined" in Google Sheets
- ✅ Email client opens with a polite **decline response email**
- ✅ Dashboard refreshes to show the quote as declined

## Understanding the Quote Workflow

The system guides you through a state-based workflow:

### 1. Pending State (No Quote Sent)
- **Action Available**: Send Quote
- **What You See**: Simple form to enter quote amount and details
- **Next State**: After sending → Sent

### 2. Sent State (Waiting for Customer Response)
- **Actions Available**: Accept or Decline
- **What You See**: Two sections (green for accept, red for decline)
- **Next State**: After customer responds → Accepted or Declined

### 3. Accepted State (Booking Confirmed)
- **Actions Available**: None (workflow complete)
- **What You See**: Confirmation message with agreed price
- **Status**: Final - booking is confirmed

### 4. Declined State (Quote Not Accepted)
- **Actions Available**: None (workflow complete)
- **What You See**: Decline message with optional reason
- **Status**: Final - quote was declined

## Managing Quote Status

You can track the status of each quote through the workflow:

### Available Statuses

| Status | Meaning | Actions Available |
|--------|---------|-------------------|
| ⏳ **Pending** | No quote sent yet | Send Quote |
| 🟢 **Sent** | Quote has been sent to customer | Accept or Decline |
| 🔵 **Accepted** | Customer accepted the quote | None (complete) |
| 🔴 **Declined** | Customer declined the quote | None (complete) |

## Understanding Status Badges

In the quote list view, you'll see status indicators:

- ⏳ **Yellow badge** (Pending): No quote sent yet - needs action
- 🟢 **Green badge** (Sent): Quote has been sent - waiting for customer
- 🔵 **Blue badge** (Accepted): Customer accepted - booking confirmed
- 🔴 **Red badge** (Declined): Customer declined - no action needed

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

### 1. Track Negotiated Prices

When accepting a quote:
- Always enter the **final agreed price** in the "Agreed Price" field
- This may differ from your original quote if you negotiated
- Use the Additional Notes field to document the negotiation
- Example: "Customer requested discount for returning customer - agreed to $1400 (original quote was $1500)"

### 2. Document Decline Reasons

When declining a quote:
- Add a brief reason to help track patterns
- Common reasons: "Dates unavailable", "Out of service area", "Group too large"
- This data helps you understand your market and improve services

### 3. Use Additional Details Effectively

When sending initial quotes, include:
- Payment terms (deposit amount, final payment timing)
- What's included (driver, fuel, tolls)
- What's NOT included (gratuity, parking fees)
- Cancellation policy
- Special conditions or requirements

When accepting quotes, include:
- Payment instructions and deadline
- Pickup time and location details
- Contact person for day-of coordination
- Any special requests or accommodations

### 4. Review Before Sending

Even though emails are pre-filled:
- Always review the email before sending
- Check all dates and details are correct
- Verify the quote/agreed amount is accurate
- Add personal touches if desired
- Double-check recipient email address

### 5. Monitor Your Metrics

The dashboard now shows:
- **Pending**: Quotes waiting for your response
- **Sent**: Quotes waiting for customer response
- **Accepted**: Confirmed bookings
- **Declined**: Lost opportunities

Use these to:
- Follow up on sent quotes that haven't been accepted
- Calculate your conversion rate (Accepted / Total Quotes)
- Identify busy periods
- Track business growth over time

### 6. Keep Google Sheets as Backup

Your "Quote Responses" sheet is a valuable business record:
- Export it regularly for accounting
- Track trends over time
- Calculate conversion rates
- Review declined quotes to improve pricing or understand market limits

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

**Problem**: Status doesn't change when you perform an action

**Solution**:
1. Verify Apps Script is enabled and properly configured
2. Check the Google Sheet "Quote Responses" tab for the updated entry
3. Wait a moment and refresh the dashboard - it should auto-refresh after 2 seconds
4. Check browser console (F12) for errors
5. Verify the Apps Script shared secret matches in config.js and Code.gs

### Email Client Doesn't Open

**Problem**: Nothing happens when you click "Compose Email"

**Solution**:
1. This is a different issue from quote saving
2. See [EMAIL_RESPONSE_GUIDE.md](EMAIL_RESPONSE_GUIDE.md) for email client troubleshooting
3. The quote should still be saved even if email doesn't open
4. You can manually compose the email using the details shown

## Advanced Usage

### Handling Price Negotiations

If a customer wants to negotiate on price:

1. The quote is initially sent (Status: "Sent")
2. Customer requests a lower price
3. You agree on a new price
4. Open the quote and click "Accept"
5. Enter the **negotiated price** (different from original quote)
6. Add notes explaining the negotiation
7. Send the confirmation email

The system tracks the final agreed price, not the original quote amount.

### Managing Multiple Quote Iterations

If you need to send an updated quote before getting a response:

**Current Limitation**: The system is designed for a single quote per request. If you need to send a revised quote:

1. Contact the customer directly with the new quote
2. When they accept, use the "Accept" action with the final agreed price
3. Document the revision in the Additional Notes

**Future Enhancement**: Version tracking for multiple quote iterations is being considered.

### Bulk Status Updates

**Not Recommended**: Status changes should flow through the natural workflow (Pending → Sent → Accepted/Declined)

If you absolutely need to update multiple quotes:

1. Open the "Quote Responses" sheet in Google Sheets
2. **Be careful** - manual edits bypass the workflow
3. Update the Status column (must be exactly: "Sent", "Accepted", or "Declined")
4. Refresh the admin dashboard to see changes

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

**Q: Can I go back and change a status after it's been set to Accepted/Declined?**  
A: While the UI doesn't provide this option (these are considered final states), you can manually edit the status in the Google Sheet if absolutely necessary. However, this is not recommended as it bypasses the workflow.

**Q: What if I accidentally click Accept instead of Decline?**  
A: Close the email draft without sending it, then manually update the status in the Google Sheet, or contact support for guidance on reversing the action.

**Q: Can I send a quote without using the email composer?**  
A: The system is designed to save the quote when you click the action button. If you want to send the quote through another channel (phone call, text), you can still click the button to save the status, then just close the email draft without sending.

**Q: Why can't I edit a quote after it's been sent?**  
A: The new workflow focuses on clear state transitions. Once sent, you either accept (potentially with a different agreed price) or decline. If you need to revise a quote before customer response, contact them directly and use the Accept action with the final agreed price.

**Q: What's the difference between Quote Amount and Agreed Price?**  
A: Quote Amount is what you initially offer (when status is Sent). Agreed Price is the final negotiated amount when the customer accepts (could be the same or different after negotiation).

**Q: Can multiple admins use this at the same time?**  
A: Yes! All admins see the same data from Google Sheets. The workflow ensures clear state transitions, reducing conflicts.

**Q: Can I customize the email templates for Accept and Decline?**  
A: The email templates are generated in the admin.js file. You can modify them by editing the `sendQuoteEmail()` function, but this requires coding knowledge. The signature can be customized in config.js without coding.

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

- [ ] Version history for quotes (track multiple revisions)
- [ ] Ability to edit and resend quotes before customer responds
- [ ] Quote templates for different vehicle types
- [ ] Automatic quote calculation based on mileage and booking hours
- [ ] Integration with calendar for availability checking
- [ ] Deposit tracking and payment status
- [ ] Automated follow-up reminders for sent quotes
- [ ] Customer portal for viewing quote status
- [ ] Partial payment tracking
- [ ] Quote expiration dates with automatic reminders

---

**Happy Quoting!** 🚌💰

If you have suggestions for improving this guide or the quote management features, please open an issue on GitHub.
