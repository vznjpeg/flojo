#!/usr/bin/env node

/**
 * Generate icon files for Flojo extension
 * Requires: npm install canvas
 */

const fs = require('fs');
const path = require('path');

// Check if canvas is available
let Canvas;
try {
  Canvas = require('canvas');
} catch (e) {
  console.error('canvas module not found.');
  console.error('Install it with: npm install canvas');
  process.exit(1);
}

const { createCanvas } = Canvas;

// Ensure icons directory exists
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes to generate
const sizes = [16, 48, 128];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw "F" for Flojo
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.floor(size * 0.6)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('F', size / 2, size / 2);

  // Draw circle border for size >= 48
  if (size >= 48) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = Math.floor(size / 16);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, (size / 2) - ctx.lineWidth, 0, Math.PI * 2);
    ctx.stroke();
  }

  return canvas.toBuffer('image/png');
}

// Generate icons
sizes.forEach(size => {
  try {
    const buffer = generateIcon(size);
    const filepath = path.join(iconsDir, `icon-${size}.png`);
    fs.writeFileSync(filepath, buffer);
    console.log(`✓ Generated icon-${size}.png`);
  } catch (error) {
    console.error(`✗ Failed to generate icon-${size}.png:`, error.message);
  }
});

console.log('\n✨ Icon generation complete!');
console.log(`Icons saved to: ${iconsDir}`);
