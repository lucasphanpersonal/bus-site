# Bus Charter Quote Request Website

A modern, responsive website for requesting charter bus booking quotes. The site features a beautiful form interface that integrates with Google Forms for data collection, Google Maps for location autocomplete, and includes a private admin dashboard for managing quotes.

## Features

### Client-Facing Features
- ✨ **Modern & Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 📅 **Multiple Trip Days Support** - Add multiple trip days with dates and time ranges
- 📍 **Smart Location Input** - Google Maps autocomplete for pickup and dropoff locations
- 🗺️ **Multiple Locations Per Day** - Each trip day can have one pickup and multiple dropoff locations
- 🎯 **Final Destination Tracking** - The last dropoff location automatically becomes the final destination
- 📏 **Automatic Route Calculation** - Computes distance, travel time, booking hours, and stop count for accurate quotes
- ⏱️ **Booking Hours Tracking** - Calculates total booking hours from start to end time for each day
- 👥 **Passenger Management** - Specify number of passengers
- 📧 **Contact Information** - Collect all necessary contact details
- 📝 **Trip Description** - Detailed description and special notes sections
- ✅ **Confirmation Page** - Clients receive a professional confirmation page after submission
- 📬 **Automatic Confirmation Emails** - Optional automatic email confirmations to customers (via EmailJS)
- 🔔 **Admin Notifications** - Optional email notifications to admin when new quotes are received
- 🔗 **Google Forms Integration** - Submissions sent directly to your Google Form
- ⚡ **Real-time Validation** - Client-side form validation for better UX
- 🎨 **Clean UI** - Professional look without the typical embedded form appearance

### Admin Dashboard Features
- 🔐 **Secure Admin Access** - Password-protected dashboard
- 📊 **Analytics Overview** - View total quotes, monthly stats, passengers, and miles
- 📋 **Quote Management** - Browse and search through all submitted quote requests
- 💾 **Save Quote Responses** - Save quote amounts and details directly to Google Sheets
- ✏️ **Edit Saved Quotes** - Update quote amounts, details, and status after saving
- 📊 **Status Tracking** - Track quote status (Sent, Draft, Accepted, Declined) with color-coded badges
- ✉️ **Email Integration** - Compose quote response emails with pre-filled customer details
- 🗺️ **Per-Day Map Visualization** - Visual route display for each trip day
- 📈 **Detailed Quote View** - See all trip logistics, booking hours, distances, and notable information
- ⚠️ **Smart Alerts** - Automatic detection of notable trip characteristics (multi-day, large groups, long distances, interstate travel)
- 💾 **Google Sheets Integration** - All quotes stored in Google Sheets for access from anywhere
- 🔄 **Real-time Updates** - See saved quote information immediately in the dashboard
- 📱 **Responsive Design** - Admin dashboard works on all devices

## Setup Instructions

### 1. Clone or Download the Repository

```bash
git clone https://github.com/lucasphanpersonal/bus-site.git
cd bus-site
```

### 2. Configure Google Forms

