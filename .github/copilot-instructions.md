# Copilot Instructions for YH Travels Quote Request Site

## Project Overview

This repository is a simplified static quote-request site built with vanilla HTML, CSS, and JavaScript.

The current workflow is:

1. Visitors land on `index.html`
2. They complete the custom multi-day itinerary form on `quote.html`
3. The site posts directly to Google Forms
4. Google Forms writes responses into a linked Google Sheet
5. The business reviews the request manually and sends a quote PDF by email

The previous Google Maps, EmailJS, admin dashboard, and Apps Script architecture has been removed.

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Data Flow**: Google Forms `formResponse` endpoint and linked Google Sheet
- **Deployment**: Static hosting (GitHub Pages, Netlify, Cloudflare Pages, or similar)
- **No Build Process**: Direct file editing only, no bundlers or transpilers

## Project Structure

- `index.html` - Animated landing page
- `quote.html` - Custom integrated quote form
- `success.html` - Submission confirmation page
- `script.js` - Form logic, itinerary collection, validation, Google Forms submission
- `styles.css` - Shared styling for landing, form, and success pages
- `config.js` - Google Forms mapping, contact settings, optional landing stats
- `README.md` - Primary setup and workflow documentation

## Coding Style & Best Practices

### JavaScript Style

- Use vanilla JavaScript only
- Prefer `const`/`let`, arrow functions, template literals, and small focused functions
- Use descriptive camelCase names
- Use async/await for async flows
- Handle errors with clear user-facing messages where appropriate
- Keep submission logic simple and aligned with the Google Forms workflow

### HTML Structure

- Use semantic HTML5 elements where appropriate
- Keep labels, required attributes, and accessibility affordances intact
- Preserve the integrated on-site form experience rather than replacing it with a plain external link
- Maintain the current itinerary workflow that captures service dates plus ordered stops with optional departure times

### CSS Conventions

- Keep the existing design language: subtle animations, soft gradients, polished static-site presentation
- Use CSS custom properties for shared values
- Preserve mobile-first responsive behavior
- Avoid introducing a new visual system unless the user explicitly asks for one

## Configuration

### `config.js`

- This file is committed and is the single source of runtime configuration
- It contains:
	- `googleForm.actionUrl`
	- `googleForm.fields.*` entry mappings
	- `contact.email` and `contact.subject`
	- optional landing-page stats
- When the Google Form changes, update the `actionUrl` and `entry.*` IDs here

### Removed Configuration Patterns

- Do **not** reintroduce `config-local.js`, client-side API key loaders, or legacy config branches unless explicitly requested
- Do **not** assume Google Maps, EmailJS, Apps Script, or admin settings still exist

## Key Features to Understand

### Multi-Day Itinerary Support

- Each trip day includes:
	- date
	- an ordered list of stops
	- a required location for each stop
	- an optional departure time for each stop
- The client must still be able to document the actual operating sequence clearly, including stops that do not have a fixed time

### Google Forms Submission

- The form posts directly to Google Forms using `fetch(..., { mode: 'no-cors' })`
- `script.js` formats the itinerary into a structured text block before submission
- The generated quote reference is stored in session storage and displayed on `success.html`

### Manual Quote Workflow

- There is no in-app quoting backend
- The Google Sheet is the operational inbox
- Quotes are prepared manually and sent as PDFs outside the site

## Security Considerations

- Treat `config.js` as client-visible configuration only
- Do not add secrets, private API keys, or backend credentials to this repo
- Validate user input on the client side for usability, but do not describe it as secure backend validation
- Use HTTPS in production
- If asked for authentication or admin tooling, note that the current architecture intentionally avoids those features

## Testing & Validation

### Manual Testing

- Test landing, form, and success pages on desktop and mobile
- Test multi-day itinerary creation, removal, and ordered timed-stop entry
- Test required field validation and email validation
- Test end-to-end submission into Google Forms / Google Sheets
- Test that the success page shows the generated quote reference

### Browser Testing

- Chrome/Edge (primary)
- Firefox
- Safari and iOS Safari
- Chrome on mobile

### No Automated Tests

- This project currently has no automated test suite
- Validate changes manually in the browser after editing

## Common Tasks

### Adding a New Form Field

1. Add the field to `quote.html`
2. Update `collectFormData()` in `script.js`
3. Update `validateFormData()` if needed
4. Add or update the corresponding Google Form question
5. Update the relevant `googleForm.fields.*` entry mapping in `config.js`
6. Update `README.md` if the operational workflow changed

### Modifying Itinerary Formatting

- Keep the structured text output from `formatTripDaysForSubmission()` readable in Google Sheets
- Preserve ordered stops and optional departure times
- Update documentation if the formatting contract changes

### Contact / Business Inbox Changes

- Update `contact.email` in `config.js`
- Keep the fallback mailto links in `index.html` and `quote.html` aligned with that value

### Styling Changes

- Reuse the current CSS variable system and existing layout patterns
- Preserve the intentional, animated, polished look of the current site

## Deployment

- Static hosting only
- No build step required
- Ensure `config.js` points to the correct production Google Form

## Notes for AI Assistance

- Maintain the current low-overhead architecture unless the user explicitly asks to expand it
- Do not reintroduce Google Maps, EmailJS, admin dashboards, or Apps Script features by default
- Prefer minimal, direct changes that preserve the current UX and visual language
- Keep the site accessible, mobile-friendly, and easy to operate for a manual quote workflow
