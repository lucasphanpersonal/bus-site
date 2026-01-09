# Security Setup Guide - API Key Management

## ✅ Current Configuration

**This repository now includes a Google Maps API key that is embedded in `config.js`.**

The included API key has **domain restrictions** set in Google Cloud Console, which means:
- ✅ It only works from authorized domains (GitHub Pages)
- ✅ It cannot be used from unauthorized websites
- ✅ It is safe to commit to the repository
- ✅ Ready to use immediately for GitHub Pages deployment

## When to Use This Guide

You should use the alternative methods in this guide if you:
- Want to use your own API key instead of the provided one
- Need to add additional API keys (EmailJS, etc.)
- Are deploying to a different platform (not GitHub Pages)
- Want extra security through environment variables

## ⚠️ IMPORTANT: Domain Restrictions are Critical

The provided API key is secure **only because** it has domain restrictions enabled. If you create your own API key, you **MUST** set up domain restrictions in Google Cloud Console.

**Without domain restrictions**, API keys should NEVER be committed to repositories.

---

## Method 1: Local Configuration File (Recommended for Development)

This is the simplest method for local development and testing.

### Step 1: Create config-local.js

Create a new file called `config-local.js` in the project root (same directory as `config.js`):

```javascript
// config-local.js
// This file is git-ignored and will not be committed to the repository

const CONFIG_LOCAL = {
    googleMaps: {
        apiKey: 'YOUR_ACTUAL_GOOGLE_MAPS_API_KEY'  // Put your real API key here
    },
    emailjs: {
        publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
        serviceId: 'YOUR_EMAILJS_SERVICE_ID',
        templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
        adminNotification: {
            adminTemplateId: 'YOUR_ADMIN_TEMPLATE_ID'
        }
    }
};

// Don't change this line
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG_LOCAL;
}
```

### Step 2: Verify .gitignore

Ensure your `.gitignore` file includes:

```
config.local.js
config-local.js
*.local.js
.env
.env.local
```

This is already set up in the repository, so you should be safe.

### Step 3: Update index.html

Add this script tag in your `index.html` **before** the config.js script:

```html
<!-- Load local config if it exists (git-ignored) -->
<script src="config-local.js" onerror="console.log('No local config found, using defaults')"></script>
<!-- Load base config -->
<script src="config.js"></script>
<!-- Merge local config with base config -->
<script>
    if (typeof CONFIG_LOCAL !== 'undefined') {
        // Merge CONFIG_LOCAL into CONFIG
        if (CONFIG_LOCAL.googleMaps) {
            CONFIG.googleMaps = { ...CONFIG.googleMaps, ...CONFIG_LOCAL.googleMaps };
        }
        if (CONFIG_LOCAL.emailjs) {
            CONFIG.emailjs = { ...CONFIG.emailjs, ...CONFIG_LOCAL.emailjs };
            if (CONFIG_LOCAL.emailjs.adminNotification) {
                CONFIG.emailjs.adminNotification = { 
                    ...CONFIG.emailjs.adminNotification, 
                    ...CONFIG_LOCAL.emailjs.adminNotification 
                };
            }
        }
        console.log('✅ Local configuration loaded successfully');
    }
</script>
```

---

## Method 2: Netlify Environment Variables (Recommended for Netlify Deployment)

If you're deploying to Netlify, use their environment variables feature.

### Step 1: Add Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site Settings** → **Build & Deploy** → **Environment Variables**
3. Add these variables:
   - `GOOGLE_MAPS_API_KEY` = Your Google Maps API key
   - `EMAILJS_PUBLIC_KEY` = Your EmailJS public key
   - `EMAILJS_SERVICE_ID` = Your EmailJS service ID
   - `EMAILJS_TEMPLATE_ID` = Your customer template ID
   - `EMAILJS_ADMIN_TEMPLATE_ID` = Your admin template ID

### Step 2: Create a Build Script

Create `build-config.js` in your project root:

