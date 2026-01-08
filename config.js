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
            notes: 'entry.1946711073'         // Replace with actual entry ID
        }
    },

    // Google Maps API Configuration
    // To get your API key:
    // 1. Go to https://console.cloud.google.com/
    // 2. Create a new project or select existing
    // 3. Enable Google Maps JavaScript API and Places API
    // 4. Create credentials (API Key)
    // 5. Restrict the key to your domain for security
    
    googleMaps: {
        apiKey: 'AIzaSyDYXGdDhcVtvRHre4dhaKaGf_a8nfjzmL4'  // Replace with actual API key
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
