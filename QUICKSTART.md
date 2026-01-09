# Quick Setup Guide - Getting Started After Security Update

## Your Next Steps

Your exposed API key has been removed and a secure configuration system has been implemented. Here's what you need to do:

### Step 1: Generate a New Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Credentials**
3. **Delete or disable the old exposed API key** (it should already be disabled by Google)
4. Click **Create Credentials** → **API Key**
5. Copy your new API key

### Step 2: Restrict Your New API Key (IMPORTANT!)

Before using your new key, restrict it to prevent future exposure issues:

1. Click on your new API key to edit it
2. Under **Application restrictions**:
   - Select "HTTP referrers (websites)"
   - Add your domains:
     ```
     https://yourdomain.com/*
     https://*.yourdomain.com/*
     http://localhost/*
     http://localhost:*/*
     ```
3. Under **API restrictions**:
   - Select "Restrict key"
   - Enable only these APIs:
     - Google Maps JavaScript API
     - Places API
     - Distance Matrix API
4. Click **Save**

### Step 3: Set Up Local Configuration

1. In your project directory, copy the example config:
   ```bash
   cp config-local.js.example config-local.js
   ```

2. Edit `config-local.js` and add your new API key:
   ```javascript
   const CONFIG_LOCAL = {
       googleMaps: {
           apiKey: 'YOUR_NEW_API_KEY_HERE'  // Paste your new key here
       },
       
       // Optional: If you want to use EmailJS
       emailjs: {
           enabled: true,
           publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
           serviceId: 'YOUR_SERVICE_ID',
           templateId: 'YOUR_TEMPLATE_ID',
           adminNotification: {
               enabled: true,
               adminEmail: 'huabaohuang622@gmail.com',
               adminTemplateId: 'YOUR_ADMIN_TEMPLATE_ID'
           }
       }
   };
   ```

3. Save the file

### Step 4: Verify the Setup

1. Open `index.html` in your browser
2. Open the browser console (F12)
3. You should see:
   ```
   ✅ Local configuration loaded successfully
   🔑 API Keys loaded: { googleMaps: '✅', emailjs: '✅' }
   ```

4. Try the location autocomplete - it should work now!

### Step 5: Test the Form

1. Fill out a quote request form
2. Verify location autocomplete works
3. Submit the form
4. Check that the submission goes through

### For Production Deployment

When deploying to production, use your platform's environment variables instead of config-local.js:

#### Netlify:
1. Go to Site Settings → Build & Deploy → Environment Variables
2. Add: `GOOGLE_MAPS_API_KEY` = Your API key
3. See SECURITY_SETUP.md for the build script

#### Vercel:
1. Go to Settings → Environment Variables
2. Add: `GOOGLE_MAPS_API_KEY` = Your API key
3. See SECURITY_SETUP.md for the build script

#### GitHub Pages:
1. Go to Settings → Secrets and variables → Actions
2. Add secret: `GOOGLE_MAPS_API_KEY`
3. See SECURITY_SETUP.md for the GitHub Actions workflow

## Important Security Reminders

- ✅ **NEVER** commit `config-local.js` (it's already in .gitignore)
- ✅ **ALWAYS** restrict your API keys in Google Cloud Console
- ✅ **SET UP** billing alerts to monitor usage
- ✅ **ROTATE** your API keys every 3-6 months
- ✅ **USE** environment variables for production deployments

## Need More Help?

- 📖 Full setup guide: [SECURITY_SETUP.md](SECURITY_SETUP.md)
- 📧 Email setup: [EMAIL_INTEGRATION_GUIDE.md](EMAIL_INTEGRATION_GUIDE.md)
- 📘 General setup: [README.md](README.md)

## Troubleshooting

**"Google Maps not loading"**
- Check console for errors
- Verify API key is in config-local.js
- Ensure config-local.js is in the same directory as index.html
- Check that all required APIs are enabled in Google Cloud Console

**"No local config found"**
- This is normal if you haven't created config-local.js yet
- Follow Step 3 above to create it

**"API key still showing as exposed"**
- You need to generate a NEW API key (Step 1)
- The old key was already exposed and disabled
- Make sure you're using the NEW key in config-local.js

---

✅ Once you've completed these steps, your application will be secure and fully functional!
