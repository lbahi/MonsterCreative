const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('Social-Ads/templates.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

function inferCategory(bestFor) {
  if (!bestFor) return 'General';
  const bf = bestFor.toLowerCase();
  if (bf.includes('luxury') || bf.includes('premium')) return 'Luxury';
  if (bf.includes('outdoor') || bf.includes('adventure')) return 'Lifestyle';
  if (bf.includes('home') || bf.includes('interior') || bf.includes('decor')) return 'Home';
  if (bf.includes('fashion') || bf.includes('apparel')) return 'Fashion';
  if (bf.includes('food') || bf.includes('beverage') || bf.includes('fmcg')) return 'FMCG';
  if (bf.includes('beauty') || bf.includes('skincare')) return 'Beauty';
  if (bf.includes('cgi') || bf.includes('giant') || bf.includes('surreal')) return 'CGI';
  if (bf.includes('seasonal') || bf.includes('festive') || bf.includes('festival')) return 'Seasonal';
  return 'General';
}

function inferLabel(id, notes) {
  if (!notes) return 'Template ' + id;
  const part = notes.split(';')[0].trim();
  // Capitalize first letter
  return part.length > 2 ? part.charAt(0).toUpperCase() + part.slice(1) : 'Template ' + id;
}

const placeholderImages = [
  'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=80',
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80',
  'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80',
  'https://images.unsplash.com/photo-1542466500-dccb2789cbbb?w=400&q=80',
];

const entries = data.map((row, i) => {
  const id = String(row['ID']);
  const prompt = String(row['Prompt'] || '');
  const bestFor = String(row['Best For (Product Category)'] || '');
  const notes = String(row['Notes / Variables'] || '');
  const category = inferCategory(bestFor);
  const label = inferLabel(id, notes);
  const cover = placeholderImages[i % placeholderImages.length];

  return {
    id: 't' + id,
    label,
    category,
    coverImage: cover,
    bestFor,
    prompt,
  };
});

const output = JSON.stringify(entries, null, 2);
fs.writeFileSync('Social-Ads/parsed_templates.json', output);
console.log('Wrote', entries.length, 'templates to Social-Ads/parsed_templates.json');
entries.slice(0, 3).forEach(e => console.log(e.id, '|', e.label, '|', e.category));
