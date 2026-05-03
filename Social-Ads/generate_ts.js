const fs = require('fs');
const data = JSON.parse(fs.readFileSync('Social-Ads/parsed_templates.json', 'utf8'));

const lines = data.map(t => {
  return `  {\n    id: ${JSON.stringify(t.id)},\n    label: ${JSON.stringify(t.label)},\n    category: ${JSON.stringify(t.category)},\n    coverImage: ${JSON.stringify(t.coverImage)},\n    bestFor: ${JSON.stringify(t.bestFor)},\n    prompt: ${JSON.stringify(t.prompt)},\n  }`;
});

const block = `export const SOCIAL_TEMPLATES = [\n${lines.join(',\n')},\n];`;

fs.writeFileSync('Social-Ads/SOCIAL_TEMPLATES_block.txt', block);
console.log('Written', data.length, 'templates. Block length:', block.length, 'chars');