1. Create a new Google Form at [forms.google.com](https://forms.google.com)
2. Add the following fields to your form:
   - **Trip Days (Dates, Times & Locations)** - Paragraph text field (Long answer)
   - **Number of Passengers** - Number field
   - **Full Name** - Short answer text field
   - **Email Address** - Email field (or use built-in email collection)
   - **Phone Number** - Short answer text field
   - **Company/Organization** - Short answer text field
   - **Trip Description** - Paragraph text field
   - **Special Notes** - Paragraph text field

3. Get your form's action URL:
   - Open your Google Form
   - Click "Send" and get the link
   - The form ID is in the URL: `forms.google.com/forms/d/{FORM_ID}/edit`
   - Your action URL will be: `https://docs.google.com/forms/d/e/{FORM_ID}/formResponse`

4. Get entry IDs for each field:
   - Right-click on your form and select "Inspect" or "View Page Source"
   - Search for `entry.` to find entry IDs (e.g., `entry.1234567890`)
   - Each form field has a unique entry ID

**Note:** The "Trip Days" field will contain formatted data including dates, times, pickup location, and all dropoff locations for each day.

### 3. Configure Google Maps API

**✅ API Key Already Configured**: This repository includes a Google Maps API key with domain restrictions for GitHub Pages deployment. The key is already embedded in `config.js` and restricted to work only with authorized domains.

If you need to use your own API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Maps JavaScript API
   - Places API
   - Distance Matrix API (required for automatic route calculation)
4. Create an API key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - **IMPORTANT**: Restrict the key to your domain for security
   - Add your domain to "Application restrictions" → "HTTP referrers (websites)"
5. Replace the API key in `config.js` with your own

⚠️ **Security Note**: The included API key has domain restrictions set in Google Cloud Console, making it safe to embed in the frontend code. Always restrict your API keys to specific domains!

### 4. (Optional) Additional API Key Configuration Methods

If you prefer to use environment variables or secret management for your own API keys, you can still use the `config-local.js` approach:

#### For Local Development:

1. Copy the example config file:
   ```bash
   cp config-local.js.example config-local.js
   ```

2. Edit `config-local.js` and add your real API keys:
   ```javascript
   const CONFIG_LOCAL = {
       googleMaps: {
           apiKey: 'YOUR_ACTUAL_API_KEY'
       }
   };
   ```

3. The file is already in `.gitignore` and won't be committed.

#### For Production Deployment:

Use environment variables or your platform's secret management:
- **Netlify**: Use Environment Variables in site settings
- **Vercel**: Use Environment Variables in project settings  
- **GitHub Pages**: Use GitHub Secrets with GitHub Actions

📖 **See [SECURITY_SETUP.md](SECURITY_SETUP.md) for complete setup instructions for all deployment methods.**

### 5. Update Configuration (Google Forms)

Edit `config.js` and update the Google Forms configuration (API keys should go in `config-local.js`):

```javascript
const CONFIG = {
    googleForm: {
        actionUrl: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse',
        fields: {
            tripDays: 'entry.XXXXXXXXX',      // Contains dates, times, and locations for each day
            passengers: 'entry.XXXXXXXXX',
            name: 'entry.XXXXXXXXX',
            email: 'entry.XXXXXXXXX',
            phone: 'entry.XXXXXXXXX',
            company: 'entry.XXXXXXXXX',
            description: 'entry.XXXXXXXXX',
            notes: 'entry.XXXXXXXXX'
        }
    }
};
```

**Note**: Do NOT put API keys in `config.js`. Use `config-local.js` as described in step 4.

### 5. (Optional) Set Up Quote Management

To enable saving quote responses from the admin dashboard:

1. Follow the detailed guide in [APPS_SCRIPT_SETUP.md](APPS_SCRIPT_SETUP.md)
2. Deploy the Google Apps Script to enable write access to Google Sheets
3. Update `config.js` with your Apps Script web app URL and shared secret

**What this enables:**
- ✅ Save quote amounts and details when responding to customers
- ✅ Edit and update saved quotes
- ✅ Track quote status (Sent, Draft, Accepted, Declined)
- ✅ View saved quote information in the admin dashboard
- ✅ See which quotes have been responded to with status badges

**Note:** This step requires completing the Google Sheets setup first. See [APPS_SCRIPT_SETUP.md](APPS_SCRIPT_SETUP.md) for complete step-by-step instructions.

### 6. (Optional) Configure Email Confirmations and Admin Notifications

To send automatic confirmation emails to customers and notifications to admin when they submit a quote:

1. Sign up for a free account at [EmailJS](https://www.emailjs.com/) (200 free emails/month)
2. Connect your email service (Gmail, Outlook, etc.)
3. Create email templates:
   - One for customer quote confirmations
   - One for admin notifications (optional)
4. Update `config.js` with your EmailJS credentials:

```javascript
emailjs: {
    enabled: true,
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_CUSTOMER_TEMPLATE_ID',
    
    // Optional: Admin notifications
    adminNotification: {
        enabled: true,
        adminEmail: 'huabaohuang622@gmail.com',  // Configure your admin email
        adminTemplateId: 'YOUR_ADMIN_TEMPLATE_ID'
    }
}
```

📖 **See [EMAIL_INTEGRATION_GUIDE.md](EMAIL_INTEGRATION_GUIDE.md) for detailed setup instructions, template examples, and alternative email solutions.**

**Note:** Email integration is optional. The site works perfectly without it - customers will still see a confirmation page and submissions will be saved to Google Forms.

⚠️ **Security Note:** For production use, consider moving sensitive configuration to environment variables or secret management services instead of hardcoding values.

### 7. Deploy

You can host this website using any of these methods:

#### Option A: GitHub Pages (Free)
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select the branch and root folder
4. Your site will be available at `https://yourusername.github.io/bus-site/`

#### Option B: Netlify (Free)
1. Sign up at [netlify.com](https://www.netlify.com/)
2. Connect your GitHub repository
3. Deploy with one click
4. Get a free `yoursite.netlify.app` domain

#### Option C: Local Testing
Simply open `index.html` in a web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or use a local web server:
```bash
# Python 3
python -m http.server 8000

# Then visit http://localhost:8000
```

## File Structure

```
bus-site/
├── index.html      # Main HTML file with form structure
├── success.html    # Confirmation page shown after form submission
├── admin.html      # Admin dashboard for viewing quote requests
├── styles.css      # All styling including responsive design
├── script.js       # Form handling and API integrations
├── admin.js        # Admin dashboard functionality
├── config.js       # Configuration for API keys (customize this)
└── README.md       # This file
```

## Admin Dashboard

### Accessing the Dashboard

1. Navigate to `admin.html` in your browser
2. Enter the admin password (default: `admin123`)
3. View and manage all quote requests

### Features

- **Dashboard Overview**: See total quotes, monthly stats, total passengers, and total miles at a glance
- **Quote List**: Browse all submitted quote requests with key information
- **Detailed View**: Click any quote to see:
  - Complete contact information
  - Trip details and descriptions
  - Route visualization on Google Maps
  - Booking hours, driving time, and distances
  - Notable information (large groups, long distances, multi-day trips, interstate travel)
  
### Security Considerations

⚠️ **IMPORTANT**: The default admin password is `admin123`. **You MUST change this in production!**

To change the admin password, edit `admin.js`:

```javascript
const ADMIN_PASSWORD = 'your-secure-password-here';
```

**Note**: This is a client-side implementation suitable for personal use or small businesses. For production use with sensitive data, implement proper backend authentication.

### Data Storage

The admin dashboard uses **Google Sheets** for centralized data storage:

- **Accessible from anywhere**: View quotes from any device, any browser
- **See customer quotes**: All quotes submitted by customers appear in the dashboard
- **Beautiful UI**: Maps, formatted data, and all features preserved
- **Free**: No hosting or database costs
- **Easy setup**: 5-minute configuration

📖 **See [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) for step-by-step setup instructions.**

**For Enterprise Use**: For advanced needs, consider implementing a custom backend database with proper authentication.

## Route Calculation Feature

The website automatically calculates route information for each trip to help with quote estimation:

### What Gets Calculated

- **Total Distance** - Sum of all driving distances in miles
- **Total Driving Time** - Estimated time based on Google Maps routing
- **Total Booking Hours** - Sum of booking hours (start to end time) across all trip days
- **Number of Stops** - Count of all dropoff locations across all days
- **Per-Day Breakdown** - Individual distance, driving time, booking hours, and stops for each trip day
- **Leg-by-Leg Details** - Distance and time for each segment of the journey

### How It Works

1. When a customer submits the form, the system uses Google's Distance Matrix API to calculate driving routes
2. It computes the route from pickup → first dropoff → second dropoff → ... → final dropoff for each day
3. Booking hours are calculated from the start and end times entered for each day
4. A summary modal appears showing all calculated route information
5. The customer can review and confirm before final submission
6. Route data is automatically included in the Google Forms submission and stored in the admin dashboard

### Configuring Route Calculation

In `config.js`, you can control route calculation behavior:

```javascript
routeComputation: {
    enabled: true,      // Set to false to disable route calculation
    showSummary: true   // Set to false to skip showing the summary modal
}
```

### Route Data in Google Forms

The computed route information is automatically appended to the "Special Notes" field in your Google Form submission. It includes:
- Total distance, driving time, and booking hours
- Number of stops and passengers
- Per-day breakdown with all metrics
- Individual leg distances and times

This helps you quickly understand the scope of each quote request and provide accurate pricing.

**Note:** Route calculations require the Google Distance Matrix API to be enabled in your Google Cloud Console.

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Landing Page Stats

You can show or hide statistics on the landing page (e.g., Years Experience, Happy Clients, Fleet Size) by editing `config.js`:

```javascript
landingPage: {
    stats: {
        enabled: false,  // Set to true to show stats on landing page
        items: [
            {
                number: '15+',
                label: 'Years Experience'
            },
            {
                number: '1000+',
                label: 'Happy Clients'
            },
            {
                number: '50+',
                label: 'Modern Buses'
            }
        ]
    }
}
```

- Set `enabled: true` to display the stats section on the landing page
- Set `enabled: false` to hide the stats section (default)
- Customize the `number` and `label` values to match your business
- You can add or remove stat items as needed

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #2563eb;      /* Main brand color */
    --primary-dark: #1d4ed8;       /* Darker shade */
    --success-color: #10b981;      /* Success messages */
    --error-color: #ef4444;        /* Error messages */
}
```

### Modifying Form Fields

Edit `index.html` to add, remove, or modify form fields. Don't forget to update:
1. The corresponding entry ID in `config.js`
2. The field collection in `script.js` (`collectFormData()` function)
3. The validation logic in `script.js` (`validateFormData()` function)

### Changing Text Content

Edit `index.html` to change:
- Header title and subtitle
- Form section titles
- Field labels and placeholders
- Footer text

## Testing Without API Keys

The website will work without Google Forms and Google Maps configured:
- Form submissions will be simulated (logged to console)
- Location field will work as a regular text input
- All other functionality remains intact

This allows you to test the website before setting up the APIs.

## Security Notes

### 🔐 Critical Security Practices

- ⚠️ **NEVER commit API keys to the repository** - Use `config-local.js` (already git-ignored)
- ⚠️ **API key exposed?** Revoke it immediately and generate a new one
- ⚠️ **Change the default admin password (`admin123`) before deploying**
- ✅ **Use [SECURITY_SETUP.md](SECURITY_SETUP.md)** for proper API key configuration
- ✅ **Restrict your Google Maps API key** to your domain in Google Cloud Console
- ✅ **Set up billing alerts** in Google Cloud Console to prevent unexpected charges
- ✅ **For production**, use environment variables or platform-specific secrets (Netlify, Vercel, etc.)
- ✅ **Enable CORS restrictions** on your APIs where possible
- ✅ **For production use**, implement proper backend authentication for the admin dashboard

### If Your API Key Was Compromised:

1. **Immediately revoke the exposed API key** in Google Cloud Console
2. **Generate a new API key** with proper domain restrictions
3. **Update your local config** in `config-local.js` (not `config.js`)
4. **Never commit the new key** to the repository
5. **Consider removing from git history** - see [SECURITY_SETUP.md](SECURITY_SETUP.md)

📖 **Full security guide**: [SECURITY_SETUP.md](SECURITY_SETUP.md)

## Future Enhancements

The following features could be added in future updates:

- **Email Notifications**: Backend service to send confirmation emails to clients automatically
- **Backend Database**: Server-side storage for quotes with advanced querying
- **User Authentication**: Proper multi-user authentication system for the admin dashboard
- **Export Functionality**: Export quotes to CSV/PDF for record-keeping
- **Quote Status Tracking**: Mark quotes as pending, approved, or completed
- **Pricing Calculator**: Automatic price estimation based on distance, time, and passengers
- **Calendar Integration**: Sync trip dates with calendar applications

## Support

For issues or questions:

### Common Issues
1. **CORS policy error in admin dashboard?** See [CORS_FIX_GUIDE.md](CORS_FIX_GUIDE.md) for the fix
2. **Status updates not saving?** See [QUICK_FIX_STATUS_UPDATES.md](QUICK_FIX_STATUS_UPDATES.md) for immediate help
3. **Apps Script setup issues?** Check [APPS_SCRIPT_SETUP.md](APPS_SCRIPT_SETUP.md)
4. **Detailed troubleshooting**: [TROUBLESHOOTING_STATUS_UPDATES.md](TROUBLESHOOTING_STATUS_UPDATES.md)

### Debugging Steps
1. Check the browser console (F12) for error messages
2. Verify your API keys are correctly configured
3. Ensure your Google Form fields match the entry IDs
4. Test with browser developer tools open
5. Check Apps Script execution logs (Extensions → Apps Script → Executions)

### Additional Resources
- [CORS_FIX_GUIDE.md](CORS_FIX_GUIDE.md) - Fix CORS policy errors in admin dashboard
- [SECURITY_SETUP.md](SECURITY_SETUP.md) - Security and API key configuration
- [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) - Google Sheets integration setup
- [EMAIL_INTEGRATION_GUIDE.md](EMAIL_INTEGRATION_GUIDE.md) - Email setup guide
- [STATUS_UPDATE_FIX_SUMMARY.md](STATUS_UPDATE_FIX_SUMMARY.md) - Technical details on status update fix

## License

This project is open source and available for personal and commercial use.

---

Made with ❤️ for charter bus services