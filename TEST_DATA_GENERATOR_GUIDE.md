# Test Data Generator Guide

## Overview

The Test Data Generator is a tool for creating realistic test data for the bus charter quote request system. It helps developers and testers quickly generate sample quotes for testing the form, admin dashboard, Google Forms integration, and other features.

## Accessing the Tool

Open the test data generator by navigating to:
```
test-data-generator.html
```

Or from the deployed site:
```
https://yourusername.github.io/bus-site/test-data-generator.html
```

## Features

### 🎲 Realistic Data Generation

The tool generates realistic test data including:

- **Unique Quote IDs**: Properly formatted IDs matching the system format (e.g., `QUOTE-20260109-A1B2C`)
- **Contact Information**: Random names, email addresses, phone numbers
- **Company Names**: Variety of realistic company names (70% of quotes include a company)
- **Trip Details**: Random dates, times, and multi-day trip support
- **Locations**: US cities with landmarks for pickup and dropoff locations
- **Passenger Counts**: Realistic passenger numbers (10-56, typical bus capacity)
- **Trip Descriptions**: Common charter bus use cases (weddings, corporate events, school trips, etc.)
- **Special Notes**: Optional special requirements (wheelchair access, WiFi, etc.)

### ⚙️ Configurable Options

Control the test data generation with these options:

1. **Number of Quotes** (1-100)
   - How many quote records to generate
   - Default: 5

2. **Min/Max Trip Days** (1-10)
   - Control single-day vs. multi-day trips
   - Default: 1-3 days
   - Example: Set both to 1 for single-day trips only
   - Example: Set 2-5 for multi-day trips

3. **Min/Max Dropoffs per Day** (1-10)
   - Control the complexity of each trip day
   - Default: 1-3 dropoff locations
   - Example: Set both to 1 for simple point-to-point trips
   - Example: Set 3-5 for complex multi-stop routes

4. **Date Range** (1-365 days)
   - Generate trips within this many days from today
   - Default: 90 days
   - Ensures future-dated trips for testing

### 📊 Statistics Display

After generating data, the tool displays:

- **Total Quotes Generated**: Number of quote records created
- **Total Trip Days**: Sum of all trip days across all quotes
- **Total Passengers**: Combined passenger count from all quotes

### 💾 Export Options

Export generated data in multiple formats:

#### JSON Format
- **Use Case**: API testing, importing into databases, programmatic use
- **Features**: 
  - Properly formatted JSON with 2-space indentation
  - Includes all quote fields
  - Easy to parse and manipulate
- **How to Export**:
  - Click "Copy JSON" to copy to clipboard
  - Click "Download JSON" to save as a file
  - Filename: `test-quotes-YYYY-MM-DD.json`

#### CSV Format
- **Use Case**: Spreadsheet import, bulk data analysis, Google Sheets import
- **Features**:
  - Standard CSV format with headers
  - Properly escaped commas and quotes
  - Trip days formatted as readable text
- **How to Export**:
  - Click "Download CSV" to save as a file
  - Filename: `test-quotes-YYYY-MM-DD.csv`
- **CSV Columns**:
  - Quote ID
  - Timestamp
  - Name
  - Email
  - Phone
  - Company
  - Passengers
  - Trip Description
  - Trip Days (formatted with dates, times, and locations)
  - Special Notes

## Usage Examples

### Example 1: Generate Simple Test Data

**Scenario**: Test basic form submission with 10 simple quotes

**Configuration**:
- Number of Quotes: 10
- Min Trip Days: 1
- Max Trip Days: 1
- Min Dropoffs per Day: 1
- Max Dropoffs per Day: 1
- Date Range: 30

**Result**: 10 single-day, point-to-point trip quotes within the next 30 days

### Example 2: Generate Complex Multi-Day Trips

**Scenario**: Test multi-day trip handling and route computation

**Configuration**:
- Number of Quotes: 5
- Min Trip Days: 2
- Max Trip Days: 5
- Min Dropoffs per Day: 2
- Max Dropoffs per Day: 4
- Date Range: 90

