# Troubleshooting Route Computation (N/A Values)

## Issue: Distance and Duration Show "N/A"

You've reported seeing "N/A" values for distance and duration in the trip summary when submitting a quote. This document explains why this happens and how to debug it.

## Example of the Problem

```
TRIP SUMMARY:
Day 1: 2026-01-16
Time: 23:08 - 13:12 (overnight)
Distance: N/A miles
Duration: N/A
Pickup: 17 Rodman St, Quincy, MA, USA
Dropoffs: Times Square, Manhattan, NY, USA, Space Needle, Broad Street, Seattle, WA, USA
```

## Why This Happens

Route computation requires the **Google Maps Distance Matrix API** to calculate distances and driving times. "N/A" values appear when:

1. **Google Maps API isn't loading** - Script fails to load or is blocked
2. **API key issues** - Key is missing, invalid, or doesn't have the right permissions
3. **API call failures** - Network errors, rate limiting, or invalid addresses
4. **Silent errors** - JavaScript errors that are caught but not visible
5. **⭐ Extremely long distances** - Cross-country or transcontinental trips (e.g., Boston to Seattle)

### The Long Distance Problem (Your Case!)

**Google Maps Distance Matrix API has limitations for extremely long routes:**

- ❌ Routes over ~2,500-3,000 miles may fail
- ❌ Cross-country trips (East Coast to West Coast) often fail
- ❌ Routes that would take 40+ hours of driving may fail
- ❌ Routes crossing multiple time zones may have issues

**Your specific example:**
- Quincy, MA → Times Square, NY: ✅ Works (~217 miles)
- Times Square, NY → Space Needle, Seattle, WA: ❌ **Fails (~2,850 miles)**

This is a **Google Maps API limitation**, not a bug in your code!

## How to Debug

### Step 1: Open Browser Console

1. **Chrome/Edge**: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
2. **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
3. **Safari**: Enable Developer menu first, then press `Cmd+Option+C`

### Step 2: Look for Error Messages

After opening the console, submit a test quote and look for these messages:

#### ✅ **Success Messages** (Good!)
```
Starting route computation for 1 trip day(s)
Day 1: Computing 2 leg(s)
Computing route: 17 Rodman St, Quincy, MA, USA → Times Square, Manhattan, NY, USA
✓ Route computed: 217 mi, 3 hours 40 mins
Computing route: Times Square, Manhattan, NY, USA → Space Needle, Broad Street, Seattle, WA, USA
✓ Route computed: 2,852 mi, 42 hours 15 mins
Day 1 complete: 3069.0 miles, 2755 minutes
Route computation complete: {...}
Route computation successful: {...}
```

#### ❌ **Error Messages** (Problems!)

**Google Maps API Not Loading:**
```
⚠️ Route computation skipped - Google Maps API not available
```
**Solution**: Check that your Google Maps API key is configured in config.js

**API Key Missing:**
```
Failed to load Google Maps API
```
**Solution**: Add your Google Maps API key to config.js or config-local.js

**Invalid API Key:**
```
Google Maps JavaScript API error: InvalidKeyMapError
```
**Solution**: Verify your API key is correct and has the Maps JavaScript API enabled

**Distance Matrix API Not Enabled:**
```
Distance Matrix API request failed with status: REQUEST_DENIED
```
**Solution**: Enable the Distance Matrix API in Google Cloud Console

**No Route Found:**
```
No route found between "Location A" and "Location B": ZERO_RESULTS
```
**Solution**: The addresses might be invalid or too far apart

**Rate Limiting:**
```
Distance Matrix API request failed with status: OVER_QUERY_LIMIT
```
**Solution**: You've exceeded your API quota. Wait or upgrade your plan.

### Step 3: Check API Configuration

1. **Verify API Key in config.js:**
   ```javascript
   googleMaps: {
       apiKey: 'AIzaSy...'  // Should NOT be 'YOUR_GOOGLE_MAPS_API_KEY'
   }
   ```

