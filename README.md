# Bus Charter Quote Request Website

A modern, responsive website for requesting charter bus booking quotes. The site features a beautiful form interface that integrates with Google Forms for data collection and Google Maps for location autocomplete.

## Features

- ✨ **Modern & Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 📅 **Multiple Trip Days Support** - Add multiple trip days with dates and time ranges
- 📍 **Smart Location Input** - Google Maps autocomplete for pickup and dropoff locations
- 🗺️ **Multiple Locations Per Day** - Each trip day can have one pickup and multiple dropoff locations
- 🎯 **Final Destination Tracking** - The last dropoff location automatically becomes the final destination
- 👥 **Passenger Management** - Specify number of passengers
- 📧 **Contact Information** - Collect all necessary contact details
- 📝 **Trip Description** - Detailed description and special notes sections
- 🔗 **Google Forms Integration** - Submissions sent directly to your Google Form
- ⚡ **Real-time Validation** - Client-side form validation for better UX
- 🎨 **Clean UI** - Professional look without the typical embedded form appearance

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

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Maps JavaScript API
   - Places API
4. Create an API key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy your API key
   - (Recommended) Restrict the key to your domain for security

### 4. Update Configuration

Edit `config.js` and replace the placeholder values:

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
    },
    googleMaps: {
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
    }
};
```

### 5. Deploy

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
├── styles.css      # All styling including responsive design
├── script.js       # Form handling and API integrations
├── config.js       # Configuration for API keys (customize this)
└── README.md       # This file
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

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

- ⚠️ **Never commit API keys to public repositories**
- Consider using environment variables or server-side configuration
- Restrict your Google Maps API key to your domain
- Enable CORS restrictions on your APIs where possible

## Support

For issues or questions, please:
1. Check the browser console for error messages
2. Verify your API keys are correctly configured
3. Ensure your Google Form fields match the entry IDs
4. Test with browser developer tools open

## License

This project is open source and available for personal and commercial use.

---

Made with ❤️ for charter bus services