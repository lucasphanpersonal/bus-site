# Copilot Instructions for Bus Charter Quote Request Website

## Project Overview

This is a bus charter quote request website built with vanilla HTML, CSS, and JavaScript. It's a static website that integrates with Google Forms for data collection, Google Maps for location services, and EmailJS for email notifications. The site includes both a client-facing form and a password-protected admin dashboard.

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **APIs**: Google Maps JavaScript API, Google Places API, Google Distance Matrix API, EmailJS
- **Data Storage**: Google Forms and Google Sheets integration
- **Deployment**: Static hosting (GitHub Pages, Netlify, or similar)
- **No Build Process**: Direct HTML/CSS/JS files, no bundlers or transpilers

## Project Structure

- `index.html` - Main client-facing form page
- `success.html` - Confirmation page after form submission
- `admin.html` - Password-protected admin dashboard
- `script.js` - Main form logic, API integrations, route calculations
- `admin.js` - Admin dashboard functionality, data loading and visualization
- `styles.css` - All styling with CSS custom properties for theming
- `config.js` - Configuration file for API keys and settings (includes domain-restricted API key)
- `config-local.js.example` - Template for local development API keys

## Coding Style & Best Practices

### JavaScript Style

- Use ES6+ features (arrow functions, template literals, const/let, destructuring)
- Use vanilla JavaScript - no frameworks or libraries except for API integrations
- Prefer functional programming patterns where appropriate
- Use descriptive function and variable names (camelCase for functions/variables)
- Add JSDoc comments for complex functions
- Handle errors gracefully with try-catch blocks and user-friendly error messages
- Use async/await for asynchronous operations
- Keep functions small and focused on a single responsibility

### HTML Structure

- Use semantic HTML5 elements (`<section>`, `<article>`, `<nav>`, etc.)
- Maintain proper accessibility with ARIA labels where needed
- Use form validation attributes (required, type, min, max, etc.)
- Keep HTML clean and well-indented

### CSS Conventions

- Use CSS custom properties (CSS variables) for theming
- Follow mobile-first responsive design approach
- Use flexbox and grid for layouts
- Class names should be descriptive and kebab-case
- Organize CSS by component/section
- Use media queries for responsive breakpoints

### API Integration Patterns

- Always check if API keys are configured before making API calls
- Provide fallback behavior when APIs are unavailable
- Add console warnings for configuration issues
- Respect API rate limits (use delays between batch calls)
- Handle API errors gracefully with user feedback

## Security Considerations

### Critical Security Rules

- **NEVER commit real API keys to the repository** - Use `config-local.js` (git-ignored)
- The repository includes a domain-restricted Google Maps API key in `config.js` which is safe
- Default admin password is `admin123` - always remind users to change this
- Client-side authentication in `admin.js` is for personal use only, not production-grade
- EmailJS credentials in `config.js` should be treated as semi-public (they have domain restrictions)
- Always validate and sanitize user inputs
- Use HTTPS for production deployments
- Set up proper CORS and API key restrictions in Google Cloud Console

### When Modifying Security Features

- If touching authentication code, add prominent warnings about its limitations
- Recommend backend authentication for production use cases
- Always mention the need to change default passwords
- Reference `SECURITY_SETUP.md` for comprehensive security guidelines

## Configuration Files

### config.js

- Contains Google Maps API key (domain-restricted, safe to commit)
- Contains Google Forms configuration (entry IDs)
- Contains EmailJS configuration (when enabled)
- Contains feature flags for route computation and email notifications
- Should be committed to the repository

### config-local.js (git-ignored)

- Used for local development with unrestricted API keys
- Template available in `config-local.js.example`
- Should NEVER be committed to the repository
- Used for testing before setting up domain restrictions

## Key Features to Understand

### Multi-Day Trip Support

- Each trip day has a date, start time, end time, one pickup location, and multiple dropoff locations
- The system calculates route information per day and in total
- Dropoff locations are managed dynamically (add/remove buttons)

### Route Calculation

