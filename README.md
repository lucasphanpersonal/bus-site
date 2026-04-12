# YH Travels Quote Request Site

This site keeps the polished front-end experience from the original project while simplifying the operations behind it.

1. Visitors land on the animated splash page at `index.html`.
2. They complete the custom integrated form at `quote.html`.
3. The form posts directly to Google Forms.
4. Google Forms writes the request into a Google Sheet.
5. You review the request and send a quote PDF manually.

There is no Google Maps integration, no admin dashboard, and no Apps Script backend.

## Files

- `index.html` - Animated landing page.
- `quote.html` - Custom request form with multi-day itinerary support.
- `success.html` - Confirmation page after submit.
- `styles.css` - Shared styles for landing, form, and success pages.
- `script.js` - Dynamic form behavior and Google Forms submission.
- `config.js` - Google Form endpoint, field mapping, contact email, and optional landing stats.

## Critical Itinerary Behavior

The form keeps the workflow you said is critical:

- Each request can include multiple trip days.
- Each trip day captures a date.
- Each trip day captures a start time and end time.
- Each trip day captures one pickup location.
- Each trip day captures multiple drop-off locations.
- Stops are entered in travel order so the itinerary reads clearly in the Sheet.

That means the client is still explicitly documenting all pickup and drop-off locations and the corresponding time windows.

## Google Form Structure

You noted that a new Google Form can be created to fit this rebuilt flow. That is the cleanest option.

The custom UI does not visually embed the Google Form. Instead, it posts to Google Forms in the background using the field mapping in `config.js`.

Recommended Google Form questions for the new setup:

1. `Quote Reference`
Type: Short answer
Use: receives the generated quote ID from the custom form.

2. `Trip Days / Schedule and Locations`
Type: Paragraph
Use: receives the full structured itinerary, including every date, time, pickup, and drop-off.

3. `Passenger Count`
Type: Short answer or number

4. `Full Name`
Type: Short answer

5. `Email Address`
Type: Short answer
Recommendation: add email validation.

6. `Phone Number`
Type: Short answer

7. `Company / Organization`
Type: Short answer

8. `Trip Summary`
Type: Paragraph

9. `Special Notes / Requirements`
Type: Paragraph

## How The Itinerary Is Submitted

The custom form converts the trip-day UI into one structured text block for the Google Form field mapped as `tripDays`.

Example:

```text
Day 1: 2026-05-14 from 07:30 to 18:00
  Pick-up: Quincy High School, Quincy, MA
  Drop-off 1: Logan Airport, Boston, MA
  Drop-off 2: Seaport Hotel, Boston, MA

Day 2: 2026-05-15 from 09:00 to 14:30
  Pick-up: Seaport Hotel, Boston, MA
  Drop-off 1: Quincy High School, Quincy, MA
```

That is the core reason a new Google Form should include a dedicated long-answer itinerary field.

## Updating `config.js`

After creating the new Google Form:

1. Get the new Google Form `formResponse` URL.
2. Inspect the form to get the new `entry.*` IDs.
3. Replace the values in `config.js` under `googleForm.actionUrl` and `googleForm.fields`.

The current mapping keys are:

- `quoteId`
- `tripDays`
- `passengers`
- `name`
- `email`
- `phone`
- `company`
- `description`
- `notes`

You can rename the actual Google Form questions however you want, as long as the mapping in `config.js` is updated correctly.

## Contact Settings

`config.js` also contains:

- `contact.email` - used by the “Ask A Question” links.
- `contact.subject` - default subject line for mailto links.

The current configured inbox is `huabaohuang622@gmail.com`. Update `config.js` if that contact address changes.

## Optional Landing Stats

The landing page still supports the animated stats section from the original design. It is disabled by default.

Example:

```javascript
landingPage: {
    stats: {
        enabled: true,
        items: [
            { number: '15+', label: 'Years Experience' },
            { number: '1000+', label: 'Group Trips Coordinated' },
            { number: '24h', label: 'Typical Response Window' }
        ]
    }
}
```

## Google Sheet Workflow

Inside Google Forms, link the form to a Google Sheet and enable email notifications for new responses if desired.

Recommended manual-use columns to add to the right of the form response columns:

1. `Request Status`
2. `Internal Notes`
3. `Quote Number`
4. `Quote Amount`
5. `Quote PDF Link`
6. `Quote Sent Date`
7. `Outcome`

Recommended values:

- `Request Status`: `New`, `Quoted`, `Won`, `Lost`
- `Outcome`: `Pending`, `Accepted`, `Declined`

## Quote PDF Workflow

Use a Google Doc template for outbound quotes, export it as PDF, and email it manually. That keeps the system simple and avoids rebuilding backend logic that is no longer necessary.

## Deployment

This is still a plain static site. Deploy it to GitHub Pages, Netlify, Cloudflare Pages, or any other static host.

There is no build step.

## Local Preview

Open `index.html` directly in a browser, or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.
