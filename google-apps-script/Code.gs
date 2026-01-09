/**
 * Google Apps Script for Bus Charter Quote Management
 * 
 * This script provides write access to Google Sheets for the admin dashboard.
 * Deploy this as a web app to enable admins to save quote responses.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet with quote data
 * 2. Click Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click "Deploy" > "New deployment"
 * 5. Select "Web app" as deployment type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone" (the script validates requests)
 * 8. Click "Deploy" and copy the web app URL
 * 9. Add the URL to config.js under appsScript.webAppUrl
 * 
 * SECURITY:
 * - This script validates requests using a simple shared secret
 * - For production, consider implementing OAuth or more robust authentication
 */

// Configuration
const CONFIG = {
  // Name of the sheet where quote responses will be saved
  QUOTE_RESPONSES_SHEET: 'Quote Responses',
  
  // Name of the sheet with form responses (for linking)
  FORM_RESPONSES_SHEET: 'Form Responses 1',
  
  // Simple shared secret for authentication
  // ⚠️ IMPORTANT: This MUST match sharedSecret in config.js!
  // If you change this, also update config.js
  // Current value matches config.js for easy deployment
  SHARED_SECRET: 'lp-test-9994',
  
  // Enable logging for debugging
  DEBUG_MODE: true
};

/**
 * Handle POST requests with form-encoded data (avoids CORS preflight)
 * 
 * CRITICAL: We use Content-Type: application/x-www-form-urlencoded instead of application/json
 * to avoid CORS preflight issues.
 * 
 * Why this approach:
 * - application/json triggers CORS preflight (OPTIONS request)
 * - Google Apps Script does NOT support OPTIONS requests for Web Apps
 * - doOptions() function is IGNORED by Google Apps Script
 * - Browser blocks the request before doPost() ever runs
 * 
 * application/x-www-form-urlencoded is a "simple content type" that:
 * - Does NOT trigger CORS preflight
 * - Gets automatic CORS headers from Google Apps Script (when deployed with "Anyone" access)
 * - Works reliably across all browsers
 * 
 * Data is passed as form parameters, with the 'data' field containing JSON string.
 */
function doPost(e) {
  try {
    // Get parameters from form data (e.parameter works for both GET and POST form data)
    const params = e.parameter;
    
    // Validate authentication
    if (params.secret !== CONFIG.SHARED_SECRET) {
      return createResponse(false, 'Authentication failed');
    }
    
    // Parse data parameter (JSON string)
    let data;
    try {
      data = JSON.parse(params.data);
    } catch (parseError) {
      return createResponse(false, 'Invalid data parameter: ' + parseError.message);
    }
    
    // Route to appropriate handler
    switch (params.action) {
      case 'saveQuote':
        return handleSaveQuote(data);
      case 'updateQuote':
        return handleUpdateQuote(data);
      case 'deleteQuote':
        return handleDeleteQuote(data);
      default:
        return createResponse(false, 'Unknown action: ' + params.action);
    }
    
  } catch (error) {
    logError('doPost error', error);
    return createResponse(false, 'Server error: ' + error.message);
  }
}

/**
 * Handle GET requests (for testing and backwards compatibility)
 */
function doGet(e) {
  try {
    const params = e.parameter;
    
    // If no action parameter, return API info (for testing)
    if (!params.action) {
      return createResponse(true, 'Bus Charter Quote Management API is running', {
        timestamp: new Date().toISOString(),
        note: 'Send POST requests with Content-Type: application/x-www-form-urlencoded',
        parameters: 'action, secret, data (JSON string)',
        corsNote: 'Form-encoded POST requests avoid CORS preflight issues'
      });
    }
    
    // Validate authentication
    if (params.secret !== CONFIG.SHARED_SECRET) {
      return createResponse(false, 'Authentication failed');
    }
    
    // Parse data parameter (JSON string)
    let data;
    try {
      data = JSON.parse(params.data);
    } catch (parseError) {
      return createResponse(false, 'Invalid data parameter: ' + parseError.message);
    }
    
    // Route to appropriate handler
    switch (params.action) {
      case 'saveQuote':
        return handleSaveQuote(data);
      case 'updateQuote':
        return handleUpdateQuote(data);
      case 'deleteQuote':
        return handleDeleteQuote(data);
      default:
        return createResponse(false, 'Unknown action: ' + params.action);
    }
    
  } catch (error) {
    logError('doGet error', error);
    return createResponse(false, 'Server error: ' + error.message);
  }
}

/**
 * Save a new quote response
 */
function handleSaveQuote(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.QUOTE_RESPONSES_SHEET);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = createQuoteResponsesSheet(ss);
    }
    
    // Prepare row data
    const rowData = [
      new Date(), // Timestamp
      data.quoteRequestId || '', // Link to original request (row number or timestamp)
      data.customerName || '',
      data.customerEmail || '',
      data.quoteAmount || '',
      data.additionalDetails || '',
      data.status || 'Sent', // Sent, Draft, Accepted, Declined
      data.adminName || 'Admin',
      data.sentDate || new Date().toISOString(),
      data.tripSummary || '',
      data.totalMiles || '',
      data.totalPassengers || '',
      data.tripDays || '',
      data.agreedPrice || '' // Agreed price (may differ from initial quote)
    ];
    
    // Append to sheet
    sheet.appendRow(rowData);
    
    log('Quote saved successfully', { customerEmail: data.customerEmail, amount: data.quoteAmount });
    
    return createResponse(true, 'Quote saved successfully', {
      savedAt: new Date().toISOString()
    });
    
  } catch (error) {
    logError('handleSaveQuote error', error);
    return createResponse(false, 'Failed to save quote: ' + error.message);
  }
}

