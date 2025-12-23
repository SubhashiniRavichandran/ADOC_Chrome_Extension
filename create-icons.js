#!/usr/bin/env node

/**
 * Icon Generator Script
 * Creates PNG icons for the Chrome extension
 *
 * Usage: node create-icons.js
 *
 * This script creates simple placeholder icons using Canvas.
 * For production, replace with professionally designed icons.
 */

const fs = require('fs');
const path = require('path');

// Check if we're in Node environment
if (typeof window !== 'undefined') {
  console.error('This script must be run with Node.js, not in a browser');
  process.exit(1);
}

/**
 * Create SVG icon content
 */
function createSVG(size) {
  const fontSize = size >= 48 ? Math.floor(size * 0.25) : Math.floor(size * 0.5);
  const text = size >= 48 ? 'ADOC' : 'A';
  const checkmarkSize = Math.floor(size * 0.15);
  const checkmarkX = size * 0.75;
  const checkmarkY = size * 0.75;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Rounded rectangle background -->
  <rect
    x="0"
    y="0"
    width="${size}"
    height="${size}"
    rx="${size * 0.2}"
    ry="${size * 0.2}"
    fill="url(#gradient${size})"
  />

  <!-- Text -->
  <text
    x="${size / 2}"
    y="${size / 2}"
    font-family="-apple-system, BlinkMacSystemFont, sans-serif"
    font-size="${fontSize}"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central"
  >${text}</text>

  ${size === 128 ? `
  <!-- Quality indicator badge (only for 128px) -->
  <circle cx="${checkmarkX}" cy="${checkmarkY}" r="${checkmarkSize}" fill="white" />
  <path
    d="M ${checkmarkX - checkmarkSize * 0.4} ${checkmarkY}
       L ${checkmarkX - checkmarkSize * 0.1} ${checkmarkY + checkmarkSize * 0.3}
       L ${checkmarkX + checkmarkSize * 0.4} ${checkmarkY - checkmarkSize * 0.3}"
    stroke="#22c55e"
    stroke-width="4"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  />
  ` : ''}
</svg>`;
}

/**
 * Save SVG file
 */
function saveSVG(size) {
  const iconsDir = path.join(__dirname, 'src', 'icons');

  // Create icons directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svgContent = createSVG(size);
  const filename = path.join(iconsDir, `icon${size}.svg`);

  fs.writeFileSync(filename, svgContent, 'utf8');
  console.log(`✓ Created ${filename}`);

  return filename;
}

/**
 * Instructions for converting SVG to PNG
 */
function printConversionInstructions() {
  console.log('\n📋 SVG files created successfully!');
  console.log('\nTo convert to PNG, you have several options:\n');
  console.log('Option 1: Online Converter');
  console.log('  - Visit https://cloudconvert.com/svg-to-png');
  console.log('  - Upload the SVG files');
  console.log('  - Download the PNG files\n');
  console.log('Option 2: Using Inkscape (if installed)');
  console.log('  inkscape icon16.svg --export-type=png --export-width=16');
  console.log('  inkscape icon48.svg --export-type=png --export-width=48');
  console.log('  inkscape icon128.svg --export-type=png --export-width=128\n');
  console.log('Option 3: Using ImageMagick (if installed)');
  console.log('  convert icon16.svg -resize 16x16 icon16.png');
  console.log('  convert icon48.svg -resize 48x48 icon48.png');
  console.log('  convert icon128.svg -resize 128x128 icon128.png\n');
  console.log('Option 4: Use the browser-based generator');
  console.log('  open generate-icons.html in your browser\n');
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 ADOC Extension Icon Generator\n');

  try {
    // Create SVG files
    saveSVG(16);
    saveSVG(48);
    saveSVG(128);

    printConversionInstructions();

    console.log('✅ Icon generation complete!\n');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createSVG, saveSVG };