```javascript
// build-config.js
// This file runs during build time to inject environment variables

const fs = require('fs');

const configContent = `
// Auto-generated config file - DO NOT COMMIT
const CONFIG_LOCAL = {
    googleMaps: {
        apiKey: '${process.env.GOOGLE_MAPS_API_KEY || ''}'
    },
    emailjs: {
        publicKey: '${process.env.EMAILJS_PUBLIC_KEY || ''}',
        serviceId: '${process.env.EMAILJS_SERVICE_ID || ''}',
        templateId: '${process.env.EMAILJS_TEMPLATE_ID || ''}',
        adminNotification: {
            adminTemplateId: '${process.env.EMAILJS_ADMIN_TEMPLATE_ID || ''}'
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG_LOCAL;
}
`;

fs.writeFileSync('config-local.js', configContent);
console.log('✅ Configuration file generated from environment variables');
```

### Step 3: Update Build Command

In your Netlify build settings or `netlify.toml`, set the build command:

```toml
[build]
  command = "node build-config.js"
  publish = "."
```

---

## Method 3: Vercel Environment Variables (For Vercel Deployment)

Similar to Netlify but using Vercel's platform.

### Step 1: Add Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the same variables as listed in Method 2

### Step 2: Use the Same Build Script

Use the `build-config.js` from Method 2.

---

## Method 4: GitHub Pages with Secrets (Advanced)

For GitHub Pages, you need to use GitHub Actions to inject secrets during deployment.

### Step 1: Add Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the same secrets as environment variables

### Step 2: Create GitHub Action Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create config-local.js
        run: |
          cat > config-local.js << 'EOF'
          const CONFIG_LOCAL = {
              googleMaps: {
                  apiKey: '${{ secrets.GOOGLE_MAPS_API_KEY }}'
              },
              emailjs: {
                  publicKey: '${{ secrets.EMAILJS_PUBLIC_KEY }}',
                  serviceId: '${{ secrets.EMAILJS_SERVICE_ID }}',
                  templateId: '${{ secrets.EMAILJS_TEMPLATE_ID }}',
                  adminNotification: {
                      adminTemplateId: '${{ secrets.EMAILJS_ADMIN_TEMPLATE_ID }}'
                  }
              }
          };
          if (typeof module !== 'undefined' && module.exports) {
              module.exports = CONFIG_LOCAL;
          }
          EOF
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

## Method 5: Client-Side Input (For Quick Testing Only)

⚠️ **Not recommended for production** - Only for quick testing.

Add a simple prompt on page load:

```javascript
// Add to index.html
<script>
if (!CONFIG.googleMaps.apiKey) {
    const apiKey = prompt('Enter your Google Maps API key:');
    if (apiKey) {
        CONFIG.googleMaps.apiKey = apiKey;
        sessionStorage.setItem('googleMapsApiKey', apiKey);
    }
} else if (sessionStorage.getItem('googleMapsApiKey')) {
    CONFIG.googleMaps.apiKey = sessionStorage.getItem('googleMapsApiKey');
}
</script>
```

---

## Best Practices

### 1. **Restrict Your API Keys**

Always restrict your API keys in the Google Cloud Console:

- **Application restrictions**: HTTP referrers (websites)
  - Add your domain(s): `https://yourdomain.com/*`
  - Add `localhost` for development: `http://localhost/*`

- **API restrictions**: Only enable the APIs you need
  - Google Maps JavaScript API
  - Places API
  - Distance Matrix API

### 2. **Monitor API Usage**

- Set up billing alerts in Google Cloud Console
- Monitor your API usage regularly
- Set daily quotas to prevent unexpected charges

### 3. **Rotate Keys Regularly**

- Generate new API keys every 3-6 months
- Revoke old keys after updating

### 4. **Never Commit Secrets**

- Always check files before committing: `git diff`
- Use pre-commit hooks to prevent accidental commits
- If you accidentally commit a secret, revoke it IMMEDIATELY

---

## Emergency: API Key Was Exposed

If you've already committed an API key:

### Step 1: Revoke the Key Immediately

1. Go to Google Cloud Console → Credentials
2. Delete the exposed API key
3. Generate a new one with proper restrictions

### Step 2: Remove from Git History

```bash
# Install git-filter-repo if needed
pip install git-filter-repo

# Remove the file from history
git filter-repo --path config.js --invert-paths --force

# Or replace the key in history
git filter-repo --replace-text <(echo "YOUR_OLD_API_KEY==>REMOVED_API_KEY")

# Force push (WARNING: This rewrites history)
git push --force
```

⚠️ **Note**: Rewriting git history affects all collaborators. Coordinate with your team.

### Step 3: Verify Removal

Use GitHub's secret scanning: https://github.com/settings/security_analysis

---

## Testing Your Setup

### Verify Configuration is Loaded

Add this to your browser console:

```javascript
console.log('Google Maps API Key:', CONFIG.googleMaps.apiKey ? '✅ Loaded' : '❌ Missing');
console.log('EmailJS Public Key:', CONFIG.emailjs.publicKey ? '✅ Loaded' : '❌ Missing');
```

### Test API Functionality

1. Load your website
2. Open browser developer tools (F12)
3. Check the console for any API errors
4. Try submitting a quote to test all integrations

---

## Recommended Setup for Your Use Case

Based on your deployment method:

| Deployment Method | Recommended Solution |
|------------------|---------------------|
| Local Development | Method 1: config-local.js |
| Netlify | Method 2: Netlify Environment Variables |
| Vercel | Method 3: Vercel Environment Variables |
| GitHub Pages | Method 4: GitHub Actions |
| Other Static Host | Method 1 + Manual upload |

---

## Support

If you need help setting this up:

1. Check the console for error messages
2. Verify your .gitignore includes config-local.js
3. Ensure API keys have proper restrictions
4. Test with a new API key (not the compromised one)

---

## Quick Start (TL;DR)

1. Create `config-local.js` with your real API keys
2. Add the config loading script to `index.html`
3. Never commit `config-local.js` (already in .gitignore)
4. Deploy using your platform's environment variables for production

✅ Your API keys are now secure and won't be exposed in the repository!