/**
 * Update an existing quote response
 */
function handleUpdateQuote(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.QUOTE_RESPONSES_SHEET);
    
    if (!sheet) {
      return createResponse(false, 'Quote Responses sheet not found');
    }
    
    // Find the row to update by matching quoteRequestId
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) { // Start at 1 to skip header
      if (values[i][1] === data.quoteRequestId) { // Column B: quoteRequestId
        rowIndex = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Quote not found for update');
    }
    
    // Update the row
    sheet.getRange(rowIndex, 5).setValue(data.quoteAmount || ''); // Column E: Quote Amount
    sheet.getRange(rowIndex, 6).setValue(data.additionalDetails || ''); // Column F: Additional Details
    sheet.getRange(rowIndex, 7).setValue(data.status || 'Sent'); // Column G: Status
    sheet.getRange(rowIndex, 14).setValue(data.agreedPrice || ''); // Column N: Agreed Price
    sheet.getRange(rowIndex, 1).setValue(new Date()); // Column A: Update timestamp
    
    log('Quote updated successfully', { rowIndex, customerEmail: data.customerEmail });
    
    return createResponse(true, 'Quote updated successfully', {
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    logError('handleUpdateQuote error', error);
    return createResponse(false, 'Failed to update quote: ' + error.message);
  }
}

/**
 * Delete a quote response (soft delete by updating status)
 */
function handleDeleteQuote(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.QUOTE_RESPONSES_SHEET);
    
    if (!sheet) {
      return createResponse(false, 'Quote Responses sheet not found');
    }
    
    // Find and soft-delete by updating status
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][1] === data.quoteRequestId) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Quote not found for deletion');
    }
    
    // Update status to "Deleted"
    sheet.getRange(rowIndex, 7).setValue('Deleted');
    sheet.getRange(rowIndex, 1).setValue(new Date()); // Update timestamp
    
    log('Quote deleted (soft)', { rowIndex });
    
    return createResponse(true, 'Quote deleted successfully');
    
  } catch (error) {
    logError('handleDeleteQuote error', error);
    return createResponse(false, 'Failed to delete quote: ' + error.message);
  }
}

/**
 * Create the Quote Responses sheet with proper headers
 */
function createQuoteResponsesSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet(CONFIG.QUOTE_RESPONSES_SHEET);
  
  // Set up headers
  const headers = [
    'Timestamp',
    'Quote Request ID',
    'Customer Name',
    'Customer Email',
    'Quote Amount',
    'Additional Details',
    'Status',
    'Admin Name',
    'Sent Date',
    'Trip Summary',
    'Total Miles',
    'Total Passengers',
    'Trip Days',
    'Agreed Price'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  
  // Auto-resize columns
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  log('Created Quote Responses sheet');
  
  return sheet;
}

/**
 * Create a standardized response with CORS headers
 */
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  const output = ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers to allow cross-origin requests
  // This is necessary for the admin dashboard to read the response
  return addCorsHeaders(output);
}

/**
 * Add CORS headers to enable cross-origin requests
 * 
 * Note: In Apps Script, we can't modify HTTP headers directly on TextOutput.
 * However, when the web app is deployed with these settings:
 *   - Execute as: "Me"
 *   - Who has access: "Anyone"
 * 
 * Google Apps Script automatically adds these CORS headers:
 *   - Access-Control-Allow-Origin: *
 *   - Access-Control-Allow-Methods: GET, POST, OPTIONS
 *   - Access-Control-Allow-Headers: Content-Type
 * 
 * CRITICAL: The web app MUST be deployed with "Who has access" set to "Anyone"
 * for CORS to work. If set to "Only myself" or "Anyone within organization",
 * CORS headers will NOT be added and cross-origin requests will fail.
 * 
 * The doOptions() function handles CORS preflight (OPTIONS) requests by returning
 * a JSON response, which ensures that Google Apps Script adds the CORS headers.
 * 
 * This function is kept for documentation purposes.
 */
function addCorsHeaders(output) {
  return output;
}

/**
 * Log a message (for debugging)
 */
function log(message, data) {
  if (CONFIG.DEBUG_MODE) {
    console.log('[INFO]', message, data || '');
  }
}

/**
 * Log an error
 */
function logError(message, error) {
  console.error('[ERROR]', message, error.message, error.stack);
}

/**
 * Test function - run this from the Apps Script editor to verify setup
 */
function testSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  console.log('Testing setup...');
  console.log('Spreadsheet name:', ss.getName());
  console.log('Form Responses sheet exists:', ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET) !== null);
  
  // Try to create or access Quote Responses sheet
  let sheet = ss.getSheetByName(CONFIG.QUOTE_RESPONSES_SHEET);
  if (!sheet) {
    console.log('Creating Quote Responses sheet...');
    sheet = createQuoteResponsesSheet(ss);
  }
  console.log('Quote Responses sheet exists:', sheet !== null);
  
  console.log('Setup test complete!');
}
