# ADOC Extension - Deployment Guide

## 🚀 Deployment Options

### Option 1: Local Installation (Immediate - No Account Required)
### Option 2: Chrome Web Store (Public Distribution - Requires Developer Account)

---

## ⚡ Option 1: Local Installation (Recommended for Testing)

### Prerequisites
- Google Chrome 120+ installed
- The extension source code (this directory)
- Icon images (SVG files provided, need PNG conversion)

### Step 1: Convert SVG Icons to PNG

You have 3 options:

#### A. Using Online Converter (Easiest)
1. Visit https://cloudconvert.com/svg-to-png
2. Upload these files from `src/icons/`:
   - `icon16.svg` → Convert to PNG (16x16)
   - `icon48.svg` → Convert to PNG (48x48)
   - `icon128.svg` → Convert to PNG (128x128)
3. Download the PNG files
4. Rename them to `icon16.png`, `icon48.png`, `icon128.png`
5. Move them to `src/icons/` directory

#### B. Using Browser-Based Generator
1. Open `generate-icons.html` in Chrome
2. Click "Download All Icons"
3. Move downloaded files to `src/icons/`

#### C. Using Command Line (ImageMagick)
```bash
cd src/icons
convert icon16.svg -resize 16x16 icon16.png
convert icon48.svg -resize 48x48 icon48.png
convert icon128.svg -resize 128x128 icon128.png
```

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page**
   ```
   chrome://extensions/
   ```
   Or: Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the switch in the top-right corner

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to this project directory
   - Select the folder (where `manifest.json` is located)
   - Click "Select"

4. **Verify Installation**
   - Extension should appear in the list
   - ADOC icon should appear in Chrome toolbar
   - No errors should be shown

### Step 3: Configure Extension

1. **Click the ADOC extension icon** in toolbar
2. **Click "Configure Now"** or the settings gear icon
3. **Enter ADOC credentials:**
   - Server URL: `https://adoc.acceldata.io` (or your instance)
   - API Access Key: (from ADOC Admin Central)
   - API Secret Key: (from ADOC Admin Central)
4. **Click "Test Connection"** to verify
5. **Click "Save Credentials"**

### Step 4: Test on PowerBI

1. Navigate to a PowerBI report
2. Wait 2-3 seconds for the sidebar to appear
3. Verify data loads correctly
4. Test all features

---

## 🌐 Option 2: Chrome Web Store Deployment

### Prerequisites

1. **Chrome Web Store Developer Account**
   - Visit: https://chrome.google.com/webstore/devconsole
   - One-time registration fee: $5 USD
   - Requires Google account

2. **Required Assets**
   - Icon files (already created as SVGs)
   - Screenshots (need to create)
   - Promotional images (optional but recommended)

### Step 1: Create Required Assets

#### A. Screenshots (Required - at least 1, up to 5)
Dimensions: 1280x800 or 640x400 pixels

**What to screenshot:**
1. Extension popup with stats
2. PowerBI page with sidebar open
3. Settings/options page
4. Alerts tab view
5. Lineage visualization

**How to create:**
1. Load extension locally
2. Open PowerBI and configure
3. Use browser screenshot tool or:
   - macOS: Cmd+Shift+4
   - Windows: Snipping Tool
4. Resize to 1280x800 if needed

#### B. Promotional Images (Optional)
- Small tile: 440x280 pixels
- Marquee: 1400x560 pixels (for featured listings)

### Step 2: Create Privacy Policy

**Required for Chrome Web Store**

Create a simple privacy policy. Example:

```markdown
# Privacy Policy for ADOC Data Reliability Extension

## Data Collection
- This extension does NOT collect any personal data
- This extension does NOT track user behavior
- This extension does NOT send telemetry

## Data Storage
- API credentials are stored locally and encrypted
- All data is stored on your device only
- No data is transmitted to third parties

## Data Usage
- Extension only communicates with your configured ADOC instance
- API calls are made directly to your ADOC server
- Credentials are used only for authentication

## Contact
support@acceldata.io
```

Host this on:
- Your company website
- GitHub Pages
- Google Docs (set to public)

### Step 3: Package Extension for Upload

```bash
# Create a ZIP file of the extension
cd /Users/pshanmugam/Projects/Personal/adoc
zip -r adoc-extension-v1.0.0.zip . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "node_modules/*" \
  -x "*.md" \
  -x "generate-icons.html" \
  -x "create-icons.js"
```

Or use the npm script:
```bash
npm run package
```

**Verify ZIP contents:**
- manifest.json (required)
- src/ directory with all code
- Icon PNG files (required)
- No unnecessary files

### Step 4: Chrome Web Store Submission

1. **Go to Chrome Web Store Developer Dashboard**
   https://chrome.google.com/webstore/devconsole

2. **Click "New Item"**

3. **Upload ZIP File**
   - Upload `adoc-extension-v1.0.0.zip`
   - Wait for upload to complete