**Result**: 5 complex quotes with 2-5 days each and multiple stops per day

### Example 3: Generate High Volume Data

**Scenario**: Load test the admin dashboard with many quotes

**Configuration**:
- Number of Quotes: 100
- Min Trip Days: 1
- Max Trip Days: 3
- Min Dropoffs per Day: 1
- Max Dropoffs per Day: 3
- Date Range: 180

**Result**: 100 varied quotes for testing dashboard performance

### Example 4: Generate Data for Specific Date Range

**Scenario**: Test upcoming trips in the next 2 weeks

**Configuration**:
- Number of Quotes: 20
- Min Trip Days: 1
- Max Trip Days: 2
- Min Dropoffs per Day: 1
- Max Dropoffs per Day: 2
- Date Range: 14

**Result**: 20 quotes with trip dates within the next 14 days

## Data Structure

### JSON Format Example

```json
[
  {
    "quoteId": "QUOTE-20260110-A1B2C",
    "timestamp": "2026-01-05T14:30:00.000Z",
    "tripDays": [
      {
        "date": "2026-02-15",
        "startTime": "08:00",
        "endTime": "17:30",
        "endsNextDay": false,
        "pickup": "Convention Center, New York, NY",
        "dropoffs": [
          "Downtown Hotel, Boston, MA",
          "Airport, Boston, MA"
        ]
      }
    ],
    "passengers": 45,
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "(555) 123-4567",
    "company": "Acme Corporation",
    "description": "Corporate team building event",
    "notes": "WiFi preferred"
  }
]
```

### CSV Format Example

```csv
Quote ID,Timestamp,Name,Email,Phone,Company,Passengers,Trip Description,Trip Days,Special Notes
QUOTE-20260110-A1B2C,2026-01-05T14:30:00.000Z,John Smith,john.smith@example.com,(555) 123-4567,Acme Corporation,45,Corporate team building event,"Day 1: 2026-02-15 from 08:00 to 17:30 | Pickup: Convention Center, New York, NY | Dropoffs: Downtown Hotel, Boston, MA; Airport, Boston, MA",WiFi preferred
```

## Testing Workflows

### Workflow 1: Manual Form Testing

1. Generate 1-2 test quotes with simple configuration
2. Copy the JSON output
3. Manually enter the data into the quote form at `quote.html`
4. Verify form validation, Google Maps autocomplete, and route computation
5. Check submission to Google Forms

### Workflow 2: Admin Dashboard Testing

1. Generate 20-50 test quotes
2. Download as CSV
3. Import into Google Sheets (if testing with real sheet)
4. Open admin dashboard
5. Verify quotes display correctly with all fields
6. Test search, filtering, and quote details view

### Workflow 3: API Integration Testing

1. Generate test quotes with desired configuration
2. Download as JSON
3. Use in automated tests or API calls
4. Parse JSON and send to backend endpoints
5. Verify data processing and storage

### Workflow 4: Load Testing

1. Generate 100 quotes
2. Download as CSV
3. Bulk import into Google Sheets
4. Test admin dashboard performance with large dataset
5. Verify pagination, search, and filtering still work well

## Tips and Best Practices

### 💡 General Tips

- **Start Small**: Generate 5-10 quotes first to verify the output meets your needs
- **Adjust Incrementally**: Change one configuration option at a time to understand its impact
- **Save Your Data**: Download generated test data for reuse in multiple testing sessions
- **Clear Between Sessions**: Use the "Clear Output" button when generating new datasets

### 🎯 Configuration Tips

- **Single-Day Trips**: Set Min Trip Days = Max Trip Days = 1
- **Multi-Day Tours**: Set Min Trip Days = 3, Max Trip Days = 7
- **Simple Routes**: Set Min Dropoffs = Max Dropoffs = 1
- **Complex Routes**: Set Min Dropoffs = 2, Max Dropoffs = 5
- **Near-Term Testing**: Set Date Range = 7-30 days
- **Long-Term Planning**: Set Date Range = 90-180 days

