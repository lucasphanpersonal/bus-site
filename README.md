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
- Each trip day captures an ordered list of stops.
- Each stop captures a required location.
- Each stop can include an optional departure time.
- Stops can be listed back-to-back with no time between them when timing is flexible.

That means the client is still explicitly documenting the real operating sequence without forcing artificial drop-off times.

## Google Form Structure

You noted that a new Google Form can be created to fit this rebuilt flow. That is the cleanest option.

The custom UI does not visually embed the Google Form. Instead, it posts to Google Forms in the background using the field mapping in `config.js`.

Recommended Google Form questions for the new setup:

1. `Quote Reference`
Type: Short answer
Use: receives the generated quote ID from the custom form.

2. `Trip Days / Schedule and Locations`
Type: Paragraph
Use: receives the full structured itinerary, including every date, every stop in order, and any departure times that matter.

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
Day 1: 2026-05-14
  Stop 1: Courtyard (depart 3:00 PM)
  Stop 2: Halifax (depart 8:30 PM)
  Stop 3: Courtyard
  Stop 4: Halifax (depart 11:30 PM)
  Stop 5: Courtyard
```

This is the core reason a new Google Form should include a dedicated long-answer itinerary field rather than separate pickup and drop-off questions.

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

For the itinerary itself, the best storage format is one long-answer Google Form field mapped to one Sheet column. Do not try to create separate spreadsheet columns for pickup, drop-off, and stop times, because the number of stops changes from request to request. One itinerary column keeps each request on a single row while still preserving the full stop order.

Recommended manual-use columns to add to the right of the form response columns:

1. `Quote Amount`
2. `Send Quote?`

Use `Send Quote?` as a checkbox column. The owner can work directly on the linked Google Sheet row for that request instead of trying to edit the Google Form submission itself.

You do **not** need to add an `Email Address` column manually here, because that column is already part of the original form response data coming from the site.

## Quote PDF Workflow

Use a Google Doc template for outbound quotes, export it as PDF, and email it manually. That keeps the system simple and avoids rebuilding backend logic that is no longer necessary.

## Optional Autocrat Workflow

Autocrat is a good fit if you want the owner to stay on the same response row in Google Sheets, enter the final quote details, and then generate and email the PDF quote from that data.

Important constraint:

- Do not try to have the owner update the original Google Form itself.
- The correct control point is the linked Google Sheet row created by the customer submission.
- The owner should edit the manual-use columns on that same row.

Recommended row-level workflow:

1. Customer submits the site form.
2. Google Forms writes one row into the linked Sheet.
3. Owner opens that row in Google Sheets.
4. Owner fills in `Quote Amount`.
5. Owner checks `Send Quote?`.
6. Autocrat generates the PDF from a Google Doc template and emails it to the customer.
7. Owner clears `Send Quote?` after the send so the row is not picked up again on the next manual run.

### Recommended columns for Autocrat

These columns work well with the current site output:

1. `Quote Reference`
Already supplied by the site.

2. `Trip Days / Schedule and Locations`
Already supplied by the site as one formatted itinerary block.

3. `Full Name`
Already supplied by the site.

4. `Email Address`
Already supplied by the site.

5. `Quote Amount`
The final price the owner calculated manually.

6. `Send Quote?`
Checkbox used to mark the row ready for Autocrat.

Those are the only two owner-managed columns needed for the basic workflow.

`Email Address` is still required for Autocrat, but it already exists on the response row from Google Forms, so it does not need to be added as an extra owner-side column.

### Set up Autocrat

1. Install Autocrat in the linked Google Sheet.
2. Create a Google Doc quote template.
3. Add merge tags in the template that match your sheet headers, for example:

```text
<<Quote Reference>>
<<Full Name>>
<<Trip Days / Schedule and Locations>>
<<Quote Amount>>
```

If you want the customer email shown inside the PDF itself, you can also add:

```text
<<Email Address>>
```

That merge tag is optional for the document body. It is not required just to send the email, because Autocrat can use the existing `Email Address` column directly as the recipient field.

4. In Autocrat, create a new merge job using that template.
5. Map the merge tags to the matching columns.
6. Set the output to PDF.
7. Set the file name to something like:

```text
<<Quote Reference>> - <<Full Name>> Quote
```

8. Configure email delivery:
    - To: the `Email Address` column
    - Subject: something like `Your Charter Quote - <<Quote Reference>>`
    - Body: short owner-facing message with the PDF attached
    - Attachment: merged PDF

You do not need extra owner-side columns like quote number, notes, PDF link, or sent date unless you decide later that you want more tracking inside the Sheet.

### Best trigger model

The lowest-overhead approach is:

- Owner fills in the row.
- Owner checks `Send Quote?`.
- Owner runs the Autocrat job manually.
- Owner unchecks `Send Quote?` after the quote is sent.

That keeps control with the owner and avoids accidental sends while a quote is still being edited.

If your Autocrat version supports merge conditions, configure it so only rows with `Send Quote? = TRUE` are processed.

If that condition UI is not available in your version, the fallback is:

- keep using the `Send Quote?` checkbox
- manually run only ready rows
- clear the checkbox after each successful send so the row does not get emailed again later

### Best practical recommendation

For this project, Autocrat is the right next step if you want:

- manual pricing
- PDF generation
- emailed quotes
- everything tied back to the same response row

It does not require changing the front-end site architecture. The site can stay exactly as it is, and the owner-side quote-delivery workflow can live entirely inside Google Sheets + Google Docs + Autocrat.

## Deployment

This is still a plain static site. Deploy it to GitHub Pages, Netlify, Cloudflare Pages, or any other static host.

There is no build step.

## Local Preview

Open `index.html` directly in a browser, or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.