2. **Check Google Cloud Console:**
   - Go to https://console.cloud.google.com/apis/credentials
   - Find your API key
   - Verify these APIs are enabled:
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Distance Matrix API

3. **Check API Restrictions:**
   - Your API key should allow requests from your website's domain
   - For local testing: Add `http://localhost` and `http://127.0.0.1` to allowed referrers
   - For production: Add your GitHub Pages URL or custom domain

### Step 4: Test with Simple Addresses

Try submitting a quote with very simple, well-known addresses:

- Pickup: `New York, NY, USA`
- Dropoff: `Boston, MA, USA`

If this works but your original addresses don't, the issue is with the specific addresses.

## Common Causes and Solutions

### Problem 1: Google Maps API Key Not Configured

**Symptoms:**
- Console shows: "Google Maps API key not configured"
- Map autocomplete doesn't work
- No route computation happens

**Solution:**
```javascript
// In config.js or config-local.js
googleMaps: {
    apiKey: 'YOUR_ACTUAL_API_KEY_HERE'  // Replace with real key
}
```

### Problem 2: Distance Matrix API Not Enabled

**Symptoms:**
- Console shows: "REQUEST_DENIED"
- Error: "This API project is not authorized to use this API"

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Library**
4. Search for "Distance Matrix API"
5. Click **Enable**

### Problem 3: API Key Restrictions Too Strict

**Symptoms:**
- Works on localhost but not on deployed site
- Console shows: "RefererNotAllowedMapError"

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your API key
3. Under "Application restrictions" → "HTTP referrers"
4. Add your website's URL (e.g., `https://yourusername.github.io/*`)

### Problem 4: Addresses Too Far Apart or Invalid

**Symptoms:**
- Console shows: "ZERO_RESULTS" or "NOT_FOUND"
- Console shows: "Distance is too long for route computation (Google Maps limitation for extremely long trips)"
- Some legs compute successfully, others fail
- Cross-country trips fail (e.g., NY to Seattle)

**Solution:**
- **For extremely long trips (2,500+ miles):** This is a Google Maps API limitation
  - Break the trip into multiple days with intermediate stops
  - Example: Instead of "NY → Seattle" (fails), use "NY → Chicago" (day 1) and "Chicago → Seattle" (day 2)
- **For invalid addresses:**
  - Use full, properly formatted addresses
  - Example: `17 Rodman St, Quincy, MA 02169, USA` instead of just `17 Rodman St`
  - Use the autocomplete suggestions when filling the form
- **For very long distances:** Consider if a bus charter is the right transportation method

### Problem 5: Rate Limiting

**Symptoms:**
- Console shows: "OVER_QUERY_LIMIT"
- First few legs compute, then fail

**Solution:**
- Google Maps has usage limits on free tier
- Wait and try again later
- Consider upgrading your Google Cloud billing plan
- Reduce the number of stops in your trip

## How the System Works

1. **Form Submission** → User fills out form and clicks "Get Your Quote"
2. **Route Computation** → JavaScript calls Google Maps Distance Matrix API for each leg
3. **Data Collection** → Distances, durations, and booking hours are collected
4. **Route Summary** → Modal shows computed information (or N/A if it failed)
5. **Submission** → Data (with or without route info) is sent to Google Forms
6. **Admin View** → Admin dashboard parses route info from the notes field

## What Happens When Route Computation Fails?

Don't worry! The quote submission still works:

1. ✅ Form is submitted to Google Forms
2. ✅ Data is saved in Google Sheets
3. ✅ Admin notification is sent (if EmailJS is configured)
4. ✅ Customer sees success page
5. ❌ Route information shows "N/A" in admin dashboard

**Bottom line:** The business functionality still works, you just don't get automated distance/time calculations.

## Manual Workaround

If route computation keeps failing, you can:

1. Accept quotes without route information
2. Manually calculate distances using Google Maps later
3. Add the information when responding to the quote