### 🔍 Testing Scenarios

**Test Overnight Trips**:
- 10% of generated trips are marked as "ends next day" (overnight)
- Use larger datasets (50+ quotes) to ensure you get some overnight examples

**Test Company vs. Individual**:
- 70% of quotes include a company name
- 30% show "N/A" for company (individual bookings)

**Test Special Requirements**:
- 50% of quotes include special notes
- 50% show "N/A" for notes
- Use larger datasets to see variety of special requirements

### 📝 Data Quality Notes

**Realistic But Not Perfect**:
- Generated data is realistic but randomly combined
- Locations may not represent actual viable routes
- Times are randomized and may not be logical for the distance
- Use this data for UI/UX testing, not for actual route planning validation

**Quote IDs**:
- Each generated quote ID is unique within the batch
- Format matches production system: `QUOTE-YYYYMMDD-XXXXX`
- Timestamp affects the date portion of the ID

**Timestamps**:
- Quote timestamps are backdated 0-30 days from generation
- Simulates quotes submitted over the past month
- Trip dates are always in the future based on Date Range setting

## Troubleshooting

### Problem: "Copy to Clipboard" Doesn't Work

**Solution**: Your browser may block clipboard access. Use "Download JSON" instead or manually select and copy the text.

### Problem: Generated Data Looks the Same

**Solution**: The tool uses randomization. Click "Generate Test Data" multiple times or increase the Number of Quotes for more variety.

### Problem: CSV Import Issues in Google Sheets

**Solution**: 
- Ensure you're using "File > Import" in Google Sheets
- Select "Replace current sheet" or "Insert new sheet"
- Use "Comma" as the separator
- Enable "Convert text to numbers, dates, and formulas"

### Problem: JSON Format Issues

**Solution**: The generated JSON is valid. If you're having parsing issues:
- Copy the entire JSON content (including `[` and `]`)
- Validate at [jsonlint.com](https://jsonlint.com/)
- Check for any manual modifications that may have broken the format

## Integration with Other Tools

### Using with Google Sheets

1. Generate test data and download as CSV
2. Open your Google Sheet (Form Responses sheet)
3. Go to File > Import
4. Upload the CSV file
5. Choose "Append to current sheet" to add to existing data
6. Map columns if needed

**Note**: Ensure the CSV columns match your sheet structure.

### Using with Automated Tests

```javascript
// Example: Load test data in automated tests
const testData = require('./test-quotes-2026-01-10.json');

testData.forEach(quote => {
    // Submit quote through your test framework
    cy.visit('/quote.html');
    cy.fillQuoteForm(quote);
    cy.submitForm();
});
```

### Using with Postman/API Testing

1. Generate test data as JSON
2. Import into Postman as a collection variable
3. Use in request bodies for API testing
4. Iterate through quotes in test scripts

## Future Enhancements

Potential improvements to consider:

- **Custom Data Pools**: Allow users to provide custom lists of names, companies, locations
- **Preset Templates**: Pre-configured templates for common testing scenarios
- **Route Validation**: Option to validate generated routes with Google Maps API
- **Direct Form Fill**: Button to auto-fill the quote form with generated data
- **Database Export**: Direct export to Google Sheets via Apps Script
- **Bulk Form Submission**: Automatically submit multiple quotes for testing

## Support

If you encounter issues or have suggestions for the test data generator:

1. Check this guide for troubleshooting tips
2. Review the browser console for error messages
3. Verify your configuration values are within valid ranges
4. Try clearing output and regenerating with different settings

## Related Documentation

- [README.md](README.md) - Main project documentation
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin dashboard usage
- [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) - Data storage setup
- [QUOTE_MANAGEMENT_GUIDE.md](QUOTE_MANAGEMENT_GUIDE.md) - Managing quotes

---

**Version**: 1.0  
**Last Updated**: January 2026
