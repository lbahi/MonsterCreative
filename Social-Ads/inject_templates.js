const fs = require('fs');

const templates = JSON.parse(fs.readFileSync('Social-Ads/parsed_templates.json', 'utf8'));

// Build the replacement block
const entries = templates.map(t => {
  return `  {\n    id: ${JSON.stringify(t.id)},\n    label: ${JSON.stringify(t.label)},\n    category: ${JSON.stringify(t.category)},\n    coverImage: ${JSON.stringify(t.coverImage)},\n    bestFor: ${JSON.stringify(t.bestFor)},\n    prompt: ${JSON.stringify(t.prompt)},\n  }`;
});

const newBlock = `export const SOCIAL_TEMPLATES = [\n${entries.join(',\n')},\n];`;

// Read the form file
const filePath = 'src/renderer/src/screens/image-gen/modes/SocialAdsForm.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the start: "export const SOCIAL_TEMPLATES = ["
const startMarker = 'export const SOCIAL_TEMPLATES = [';
const startIdx = content.indexOf(startMarker);

// Find the end: the closing "];" followed by the TYPES section
// Search for "];\n" that comes before "// TYPES" or "type Template"
const typesIdx = content.indexOf('type Template');
// Go backward from typesIdx to find the "];" that closes the array
const closingIdx = content.lastIndexOf('];', typesIdx);

if (startIdx === -1 || closingIdx === -1) {
  console.error('Could not find markers. startIdx:', startIdx, 'closingIdx:', closingIdx);
  process.exit(1);
}

const endIdx = closingIdx + 2; // include "];"

const newContent = content.slice(0, startIdx) + newBlock + content.slice(endIdx);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Done. Replaced template block with', templates.length, 'real templates.');
console.log('New file size:', newContent.length, 'bytes');
