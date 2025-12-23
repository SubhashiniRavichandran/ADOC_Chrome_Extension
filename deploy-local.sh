#!/bin/bash

# ADOC Extension - Local Deployment Script
# This script helps you prepare and test the extension locally

set -e  # Exit on error

echo "🚀 ADOC Extension - Local Deployment Helper"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo -e "${RED}Error: manifest.json not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

echo "✓ Found manifest.json"
echo ""

# Check for icon files
echo "📋 Checking for icon files..."
ICONS_NEEDED=false

if [ ! -f "src/icons/icon16.png" ]; then
    echo -e "${YELLOW}⚠ Missing: src/icons/icon16.png${NC}"
    ICONS_NEEDED=true
fi

if [ ! -f "src/icons/icon48.png" ]; then
    echo -e "${YELLOW}⚠ Missing: src/icons/icon48.png${NC}"
    ICONS_NEEDED=true
fi

if [ ! -f "src/icons/icon128.png" ]; then
    echo -e "${YELLOW}⚠ Missing: src/icons/icon128.png${NC}"
    ICONS_NEEDED=true
fi

if [ "$ICONS_NEEDED" = true ]; then
    echo ""
    echo -e "${YELLOW}Icon files are missing. You need to create them before deploying.${NC}"
    echo ""
    echo "Options to create icons:"
    echo "1. Open generate-icons.html in Chrome and download PNGs"
    echo "2. Convert SVG files to PNG using online tool:"
    echo "   https://cloudconvert.com/svg-to-png"
    echo "3. Use ImageMagick (if installed):"
    echo "   convert src/icons/icon16.svg -resize 16x16 src/icons/icon16.png"
    echo "   convert src/icons/icon48.svg -resize 48x48 src/icons/icon48.png"
    echo "   convert src/icons/icon128.svg -resize 128x128 src/icons/icon128.png"
    echo ""
    read -p "Press Enter to continue after creating icons, or Ctrl+C to exit..."
fi

# Verify icons are now present
if [ ! -f "src/icons/icon16.png" ] || [ ! -f "src/icons/icon48.png" ] || [ ! -f "src/icons/icon128.png" ]; then
    echo -e "${RED}Error: Icon files still missing. Please create them and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All icon files found${NC}"
echo ""

# Check Chrome installation
echo "📋 Checking for Chrome..."
if command -v google-chrome &> /dev/null; then
    CHROME_CMD="google-chrome"
elif command -v chromium &> /dev/null; then
    CHROME_CMD="chromium"
elif [ -d "/Applications/Google Chrome.app" ]; then
    CHROME_CMD="open -a 'Google Chrome'"
else
    echo -e "${YELLOW}⚠ Chrome not found in PATH${NC}"
    CHROME_CMD=""
fi

if [ -n "$CHROME_CMD" ]; then
    echo -e "${GREEN}✓ Chrome found${NC}"
else
    echo -e "${YELLOW}⚠ Please open Chrome manually${NC}"
fi
echo ""

# Show deployment instructions
echo "📝 Deployment Instructions:"
echo "=========================="
echo ""
echo "1. Open Chrome and navigate to:"
echo "   chrome://extensions/"
echo ""
echo "2. Enable 'Developer mode' (toggle in top-right)"
echo ""
echo "3. Click 'Load unpacked'"
echo ""
echo "4. Select this directory:"
echo "   $(pwd)"
echo ""
echo "5. Verify extension appears in the list"
echo ""
echo "6. Click the ADOC icon in Chrome toolbar"
echo ""
echo "7. Configure your ADOC credentials in Settings"
echo ""

# Offer to open Chrome extensions page
if [ -n "$CHROME_CMD" ]; then
    echo ""
    read -p "Would you like to open Chrome extensions page now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Opening Chrome extensions page..."
        eval "$CHROME_CMD" "chrome://extensions/" 2>/dev/null || {
            echo -e "${YELLOW}Could not open automatically. Please open chrome://extensions/ manually.${NC}"
        }
    fi
fi

echo ""
echo -e "${GREEN}✅ Extension is ready for local installation!${NC}"
echo ""
echo "Need help? Check:"
echo "  - INSTALLATION.md for detailed instructions"
echo "  - DEPLOYMENT.md for deployment options"
echo "  - README.md for usage guide"
echo ""