Or fix the API issues following this guide!

## Handling Extremely Long Trips (NEW!)

### The Problem

Google Maps Distance Matrix API cannot compute routes for extremely long distances (typically over 2,500-3,000 miles or 40+ hours of driving).

### Why It Happens

- API has distance/time limits for single route queries
- Cross-continental trips exceed these limits
- This is a Google Maps limitation, not a bug

### Your Options

#### Option 1: Break Into Multiple Days (Recommended)

Instead of one long trip, create multiple days with intermediate stops:

**❌ This will fail:**
```
Day 1: New York → Seattle (2,850 miles)
```

**✅ This will work:**
```
Day 1: New York → Chicago (790 miles)
Day 2: Chicago → Denver (1,000 miles)  
Day 3: Denver → Seattle (1,300 miles)
```

#### Option 2: Use Shorter Routes

Ensure each individual leg is under ~2,500 miles:

**❌ Fails:**
- Times Square, NY → Space Needle, Seattle (~2,850 mi)

**✅ Works:**
- Times Square, NY → Chicago, IL (~790 mi)
- Chicago, IL → Space Needle, Seattle (~2,060 mi)

#### Option 3: Accept Partial Information

The system now handles partial route failures gracefully:
- ✅ Successfully computed legs are shown
- ⚠️ Failed legs are listed with reasons
- ℹ️ Totals show "(partial)" indicator
- 📊 You can still review and submit the quote

### What the Updated System Shows

When long-distance legs fail, you'll now see:

```
⚠️ Notice: 1 route segment could not be computed. This may be due to 
extremely long distances (e.g., cross-country trips), locations separated 
by ocean, or other route limitations.

The displayed distance and time are incomplete. Please review the failed 
segments below...

Day 1:
  Distance: 217.0 miles (partial)
  Driving Time: 3h 40m (partial)
  
  Failed segments (1):
  • Times Square, Manhattan, NY, USA → Space Needle, Broad Street, Seattle, WA, USA
    Distance is too long for route computation (Google Maps limitation)
```

### Best Practices

1. **Plan realistic daily segments** - Keep each day's driving under 12 hours
2. **Add intermediate stops** - Break long trips into manageable chunks
3. **Use major cities as waypoints** - Chicago, Denver, etc.
4. **Consider flight alternatives** - For 2,500+ mile trips, flying might be better

### Still Want Cross-Country Trips?

If you absolutely need to quote very long trips:

1. ✅ **Submit the quote anyway** - The form still works with partial info
2. 📝 **Manually calculate** - Use Google Maps to get estimates
3. 📧 **Add in response** - Include accurate mileage when sending the quote to customer
4. 🚌 **Consider feasibility** - Is a multi-day bus charter realistic?

## Enhanced Logging (Added in Latest Update)

We've added detailed console logging to help you debug:

- `Starting route computation for X trip day(s)` - Computation begins
- `Day X: Computing Y leg(s)` - Processing each day
- `Computing route: A → B` - Each leg being computed
- `✓ Route computed: X mi, Y time` - Successful leg
- `Day X complete: X miles, Y minutes` - Day summary
- `Route computation complete` - Full success
- `⚠️ Error messages` - Specific failures with details

## Still Having Issues?

If you've followed all these steps and still see N/A values:

1. **Check browser console for specific errors**
2. **Try in a different browser** (Chrome works best)
3. **Clear browser cache and reload**
4. **Test with simple addresses first**
5. **Verify all 3 Google APIs are enabled**
6. **Check Google Cloud Console quota usage**

## Related Resources

- Google Maps API Documentation: https://developers.google.com/maps/documentation/distance-matrix
- Google Cloud Console: https://console.cloud.google.com/
- API Key Setup Guide: See `SETUP_GUIDE.md`
- General troubleshooting: See `README.md`

---

**Remember:** Even if route computation fails, your quote system still works! The N/A values are just missing computed data, not a critical failure.