- Uses Google Distance Matrix API to calculate distances and travel times
- Calculates leg-by-leg routes (pickup → dropoff 1 → dropoff 2 → ... → final dropoff)
- Computes booking hours from start/end times
- Shows a summary modal before final submission
- Can be disabled via `CONFIG.routeComputation.enabled`

### Google Forms Integration

- Form data is submitted to Google Forms via POST request to formResponse endpoint
- Trip days data is formatted as structured text with dates, times, and locations
- Route computation data is appended to the special notes field
- Each form field maps to a specific entry ID in Google Forms

### Admin Dashboard

- Password-protected with client-side authentication (not production-grade)
- Loads data from Google Sheets via public URL
- Displays analytics: total quotes, monthly stats, passengers, miles
- Shows interactive maps for each trip day's route
- Detects and highlights notable trip characteristics (multi-day, large groups, long distances, interstate)

### Email Notifications

- Optional integration with EmailJS for customer confirmations and admin notifications
- Can be disabled via `CONFIG.emailjs.enabled`
- Requires EmailJS account and template setup
- See `EMAIL_INTEGRATION_GUIDE.md` for setup instructions

## Testing & Validation

### Manual Testing

- Test form submission with and without API keys configured
- Test location autocomplete with Google Maps API
- Test route calculation with multiple dropoff locations
- Test responsive design on mobile, tablet, and desktop viewports
- Test admin dashboard authentication and data loading
- Verify form validation for all required fields
- Test error handling for API failures

### Browser Testing

- Chrome/Edge (primary browsers)
- Firefox
- Safari (especially for iOS)
- Mobile browsers (iOS Safari, Chrome Mobile)

### No Automated Tests

- This project has no automated test suite
- All testing is manual via browser testing
- When adding features, manually test all affected functionality

## Common Tasks

### Adding a New Form Field

1. Add HTML input in `index.html`
2. Add corresponding entry ID in `config.js` under `googleForm.fields`
3. Update `collectFormData()` function in `script.js` to collect the field value
4. Update `validateFormData()` function in `script.js` if validation is needed
5. Add the field to your Google Form and get its entry ID
6. Update admin dashboard display if needed

### Modifying Route Calculation

- Route logic is in `computeRoute()` function in `script.js`
- Uses Google Distance Matrix API via `calculateDistance()` helper
- Results are formatted in `formatRouteInformation()` and `generateRouteText()`
- Displayed in modal via `displayRouteModal()`

### Styling Changes

- Color scheme defined in CSS variables at the top of `styles.css`
- Responsive breakpoints: 768px (tablet), 992px (desktop)
- Use existing utility classes where possible
- Mobile-first approach: base styles are for mobile, media queries for larger screens

### API Integration Changes

- API keys loaded from `CONFIG` object (merges `CONFIG` and `CONFIG_LOCAL`)
- Check for key availability before making API calls
- Provide meaningful console warnings for missing configuration
- Always handle API errors and show user-friendly messages

## Important Documentation Files

- `README.md` - Main project documentation and setup guide
- `SECURITY_SETUP.md` - Security best practices and API key management
- `GOOGLE_SHEETS_SETUP.md` - Admin dashboard data storage setup
- `EMAIL_INTEGRATION_GUIDE.md` - EmailJS setup and configuration
- `QUICKSTART.md` - Quick setup guide for new users
- `ADMIN_GUIDE.md` - Admin dashboard usage guide

## Deployment

- This is a static website (no server-side code)
- Can be deployed to GitHub Pages, Netlify, Vercel, or any static hosting
- No build process required - just upload the files
- Ensure API keys are properly restricted to deployment domains
- Update `config.js` with production Google Forms URL if different

## Notes for AI Assistance

- When suggesting code changes, maintain the existing vanilla JavaScript style
- Don't introduce frameworks or build tools unless explicitly requested
- Always consider mobile responsiveness when modifying UI
- Remember that this is a client-side only application
- When working with APIs, respect rate limits and handle errors
- Prioritize user experience and accessibility
- Keep security best practices in mind, especially for API keys and authentication
- Reference existing documentation files for detailed information
- Test suggestions manually as there's no automated test suite
