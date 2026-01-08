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
        actionUrl: 'YOUR_GOOGLE_FORM_ACTION_URL', // e.g., 'https://docs.google.com/forms/d/e/1FAIpQLSe.../formResponse'
        
        // Map your form fields to Google Form entry IDs
        // You'll get these by inspecting your Google Form
        fields: {
            dates: 'entry.1234567890',        // Replace with actual entry ID
            location: 'entry.1234567891',     // Replace with actual entry ID
            passengers: 'entry.1234567892',   // Replace with actual entry ID
            name: 'entry.1234567893',         // Replace with actual entry ID
            email: 'entry.1234567894',        // Replace with actual entry ID (or use emailAddress)
            phone: 'entry.1234567895',        // Replace with actual entry ID
            company: 'entry.1234567896',      // Replace with actual entry ID
            description: 'entry.1234567897',  // Replace with actual entry ID
            notes: 'entry.1234567898'         // Replace with actual entry ID
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
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'  // Replace with actual API key
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