4. **Fill Out Store Listing**

   **Product Details:**
   - Name: `ADOC Data Reliability for BI Tools`
   - Summary (132 chars max):
     ```
     View data reliability scores and alerts from ADOC directly in PowerBI, Tableau, and Looker
     ```

   **Description:**
   ```
   ADOC Data Reliability Extension brings Acceldata's data observability
   capabilities directly into your Business Intelligence tools.

   KEY FEATURES:
   • Real-time data quality scores for PowerBI reports
   • Data reliability alerts without leaving your workflow
   • Column-level quality indicators
   • Data lineage visualization
   • Browser notifications for critical issues
   • Secure credential management

   SUPPORTED BI TOOLS:
   • PowerBI (Full support)
   • Tableau (Coming soon)
   • Looker (Coming soon)

   REQUIREMENTS:
   • Active ADOC (Acceldata Data Observability Cloud) account
   • API credentials from ADOC Admin Central
   • Chrome 120 or later

   Get started by configuring your ADOC credentials in the extension settings.
   ```

   **Category:** Productivity

   **Language:** English

5. **Upload Assets**
   - Icon: 128x128 PNG (already created)
   - Screenshots: Upload 1-5 screenshots
   - Promotional tile: 440x280 (optional)

6. **Privacy**
   - Privacy Policy URL: (your hosted privacy policy)
   - Single Purpose Description:
     ```
     Displays data quality and reliability information from ADOC
     within Business Intelligence tools
     ```
   - Permission Justifications:
     - `storage`: Store user settings and API credentials
     - `notifications`: Display data quality alerts
     - `activeTab`: Detect current BI tool page
     - Host permissions: Access BI tools and ADOC APIs

7. **Distribution**
   - Visibility: Public (or Unlisted if you want only specific users)
   - Regions: All regions (or select specific countries)

8. **Submit for Review**
   - Review all information
   - Click "Submit for Review"
   - Wait for Google review (typically 1-3 business days)

### Step 5: Post-Submission

**While Waiting for Approval:**
- Check your email for review updates
- Respond to any questions from Google reviewers
- Fix any issues if rejection occurs

**After Approval:**
- Extension will be live on Chrome Web Store
- Share the store URL with users
- Monitor reviews and ratings
- Address user feedback

---

## 🔄 Updating the Extension

### For Local Installation
1. Make changes to code
2. Go to `chrome://extensions/`
3. Click reload icon on ADOC extension
4. Test changes

### For Chrome Web Store
1. Update version in `manifest.json`
2. Update `CHANGELOG.md`
3. Create new ZIP package
4. Upload to Chrome Web Store Developer Dashboard
5. Submit updated version
6. Users will auto-update within hours

---

## ✅ Pre-Deployment Checklist

### Before Local Testing
- [ ] Icons created (PNG files in src/icons/)
- [ ] manifest.json has correct version
- [ ] No console errors
- [ ] All features work

### Before Chrome Web Store Submission
- [ ] All testing complete
- [ ] Screenshots created
- [ ] Privacy policy hosted
- [ ] ZIP package created
- [ ] Developer account ready ($5 paid)
- [ ] All assets prepared
- [ ] Version number updated
- [ ] CHANGELOG updated

---

## 🐛 Troubleshooting Deployment

### Extension Won't Load
**Error:** "Manifest file is missing or unreadable"
- Verify `manifest.json` is in root directory
- Check JSON syntax (no trailing commas)

**Error:** "Could not load icon"
- Ensure PNG files exist in `src/icons/`
- Verify file names match manifest.json

### Extension Loads But No Icon
- Clear Chrome cache
- Reload extension
- Check icon paths in manifest.json

### Chrome Web Store Rejection

**Common reasons:**
- Missing privacy policy
- Insufficient permission justification
- Misleading description
- Copyright issues

**How to fix:**
- Read rejection email carefully
- Make requested changes
- Resubmit

---

## 📞 Getting Help

### For Local Installation Issues
- Check console: `chrome://extensions/` → Details → Inspect views
- Review INSTALLATION.md
- Check DEVELOPMENT.md for debugging

### For Chrome Web Store Issues
- Chrome Web Store Developer Support
- Developer documentation: https://developer.chrome.com/docs/webstore/

### For Extension Functionality Issues
- Email: support@acceldata.io
- Check TROUBLESHOOTING section in README.md

---

## 🎯 Quick Start Commands

```bash
# Navigate to project
cd /Users/pshanmugam/Projects/Personal/adoc

# Create deployment package
npm run package

# Or manually
zip -r adoc-extension-v1.0.0.zip . -x "*.git*" -x "*.DS_Store" -x "*.md"
```

---

## 📊 Deployment Timeline

| Step | Time Required | Type |
|------|---------------|------|
| Convert icons | 5 minutes | Manual |
| Local installation | 2 minutes | Manual |
| Test extension | 15-30 minutes | Manual |
| Create screenshots | 10 minutes | Manual |
| Chrome Web Store setup | 20 minutes | Manual |
| Google review | 1-3 days | Automated |
| **Total for local** | ~30 minutes | - |
| **Total for store** | ~1-3 days | - |

---

## ✨ Recommendation

**Start with Local Installation:**
1. Test thoroughly locally first
2. Verify all features work
3. Get user feedback
4. Then submit to Chrome Web Store

This approach reduces the chance of rejection and ensures a smooth public release!
