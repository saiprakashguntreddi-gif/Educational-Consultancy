import fs from 'fs';
import path from 'path';

const frontendDir = path.resolve(__dirname, '../../../frontend');
const distHtmlPath = path.join(frontendDir, 'dist', 'index.html');

console.log('=== VERIFYING SUPERCONSCIOUSNESS LANDING REDESIGN ===\n');

// 1. Verify Dist HTML
if (!fs.existsSync(distHtmlPath)) {
  console.error('FAIL: dist/index.html not found. Run npm run build first.');
  process.exit(1);
}
const distHtml = fs.readFileSync(distHtmlPath, 'utf8');

// 2. Verify CSS Bundle & Palette
const cssMatch = distHtml.match(/assets\/index-[^.]+\.css/);
if (!cssMatch) {
  console.error('FAIL: CSS bundle not linked in dist/index.html');
  process.exit(1);
}
const cssContent = fs.readFileSync(path.join(frontendDir, 'dist', cssMatch[0]), 'utf8');

const targetPalette = [
  { name: 'Deep navy', hex: '#14213d' },
  { name: 'Royal blue', hex: '#3157d5' },
  { name: 'Teal', hex: '#16a6a1' },
  { name: 'Warm gold', hex: '#f2b84b' },
  { name: 'Pure white', hex: '#ffffff' },
  { name: 'Soft blue bg', hex: '#f3f7ff' },
  { name: 'Light teal bg', hex: '#eaf8f6' },
  { name: 'Dark text', hex: '#202b3c' },
  { name: 'Muted text', hex: '#667085' },
];

console.log('[CHECK 1] Palette in Built CSS:');
let missingColors = 0;
targetPalette.forEach((c) => {
  const found = cssContent.toLowerCase().includes(c.hex.toLowerCase());
  console.log(`  ✓ ${c.name} (${c.hex}): ${found ? 'CONFIRMED' : 'MISSING'}`);
  if (!found) missingColors++;
});

// 3. Verify Public Assets
console.log('\n[CHECK 2] High-Resolution Editorial Assets:');
const requiredAssets = [
  'hero-campus.jpg',
  'dest-usa.jpg',
  'dest-uk.jpg',
  'dest-canada.jpg',
  'dest-australia.jpg',
  'dest-germany.jpg',
];

let missingAssets = 0;
requiredAssets.forEach((asset) => {
  const fullPath = path.join(frontendDir, 'public', 'assets', asset);
  const exists = fs.existsSync(fullPath);
  const sizeKb = exists ? Math.round(fs.statSync(fullPath).size / 1024) : 0;
  console.log(`  ✓ ${asset}: ${exists ? `EXISTS (${sizeKb} KB)` : 'MISSING'}`);
  if (!exists) missingAssets++;
});

// 4. Verify JS Bundle Strings & Headings
console.log('\n[CHECK 3] Key Content & Headlines in JS Bundle:');
const jsMatch = distHtml.match(/assets\/index-[^.]+\.js/);
const jsContent = fs.readFileSync(path.join(frontendDir, 'dist', jsMatch![0]), 'utf8');

const contentChecks = [
  'Your Global Education Journey',
  'Starts Here.',
  'Complete Your Profile',
  'Choose Destinations & Courses',
  'Receive Counsellor Review',
  'Plan Your Next Steps',
  'Explore Key Study Abroad Destinations',
  'Explore High-Demand Academic Specializations',
  'Why Choose Superconsciousness',
  'advising@superconsciousness.edu',
];

let missingText = 0;
contentChecks.forEach((txt) => {
  const found = jsContent.includes(txt);
  console.log(`  ✓ "${txt}": ${found ? 'CONFIRMED' : 'MISSING'}`);
  if (!found) missingText++;
});

if (missingColors === 0 && missingAssets === 0 && missingText === 0) {
  console.log('\n=== ALL LANDING REDESIGN CHECKS PASSED (100%) ===');
} else {
  console.error('\nFAIL: Some checks did not pass.');
  process.exit(1);
}
