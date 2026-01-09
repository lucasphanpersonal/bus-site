# Admin Dashboard Documentation

## Overview

The Bus Charter Admin Dashboard provides a comprehensive interface for managing and reviewing all quote requests submitted through the website. It features analytics, detailed quote views, and Google Maps integration for route visualization.

## Getting Started

### Accessing the Dashboard

1. Navigate to `admin.html` in your web browser
2. Enter the admin password when prompted
3. Default password: `admin123` (**MUST be changed in production!**)

### First-Time Setup

**IMPORTANT**: Before deploying to production, change the default admin password:

1. Open `admin.js` in a text editor
2. Find the line: `const ADMIN_PASSWORD = 'admin123';`
3. Change `'admin123'` to your secure password
4. Save the file

Example:
```javascript
const ADMIN_PASSWORD = 'MySecureP@ssw0rd2024!';
```

## Dashboard Features

### Analytics Overview

The dashboard homepage displays four key metrics:

1. **Total Quotes**: All-time number of quote requests
2. **This Month**: Number of quotes received in the current month
3. **Total Passengers**: Sum of all passengers across all quotes
4. **Total Miles**: Sum of all route distances

These metrics update automatically when new quotes are submitted.

### Quote List

The main section shows all quote requests in reverse chronological order (newest first). Each quote card displays:

- **Client Name**: Full name of the requester
- **Submission Date/Time**: When the quote was submitted
- **Email**: Client's email address (clickable mailto link)
- **Phone**: Client's phone number (clickable tel link)
- **Passengers**: Number of passengers
- **Trip Days**: Number of trip days
- **Total Distance**: Total route distance in miles
- **Booking Hours**: Total booking duration

Click any quote card to view complete details.

### Detailed Quote View

Clicking a quote opens a modal with comprehensive information:

#### Request Information Section
- Submission timestamp
- Full contact details (name, email, phone, company)
- Number of passengers

#### Trip Details Section
- Trip description
- Special notes and requirements

#### Route Information Section (if available)
- Total distance in miles
- Total driving time
- Total booking hours (start to end time)
- Total number of stops
- Interactive Google Maps view showing the route

#### Trip Days & Locations Section
For each trip day:
- Date
- Start and end times
- Booking duration (hours and minutes)
- Route distance and driving time
- Pick-up location
- All drop-off locations in order

#### Notable Information Section
The system automatically detects and highlights:
- **Multi-day trips**: Trips spanning multiple days
- **Large groups**: 50+ passengers
- **Long distances**: Routes over 200 miles
- **Extended bookings**: Over 12 hours of booking time
- **Interstate travel**: Potential crossing of state lines

## Data Management

### Data Storage

✅ **Data Source**: Quote data is stored in **Google Sheets**

**How it works when deployed:**
- All quote submissions are automatically saved to your Google Spreadsheet
- The admin dashboard reads data from Google Sheets via the Sheets API
- You can access your quotes from **any device, any browser, anywhere**
- Data is centralized and accessible to your entire team

**Advantages:**
- ✅ Access quotes from any device (desktop, laptop, tablet, phone)
- ✅ Works in any browser (Chrome, Firefox, Safari, Edge)
- ✅ See all customer quotes submitted from anywhere
- ✅ Share access with team members
- ✅ Data is backed up by Google's infrastructure

📖 **For setup instructions, see [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)**
📖 **For detailed information, see [DATA_STORAGE_GUIDE.md](DATA_STORAGE_GUIDE.md)**

### Data Backup Recommendations

For production use, consider:
1. Regularly exporting quote data (feature could be added)
2. Implementing a backend database for permanent storage
3. **Using the Google Forms responses as a backup data source (RECOMMENDED)**

## Google Maps Integration

### Route Visualization

When viewing a quote detail:
- The system automatically displays the route on Google Maps
- Shows pickup point, all stops, and final destination
- Uses Google Directions API for accurate routing
- Displays the route for the first trip day

### Requirements

- Google Maps JavaScript API must be enabled
- Google Directions API must be enabled
- Valid API key must be configured in `config.js`

### Troubleshooting Maps

If maps don't display:
1. Check that Google Maps JavaScript API is enabled in Google Cloud Console
2. Verify API key is correct in `config.js`
3. Ensure API key restrictions allow your domain
4. Check browser console for error messages

## Security Best Practices

### Password Security

1. **Change Default Password**: Never use `admin123` in production
2. **Use Strong Passwords**: At least 12 characters with mixed case, numbers, and symbols
3. **Don't Share Passwords**: Each admin should have their own access method
4. **Regular Updates**: Change passwords periodically

### Current Limitations

The current implementation uses client-side authentication:
- Password is stored in plain text in `admin.js`
- Anyone with file access can view the password
- No user activity logging
- No session timeout

### Production Recommendations

For production deployment with sensitive data:

1. **Implement Backend Authentication**
   - Use server-side password verification
   - Hash and salt passwords
   - Implement session management
   - Add rate limiting to prevent brute force attacks

2. **Add User Management**
   - Support multiple admin users
   - Role-based access control
   - Activity logging and audit trails

3. **Secure Data Storage**
   - Implement backend database for data storage
   - Encrypt sensitive data
   - Regular automated backups
   - Implement data retention policies

## Workflow Tips

### Daily Operations

1. **Morning Routine**: Check dashboard for new overnight quotes
2. **Review Details**: Click each new quote to review full details
3. **Take Action**: Contact clients, prepare quotes, schedule trips
4. **Track Progress**: (Manual process - consider adding status tracking)

### Using Quote Information

The dashboard provides all information needed to prepare accurate quotes:

1. **Distance & Time**: Use for fuel and driver cost calculations
2. **Booking Hours**: Determine required bus rental duration
3. **Passenger Count**: Select appropriate bus size
4. **Special Notes**: Account for special requirements in pricing
5. **Notable Information**: Flag potential complications (interstate travel, etc.)

## Troubleshooting

### Common Issues

**Problem**: Can't log in
- **Solution**: Verify password is correct; check `admin.js` for the current password

**Problem**: No quotes showing
- **Solution**: Check that you're using the same browser where forms were submitted; localStorage is browser-specific

**Problem**: Maps not loading
- **Solution**: Verify Google Maps API is configured correctly; check browser console for errors

**Problem**: Missing route information
- **Solution**: Route computation requires Google Maps Distance Matrix API; submissions without this will show N/A

**Problem**: Data disappeared
- **Solution**: Check Google Sheets API configuration; verify spreadsheet sharing settings and API key

### Browser Console

For technical debugging:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Application > Local Storage to view stored data

## Future Development Ideas

Potential enhancements for the admin dashboard:

1. **Export Functionality**: Export quotes to CSV, PDF, or Excel
2. **Search & Filter**: Search by name, date, or filter by criteria
3. **Quote Status**: Mark quotes as pending, approved, or completed
4. **Notes & Follow-ups**: Add internal notes to quotes
5. **Email Integration**: Send responses directly from dashboard
6. **Calendar View**: See trips on a calendar
7. **Pricing Calculator**: Auto-calculate suggested pricing
8. **Analytics Charts**: Visual charts and graphs for insights
9. **Multi-user Support**: Multiple admin accounts with permissions
10. **Mobile App**: Native mobile app for on-the-go access

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Verify Google APIs are configured correctly
4. Check that all files are properly uploaded to your web server

## Changelog

### Version 2.0 (Current)
- Added admin dashboard
- Added confirmation page for clients
- Added booking hours calculation
- Added notable information detection
- Improved error handling

### Version 1.0
- Initial release with form and Google Forms integration
- Route calculation feature
- Google Maps autocomplete
