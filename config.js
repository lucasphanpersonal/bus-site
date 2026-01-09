// Configuration file for API keys and settings
// NOTE: You need to replace these with your actual API keys

const CONFIG = {
    // Google Forms Configuration
    // To get your Google Form action URL:
    // 1. Create a Google Form with the required fields
    // 2. Get the form ID from the URL
    // 3. For each field, inspect the HTML to get the entry IDs (entry.XXXXXXXXX)
    // 4. The form will submit to: https://docs.google.com/forms/d/e/{FORM_ID}/formResponse
    
    googleForm: {
        actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfcZqm_Kw8gcg-Jf8-cqaVfNsUUhTqy9rsjep8lckpVEjBE2A/formResponse', // e.g., 'https://docs.google.com/forms/d/e/1FAIpQLSe.../formResponse'
        
        // Map your form fields to Google Form entry IDs
        // You'll get these by inspecting your Google Form
        fields: {
            tripDays: 'entry.630078859',     // Replace with actual entry ID - this field will contain dates, times, and locations for each day
            passengers: 'entry.444654228',   // Replace with actual entry ID
            name: 'entry.1143231549',         // Replace with actual entry ID
            email: 'entry.1395274550',        // Replace with actual entry ID (or use emailAddress)
            phone: 'entry.118255376',        // Replace with actual entry ID
            company: 'entry.2056082094',      // Replace with actual entry ID
            description: 'entry.280408210',  // Replace with actual entry ID
            notes: 'entry.1946711073',        // Replace with actual entry ID
            routeInfo: null     // Optional: Add a separate field for computed route information (distance, time, etc.). Set to null or leave empty if not using a dedicated field. Route info will be appended to notes field automatically.
        }
    },

    // Google Maps API Configuration
    // This API key is restricted to specific domains in Google Cloud Console
    // for security. It can only be used from authorized GitHub Pages domains.
    // 
    // ⚠️ CRITICAL: Verify domain restrictions are set in Google Cloud Console:
    //    1. Go to https://console.cloud.google.com/apis/credentials
    //    2. Select this API key
    //    3. Under "Application restrictions" → ensure "HTTP referrers (websites)" is selected
    //    4. Verify your GitHub Pages domain is listed
    //    5. Monitor usage regularly at https://console.cloud.google.com/apis/dashboard
    //
    // To get your own API key:
    // 1. Go to https://console.cloud.google.com/
    // 2. Create a new project or select existing
    // 3. Enable Google Maps JavaScript API, Places API, and Distance Matrix API
    // 4. Create credentials (API Key)
    // 5. Restrict the key to your domain for security
    //
    // IMPORTANT: This key has domain restrictions set and is safe to embed
    // in the frontend code for GitHub Pages deployment.
    
    googleMaps: {
        apiKey: 'AIzaSyBug8nyirxDx8cbgOET9qtPViJyhS6DnOc'  // API key with domain restrictions for GitHub Pages
    },

    // Route computation settings
    routeComputation: {
        enabled: true,  // Set to false to disable route computation
        showSummary: true  // Show route summary to user before submission
    },

    // Email Configuration (for Admin Dashboard)
    // Configure how admins send quote responses to customers
    email: {
        // Your business email that customers should reply to
        // This will be used as the "From" address when sending quotes
        fromEmail: 'lucasphan09@example.com',  // Replace with your business email
        
        // Your business name (appears in email signature)
        businessName: 'Bus Charter Services',  // Replace with your business name
        
        // Optional: BCC email for keeping records of sent quotes
        bccEmail: '',  // Leave empty or add an email to BCC on all quote responses
        
        // Email template settings
        templates: {
            // Default subject line for quote responses
            subject: 'Your Bus Charter Quote Request',
            
            // Email signature (supports basic HTML)
            signature: `
Best regards,
Bus Charter Services Team

Phone: (555) 123-4567
Email: lucasphan09@example.com
Website: lucasphanpersonal.github.io/bus-site
            `.trim()
        }
    },

    // EmailJS Configuration (for automatic confirmation emails)
    // To set this up:
    // 1. Sign up at https://www.emailjs.com/ (free tier: 200 emails/month)
    // 2. Create an email service (connect your Gmail/Outlook)
    // 3. Create an email template for quote confirmations
    // 4. Get your Public Key, Service ID, and Template ID from EmailJS dashboard
    // See EMAIL_INTEGRATION_GUIDE.md for detailed setup instructions
    
    emailjs: {
        enabled: false,  // Set to true to enable automatic confirmation emails
        publicKey: '',   // Your EmailJS Public Key (User ID)
        serviceId: '',   // Your EmailJS Service ID
        templateId: '',  // Your EmailJS Template ID for quote confirmations
        // Template variables available:
        // {{customer_name}}, {{customer_email}}, {{customer_phone}}, {{company}},
        // {{passengers}}, {{trip_description}}, {{trip_days}}, {{notes}}, {{submission_date}}
        
        // Admin Notification Configuration
        // Send notification to admin email when a new quote is received
        adminNotification: {
            enabled: true,  // Set to true to enable admin notifications
            adminEmail: 'huabaohuang622@gmail.com',  // Admin email to receive notifications
            adminTemplateId: '',  // Your EmailJS Template ID for admin notifications
            // TODO: Replace hardcoded admin email with environment variables or secret management services
            // for better security. Consider using services like:
            // - AWS Secrets Manager
            // - Azure Key Vault
            // - Google Cloud Secret Manager
            // - Netlify Environment Variables
            // - Vercel Environment Variables
            // For production, set this in config-local.js or use environment variables
        }
    },

    // Google Sheets API Configuration (for Admin Dashboard)
    // To set this up:
    // 1. Your Google Form should be linked to a Google Sheet (Responses tab → Create Spreadsheet)
    // 2. Get the Spreadsheet ID from the URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
    // 3. Enable Google Sheets API in Google Cloud Console (same project as your Maps API)
    // 4. Use the same API key or create a new one (recommended: same key for simplicity)
    // 5. Make the spreadsheet publicly readable: Share → Anyone with link can view
    // See GOOGLE_SHEETS_SETUP.md for detailed instructions
    
    googleSheets: {
        enabled: true,  // Must be enabled for admin dashboard to work
        spreadsheetId: '180fD_bqLFvRc0WjS8fXeXsomc_feqd2R_Nz5HSpLi8k',  // The ID from your Google Sheets URL
        apiKey: '',  // Leave empty to use the same Maps API key, or provide a different key
        sheetName: 'Form Responses 1',  // Default sheet name when linking Google Form
        // Column mapping (adjust if your sheet has different column order)
        columns: {
            timestamp: 0,      // Column A (0-indexed)
            tripDays: 1,       // Column B
            passengers: 2,     // Column C
            name: 3,           // Column D
            email: 4,          // Column E
            phone: 5,          // Column F
            company: 6,        // Column G
            description: 7,    // Column H
            notes: 8           // Column I (includes route info)
        }
    },

    // Google Apps Script Configuration (for saving quotes from admin dashboard)
    // This enables admins to save quote responses directly to Google Sheets
    // See google-apps-script/README.md for setup instructions
    
    appsScript: {
        enabled: false,  // Set to true after deploying the Apps Script
        webAppUrl: '',   // Your Apps Script web app URL (e.g., 'https://script.google.com/macros/s/AKfycby.../exec')
        sharedSecret: 'CHANGE_THIS_SECRET_BEFORE_DEPLOYING',  // Must match SHARED_SECRET in Code.gs. Change to a unique value!
        // SECURITY: This secret protects your Google Sheet from unauthorized writes.
        // Choose a long, random string that's different from this placeholder.
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
