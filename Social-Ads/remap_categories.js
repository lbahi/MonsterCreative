const fs = require('fs');

const templates = JSON.parse(fs.readFileSync('Social-Ads/parsed_templates.json', 'utf8'));

// Map bestFor → a short, specific use-case category
function mapCategory(bestFor) {
  if (!bestFor) return 'General';
  const b = bestFor.toLowerCase();

  // Specific product types first
  if (b.includes('facewash') || b.includes('cleanser')) return 'Skincare';
  if (b.includes('serum') || b.includes('dropper')) return 'Serums & Oils';
  if (b.includes('hair oil') || b.includes('haircare')) return 'Haircare';
  if (b.includes('skincare') && b.includes('spa')) return 'Spa & Wellness';
  if (b.includes('skincare') && b.includes('cosmetics')) return 'Beauty';
  if (b.includes('skincare') && b.includes('beauty')) return 'Beauty';
  if (b.includes('skincare') && b.includes('nail')) return 'Beauty';
  if (b.includes('skincare') && !b.includes('fashion')) return 'Skincare';
  if (b.includes('perfume') || b.includes('fragrance')) return 'Fragrance';
  if (b.includes('jewelry') || b.includes('watches')) return 'Jewelry';
  if (b.includes('pendant') || b.includes('lighting') || b.includes('décor') || b.includes('decor')) return 'Home & Décor';
  if (b.includes('furniture') || b.includes('interior')) return 'Furniture';
  if (b.includes('textile') || b.includes('scarf') || b.includes('fabric')) return 'Textiles';
  if (b.includes('fashion') && b.includes('luxury')) return 'Luxury Fashion';
  if (b.includes('fashion') && b.includes('footwear')) return 'Fashion';
  if (b.includes('fashion') && b.includes('winter')) return 'Winter Fashion';
  if (b.includes('fashion')) return 'Fashion';
  if (b.includes('footwear') || b.includes('shoes')) return 'Footwear';
  if (b.includes('suncare') || b.includes('outdoor') && b.includes('sun')) return 'Suncare';
  if (b.includes('outdoor') || b.includes('adventure') || b.includes('sportswear')) return 'Outdoor & Sports';
  if (b.includes('supplement') || b.includes('protein') || b.includes('fitness')) return 'Fitness & Supplements';
  if (b.includes('fast food') || b.includes('qsr') || b.includes('chicken')) return 'Fast Food';
  if (b.includes('sauce') || b.includes('condiment') || b.includes('spread') || b.includes('jam')) return 'Food & Condiments';
  if (b.includes('food') && b.includes('beverage')) return 'Food & Beverage';
  if (b.includes('food')) return 'Food & Beverage';
  if (b.includes('beverage')) return 'Beverage';
  if (b.includes('baby')) return 'Baby Products';
  if (b.includes('tech') && b.includes('saas')) return 'Tech & SaaS';
  if (b.includes('tech') || b.includes('electronic') || b.includes('gadget')) return 'Tech & Gadgets';
  if (b.includes('gaming')) return 'Gaming';
  if (b.includes('art') || b.includes('print') || b.includes('wallpaper')) return 'Art & Print';
  if (b.includes('design') || b.includes('poster') || b.includes('event')) return 'Design & Events';
  if (b.includes('cgi') || b.includes('giant') || b.includes('brand awareness')) return 'CGI & Brand';
  if (b.includes('festival') || b.includes('festive') || b.includes('cultural')) return 'Festive';
  if (b.includes('retail') || b.includes('urban') || b.includes('street')) return 'Urban & Retail';
  if (b.includes('launch') || b.includes('bold')) return 'Launch & Bold';
  if (b.includes('e-commerce') || b.includes('catalog') || b.includes('amazon')) return 'E-Commerce';
  if (b.includes('packaging') || b.includes('candle')) return 'Packaging';
  if (b.includes('luxury')) return 'Luxury';
  if (b.includes('any product') || b.includes('any brand')) return 'Universal';
  return 'General';
}

// Apply new categories
templates.forEach(t => {
  t.category = mapCategory(t.bestFor);
});

// Write updated JSON
fs.writeFileSync('Social-Ads/parsed_templates.json', JSON.stringify(templates, null, 2));

// Print category distribution
const dist = {};
templates.forEach(t => { dist[t.category] = (dist[t.category] || 0) + 1; });
Object.entries(dist).sort((a,b) => b[1] - a[1]).forEach(([cat, n]) => console.log(`  ${cat}: ${n}`));
console.log('\nTotal:', templates.length, 'templates');
