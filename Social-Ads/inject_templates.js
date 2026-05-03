const fs = require('fs');

const templates = JSON.parse(fs.readFileSync('Social-Ads/parsed_templates.json', 'utf8'));

// Build the replacement block
const entries = templates.map(t => {
  return `  {\n    id: ${JSON.stringify(t.id)},\n    label: ${JSON.stringify(t.label)},\n    category: ${JSON.stringify(t.category)},\n    coverImage: ${JSON.stringify(t.coverImage)},\n    bestFor: ${JSON.stringify(t.bestFor)},\n    prompt: ${JSON.stringify(t.prompt)},\n  }`;
});

const newBlock = `/** 60 real templates loaded from Social-Ads/templates.xlsx */
export const SOCIAL_TEMPLATES = [
${entries.join(',\n')},
];`;

// Read the form file
const filePath = 'src/renderer/src/screens/image-gen/modes/SocialAdsForm.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the start and end of the SOCIAL_TEMPLATES block
const startMarker = `/**\n * PLACEHOLDER templates`;
const endMarker = `];\n\n// ─────`;

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker) + 3; // include "];\n"

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find markers. startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

const newContent = content.slice(0, startIdx) + newBlock + '\n\n// ─────' + content.slice(endIdx + '// ─────'.length);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Done. Replaced placeholder block with', templates.length, 'real templates.');
console.log('New file size:', newContent.length, 'bytes');
