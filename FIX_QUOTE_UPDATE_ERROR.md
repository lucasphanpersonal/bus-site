# Fix: "Quote not found for update" Error

## Problem Description

Users encountered an error when trying to accept a quote that had already been sent:

```
Error updating quote in Sheets: Error: Quote not found for update
    at updateQuoteInSheets (admin.js:1673:19)
    at async sendQuoteEmail (admin.js:1579:17)
    at async handleAcceptQuote (admin.js:1429:5)
```

*Note: Line numbers above are from the original error before the fix was applied.*

## Root Cause

The error occurred in the `sendQuoteEmail()` function when updating a quote's status. The code logic was:

1. Check if `quote.savedQuote` exists (indicating the quote was previously saved)
2. If yes, call `updateQuoteInSheets()` to update the existing row
3. If no, call `saveQuoteToSheets()` to create a new row

However, there were scenarios where `quote.savedQuote` existed (from a previous operation) but the corresponding row in Google Sheets did not exist or couldn't be found:

- **Timing issues**: The quote data might be stale after reloading
- **Failed initial save**: If the first save failed silently, `savedQuote` exists in memory but no row in Sheets
- **ID mismatch**: Timestamp format differences between save and lookup operations
- **Manual sheet modifications**: Admin deleted or modified the row manually

## Solution

Added a fallback mechanism in `admin.js` (lines 1577-1612) that:

1. Attempts to update the quote if `savedQuote` exists
2. **Catches the "Quote not found" error**
3. **Automatically retries with `saveQuoteToSheets()` instead**
4. Continues normally if the fallback save succeeds
5. Re-throws other types of errors for proper handling

## Code Changes

### Before
```javascript
// Use update if quote already exists, otherwise save new
const saved = quote.savedQuote ? 
    await updateQuoteInSheets(quoteDataToSave) : 
    await saveQuoteToSheets(quoteDataToSave);
```

### After
```javascript
// Use update if quote already exists, otherwise save new
// If update fails with "not found", fall back to save
let saved = false;
let operationType = 'saved';

if (quote.savedQuote) {
    try {
        console.log('Attempting to update existing quote...');
        saved = await updateQuoteInSheets(quoteDataToSave);
        operationType = 'updated';
    } catch (updateError) {
        console.warn('Update failed:', updateError.message);
        
        // If update fails because quote not found, try saving as new instead
        if (updateError.message.includes('Quote not found')) {
            console.log('Quote not found in Sheets, falling back to save as new...');
            saved = await saveQuoteToSheets(quoteDataToSave);
            operationType = 'saved';
        } else {
            // Re-throw other errors
            throw updateError;
        }
    }
} else {
    console.log('Saving new quote...');
    saved = await saveQuoteToSheets(quoteDataToSave);
    operationType = 'saved';
}
```

## Benefits

1. **Resilient**: Handles data inconsistencies gracefully
2. **User-friendly**: No more confusing errors when accepting quotes
3. **Self-healing**: Automatically recovers from failed saves
4. **Transparent**: Logs show whether update or save was used
5. **Safe**: Other errors are still properly caught and reported

## Testing

To verify the fix works:

1. Send a quote (status: "Sent")
2. Manually delete the row from "Quote Responses" sheet in Google Sheets
3. Try to accept the quote in the admin dashboard
4. **Expected**: Quote saves successfully (fallback to save)
5. **Previously**: Error "Quote not found for update"

## Related Files

- `admin.js` - Contains the fix in `sendQuoteEmail()` function
- `google-apps-script/Code.gs` - Google Apps Script that handles update/save operations
- `APPS_SCRIPT_SETUP.md` - Setup guide for Apps Script integration

## Future Improvements

Consider these enhancements:

1. Add a "retry" mechanism if both update and save fail
2. Implement optimistic UI updates before save completes
3. Add more granular error messages based on failure type
4. Consider using a unique ID field instead of timestamp for matching
5. Add periodic sync check to detect and fix data inconsistencies
