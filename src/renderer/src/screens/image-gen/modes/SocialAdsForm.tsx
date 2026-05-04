import { useState, useRef, useEffect } from 'react';
import { Loader2, Sparkles, Upload, X, FolderOpen, Download, CheckCircle2, Zap, Tag } from 'lucide-react';
import { resolveImageInput } from '../utils/resolveImageInput';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** All models available on the Generate tab — reused here */
export const SOCIAL_MODELS = [
  { id: 'Nano Banana', label: 'Nano Banana', desc: 'Fast & affordable', endpoint: 'fal-ai/ideogram/v3/edit' },
  { id: 'Nano Banana 2', label: 'Nano Banana 2', desc: 'Smart multi-image edit', endpoint: 'fal-ai/ideogram/v3/edit' },
  { id: 'Nano Banana Pro', label: 'Nano Banana Pro', desc: 'High-fidelity precision', endpoint: 'fal-ai/ideogram/v3/edit' },
  { id: 'GPT Image 2', label: 'GPT Image 2', desc: 'OpenAI quality', endpoint: 'fal-ai/ideogram/v3/edit' },
];

/** Social media aspect ratios — value injected into the prompt */
export const SOCIAL_RATIOS = [
  { id: '1:1', label: '1 : 1', desc: 'Instagram Post', icon: '▪' },
  { id: '4:5', label: '4 : 5', desc: 'Meta Feed', icon: '▪' },
  { id: '9:16', label: '9 : 16', desc: 'Stories / TikTok', icon: '▪' },
  { id: '16:9', label: '16 : 9', desc: 'YouTube / Banner', icon: '▪' },
];

/** Output resolution options — same as Nano Banana Generate tab */
export const SOCIAL_RESOLUTIONS = [
  { id: '0.5K', label: '0.5K', desc: 'Draft' },
  { id: '1K', label: '1K', desc: 'Standard' },
  { id: '2K', label: '2K', desc: 'High' },
  { id: '4K', label: '4K', desc: 'Ultra' },
];

/** Language options for ad text */
export const SOCIAL_LANGUAGES = [
  { id: 'english', label: 'English', flag: '🇬🇧', desc: 'English text' },
  { id: 'arabic', label: 'العربية', flag: '🇸🇦', desc: 'Arabic text' },
  { id: 'french', label: 'Français', flag: '🇫🇷', desc: 'French text' },
];

/** 60 real templates loaded from Social-Ads/templates.xlsx */
export const SOCIAL_TEMPLATES = [
  {
    id: "t1",
    label: "Upload product image as reference",
    category: "Outdoor & Sports",
    coverImage: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80",
    bestFor: "Food & Health Supplements, Outdoor Gear, Sportswear",
    prompt: "Create an outdoor lifestyle product photography shot with a bright, fresh, adventurous feel. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on The Provided Product, softly blurred background.",
  },
  {
    id: "t2",
    label: "Upload interior product image",
    category: "Home & Décor",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80",
    bestFor: "Home Décor, Lighting, Interior Design",
    prompt: "Use the uploaded product image as the exact hero product. Preserve its original texture and shape, warm beige mineral finish. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on the pendant face, softly blurred background.",
  },
  {
    id: "t3",
    label: "Upload product image as reference",
    category: "Home & Décor",
    coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80",
    bestFor: "Home Décor, Lighting, Luxury Interiors",
    prompt: "Use the uploaded product image as the exact hero product. Create a luxurious classic European interior with ornate ceiling moldings, cream wall paneling, rich walnut cabinetry. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on the pendant face, softly blurred background.",
  },
  {
    id: "t4",
    label: "Replace [your chair] with product",
    category: "Furniture",
    coverImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
    bestFor: "Furniture, Home Goods, Fashion Accessories, Skincare",
    prompt: "A premium minimalist studio product photograph featuring The Provided Product as the hero subject, placed slightly left of center in a seamless burnt-orange matte studio environment with matching floor and backdrop. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on The Provided Product, softly blurred background.",
  },
  {
    id: "t5",
    label: "Upload fabric/textile product image",
    category: "Textiles",
    coverImage: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=80",
    bestFor: "Textiles, Scarves, Luxury Fashion, Heritage Brands",
    prompt: "Luxury heritage textile campaign scene featuring the uploaded image as the hero product, elegantly draped from an open vintage wooden treasure chest placed at the center of the composition. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on The Provided Product, softly blurred background.",
  },
  {
    id: "t6",
    label: "Upload product image",
    category: "Skincare",
    coverImage: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80",
    bestFor: "Organic Skincare, Agricultural Products, Outdoor Brands, Food",
    prompt: "Ultra-realistic commercial product photography of the uploaded product placed on slightly elevated loose soil in an open natural environment, with a wide clean sky occupying most of the background. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on The Provided Product, softly blurred background.",
  },
  {
    id: "t7",
    label: "Upload bottle product",
    category: "Beauty",
    coverImage: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80",
    bestFor: "Skincare, Cosmetics, Beauty Brands",
    prompt: "Ultra-premium minimalist skincare product photography, three replaceable cosmetic bottles arranged in a surreal stacked balancing composition against a clean matte green. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on The Provided Product, softly blurred background.",
  },
  {
    id: "t8",
    label: "Upload dropper bottle",
    category: "Serums & Oils",
    coverImage: "https://images.unsplash.com/photo-1542466500-dccb2789cbbb?w=400&q=80",
    bestFor: "Skincare Serums, Dropper Bottles, Beauty Oils",
    prompt: "Ultra-premium skincare campaign photography, a replaceable amber glass dropper bottle held delicately between elegant feminine fingers, close-up beauty composition against a soft warm neutral studio background. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on The Provided Product, softly blurred background.",
  },
  {
    id: "t9",
    label: "Upload product",
    category: "Beauty",
    coverImage: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80",
    bestFor: "Skincare, Beauty, Luxury Cosmetics",
    prompt: "Ultra-premium skincare beauty campaign, close-up editorial portrait of a glowing female model resting her face sideways on a reflective glossy surface, one hand softly reaching toward the camera. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on The Provided Product, softly blurred background.",
  },
  {
    id: "t10",
    label: "Upload sauce bottle",
    category: "Food & Condiments",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80",
    bestFor: "Food Sauces, Condiments, Street Food Brands",
    prompt: "Create a bold, colorful social media poster in a playful Vietnamese street-food inspired brand style, 3:4 vertical ratio. Use a vibrant hot pink background with subtle crumpled paper texture. Place one sauce bottle in the center as the hero product, upright, front-facing, sharp and realistic. Around the bottle, add oversized flat graphic arrows, sticker-style food icons, hand-drawn noodle swirls, lime wedges, coriander leaves, red chili slices, and small sauce splashes. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t11",
    label: "Upload food product",
    category: "Fast Food",
    coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80",
    bestFor: "Fast Food, QSR Brands, Chicken / Fried Food",
    prompt: "Create a vibrant 3:4 social media advertisement poster in a bold modern fast-food campaign style. Use a split complementary color palette of bright tangerine orange and fresh aqua blue. The scene should feel playful, premium, and highly commercial. Place the main food product in the center as the hero object: a branded takeaway bucket filled with crispy grilled chicken pieces, golden fried snacks, or any replaceable food item. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t14",
    label: "Upload jars & dropper",
    category: "Beauty",
    coverImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
    bestFor: "Skincare, Luxury Cosmetics, Face Creams",
    prompt: "High-end product photography of two white face cream jars and one dropper bottle made of clear glass containing a transparent liquid. The products are arranged in a balanced composition against a surreal background made of curved walls, archways, and steps in matte lavender and pink colors. An elegant young woman with a long flowing dress walks on one of the upper archways in the background. The lighting is soft and diffused. Shot on Sony A1, 24mm lens. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on The Provided Product, softly blurred background.",
  },
  {
    id: "t15",
    label: "Upload product",
    category: "Skincare",
    coverImage: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=80",
    bestFor: "Perfume, Luxury Skincare, Jewelry, Premium Bottles",
    prompt: "Place the uploaded product floating slightly above flowing deep red satin fabric. The product should be angled slightly, as if gracefully suspended in motion, with premium glass reflections and dramatic highlights. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on The Provided Product, softly blurred background.",
  },
  {
    id: "t16",
    label: "Replace [BRAND NAME] and [PRODUCT]",
    category: "Universal",
    coverImage: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80",
    bestFor: "Any Brand / Product Category",
    prompt: "Create a bold, premium, high-conversion social media advertisement poster for [BRAND NAME], featuring [PRODUCT / SERVICE / OFFER] as the hero. Use a dramatic, modern commercial design style with a strong visual hierarchy, eye-catching typography, and a polished advertising look. The layout should be in 3:4 aspect ratio with clear negative space from the top, bottom, left, and right, so the design feels premium, balanced, and not overcrowded. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t17",
    label: "Replace brand name & colors",
    category: "Fast Food",
    coverImage: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80",
    bestFor: "Fast Food, Food & Beverage Brands, QSR",
    prompt: "Create a bold, high-energy promotional social media poster for [BRAND NAME], inspired by loud modern fast-food advertising. Use the brand's official color palette as the main visual system: Primary color: [BRAND PRIMARY COLOR], Secondary color: [BRAND SECONDARY COLOR], Accent color: [BRAND ACCENT COLOR]. Design style: A vibrant, energetic food campaign poster with a rich gradient background, darker abstract flame/swoosh shapes, subtle halftone. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t18",
    label: "Upload jar/condiment",
    category: "Food & Condiments",
    coverImage: "https://images.unsplash.com/photo-1542466500-dccb2789cbbb?w=400&q=80",
    bestFor: "Condiments, Jams, Sauces, Food Jars",
    prompt: "Ultra-realistic premium condiment product photography, three identical jars of the uploaded product stacked in a dramatic vertical balancing composition, one jar resting on top of the other two. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on The Provided Product, softly blurred background.",
  },
  {
    id: "t19",
    label: "Upload open jar",
    category: "Food & Condiments",
    coverImage: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80",
    bestFor: "Condiments, Spreads, Food Jars, Honey",
    prompt: "Ultra-realistic premium food condiment product photography, close-up editorial kitchen scene, an open glass jar of the uploaded product placed at the center foreground. The image provided should be analyzed and used as a reference image. 85mm portrait lens look, shallow depth of field (f/2.8), sharp focus on The Provided Product, softly blurred background.",
  },
  {
    id: "t20",
    label: "Upload product",
    category: "Spa & Wellness",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80",
    bestFor: "Skincare, Spa Products, Natural Beauty, Essential Oils",
    prompt: "The water forms a natural stream running diagonally through the frame, with subtle wave patterns and light reflections. Small floating white chamomile/daisy flowers are scattered naturally across the water to create a calm botanical spa aesthetic. Top-down product photography, luxury cosmetic campaign look. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t21",
    label: "Upload product",
    category: "Beauty",
    coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80",
    bestFor: "Skincare, Perfume, Baby Products, Luxury Cosmetics",
    prompt: "Ultra-premium pastel product photography with the uploaded image as the hero product, placed upright at the center on softly draped baby-blue flowing fabric forming elegant natural folds like a dreamy pedestal. 85mm lens look, shallow depth of field, sharp focus on product, softly blurred foreground and background floral elements. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t22",
    label: "Upload facewash tube",
    category: "Skincare",
    coverImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
    bestFor: "Facewash, Skincare, Cleansers",
    prompt: "A high-end skincare lifestyle shot featuring a single facewash tube (matching the product exactly in shape, design, and color) being held naturally in one hand. The hand is slightly wet, with visible water droplets and a soft, healthy glow on the skin, creating a fresh, just-washed feel. Rich, airy cleansing foam is spread across the hand and partially covering the tube. A few water droplets are seen dripping from the hand, adding movement and realism. The background is a soft light pink solid tone. Aspect ratio 4:5 (1080x1350), ultra-realistic, macro detail, commercial skincare photography with shallow depth of field and high texture clarity. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t23",
    label: "Upload facewash tube",
    category: "Skincare",
    coverImage: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=80",
    bestFor: "Facewash, Skincare, K-Beauty Brands",
    prompt: "A high-end skincare beauty shot featuring a female model holding a facewash tube (matching the product exactly in shape, design, and color) close to her face in a confident, editorial pose. The model has smooth, radiant skin with a luminous dewy glow, minimal makeup. The background is a soft light pink solid tone. Soft, diffused, slightly directional lighting. Close-up portrait shot, shallow depth of field. Overall mood is fresh, radiant, and minimal luxury with a Korean skincare aesthetic. 4:5 aspect ratio (1080x1350), ultra-realistic. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t24",
    label: "Upload supplement tub",
    category: "Fitness & Supplements",
    coverImage: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80",
    bestFor: "Fitness Supplements, Protein, Sports Nutrition",
    prompt: "A highly realistic fitness advertisement photo of an athletic woman with a toned physique, wearing a pink sports bra and cyan/turquoise running shoes, sitting confidently on a dark gym floor. A large tub of Whey Protein supplement is placed in front of her. A black kettlebell is visible to her left. Bold typography overlaid reads 'TRAIN HARD RECOVER STRONGER' in white and fiery orange/red gradient letters. Dark, dramatic, high-contrast lighting with a cinematic feel. Photorealistic, professional sports photography style. AR 4:5. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t25",
    label: "Upload supplement tub",
    category: "Fitness & Supplements",
    coverImage: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80",
    bestFor: "Fitness Supplements, Protein, Shakers, Sports Nutrition",
    prompt: "A hyper-realistic fitness supplement product photography shot featuring an athletic woman with dark hair tied in a ponytail, wearing a black sports bra, standing in a modern gym near cable machine/TRX straps. She is captured in a candid mid-action pose — tilting her head back drinking from a dark black shaker bottle, while her left arm is extended toward the camera in the foreground holding a black supplement tub labeled 'Whey Protein'. The product tub is sharp and in focus close to the camera lens. Shot with a wide-aperture lens (f/1.8 style bokeh). Professional lifestyle product photography, photorealistic, 8K resolution. --ar 4:5. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t26",
    label: "Upload pump bottle",
    category: "Haircare",
    coverImage: "https://images.unsplash.com/photo-1542466500-dccb2789cbbb?w=400&q=80",
    bestFor: "Organic Skincare, Natural Beauty, Botanical Haircare",
    prompt: "Hyper-realistic luxury botanical skincare product advertisement featuring a premium matte cream cosmetic pump bottle with a wooden textured collar and minimalist elegant branding. The bottle is placed on stacked natural stone slabs, surrounded by lush green moss, delicate white wildflowers, small twigs, and organic forest elements. Background features a deep emerald green forest-inspired backdrop with hanging moss. Dramatic studio lighting from top and sides. Shallow depth of field, ultra-detailed textures, photorealistic rendering, cinematic composition. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t27",
    label: "Upload golden dropper bottle",
    category: "Haircare",
    coverImage: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80",
    bestFor: "Hair Oil, Organic Haircare, Beauty Oils",
    prompt: "Hyper-realistic luxury organic hair oil product advertisement featuring a premium golden glass dropper bottle placed in the center foreground on a glossy reflective surface. Behind the bottle, flowing silky smooth brown hair strands create a dynamic wave background. Surrounding the product are natural organic ingredients including fresh coconut halves, black seeds, wheat grains, aloe vera slices, and herbal botanical elements. Floating golden oil droplets suspended in air around the bottle. Warm golden studio lighting. Professional commercial product photography, ultra-detailed, photorealistic rendering. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t28",
    label: "Upload any product",
    category: "CGI & Brand",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80",
    bestFor: "Any Product, Brand Awareness Campaigns, FMCG",
    prompt: "Create a hyper-realistic CGI advertisement where the uploaded product is scaled up to a massive size, placed right in the middle of a bustling modern city street. The product should appear like a towering monument, blending seamlessly with skyscrapers, traffic, and pedestrians. Add realistic lighting, reflections, and shadows matching the urban environment. Crowds of people should be walking nearby, looking small in comparison, emphasizing the gigantic scale of the product. Camera angle wide, making the product look awe-inspiring. Ultra-detailed, photorealistic, 9:16 ratio. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t30",
    label: "Bauhaus style",
    category: "Tech & Gadgets",
    coverImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
    bestFor: "Design Brands, Tech Products, Posters, Event Marketing",
    prompt: "Abstract geometric composition — overlapping translucent shapes: circles, triangles, and lines — in a palette of coral, mint, gold, and white. Clean modern aesthetic, Bauhaus-inspired, poster quality. The image provided should be analyzed and used as a reference image to inform the visual style and environment of the composition.",
  },
  {
    id: "t31",
    label: "Upload brand mark or product",
    category: "Tech & SaaS",
    coverImage: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=80",
    bestFor: "Tech Brands, SaaS, Digital Products, Creative Agencies",
    prompt: "Generative art — thousands of tiny particles flowing in a magnetic field pattern, creating organic curves and density variations. Monochrome white on black, data-visualization aesthetic, minimal and hypnotic. The image provided should be analyzed and used as a reference image to shape the flow direction, density, and overall atmosphere.",
  },
  {
    id: "t32",
    label: "Bold primary colors",
    category: "Fashion",
    coverImage: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80",
    bestFor: "Art Brands, Fashion Labels, Cultural Events, Premium Packaging",
    prompt: "Abstract expressionist painting — large gestural brushstrokes in bold primary colors: red, yellow, and blue — on raw white canvas. Visible paint texture and drips, energetic and spontaneous, de Kooning-inspired, museum quality. The image provided should be analyzed and used as a reference image to guide the emotional tone and compositional energy.",
  },
  {
    id: "t33",
    label: "Purple → pink → peach gradient",
    category: "General",
    coverImage: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80",
    bestFor: "Beauty Brands, SaaS, App Landing Pages, Digital Products",
    prompt: "Smooth gradient background — flowing transition from deep purple to soft pink to warm peach. Subtle aurora-like luminous waves, minimal and clean, suitable for a modern website hero background, ultra-smooth rendering. The image provided should be analyzed and used as a reference image to align the gradient direction and mood with the product or brand.",
  },
  {
    id: "t34",
    label: "Earthy terracotta/sand/rust texture",
    category: "Skincare",
    coverImage: "https://images.unsplash.com/photo-1542466500-dccb2789cbbb?w=400&q=80",
    bestFor: "Natural Skincare, Wellness, Artisan Food, Premium Apps",
    prompt: "Abstract noise texture background — soft organic grain pattern in warm earth tones: terracotta, sand, and rust. Subtle gradients, muted and calming, suitable as a premium app or packaging background, high resolution. The image provided should be analyzed and used as a reference image to align tone and texture with the product aesthetic.",
  },
  {
    id: "t35",
    label: "Purple/blue cosmic scene",
    category: "Fragrance",
    coverImage: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80",
    bestFor: "Gaming, Tech, Fragrance, Luxury Brands, Creative Agencies",
    prompt: "Abstract cosmic nebula — vivid clouds of purple and blue gas illuminated from within by newborn stars, with tiny scattered star points. Space photography aesthetic but painterly, desktop wallpaper format 16:9. The image provided should be analyzed and used as a reference image to connect the nebula's color atmosphere with the product's visual identity.",
  },
  {
    id: "t36",
    label: "Upload product",
    category: "Urban & Retail",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80",
    bestFor: "E-commerce, Amazon Listings, Retail, Any Product Category",
    prompt: "Place The Provided Product centered on a pure white background. Preserve the exact shape, proportions, branding, label text, and material finish. Apply soft studio lighting with a realistic shadow directly under the product. E-commerce packshot style, no props, no extra objects. The image provided should be analyzed and used as a reference image to faithfully reproduce the product's design.",
  },
  {
    id: "t37",
    label: "Upload product",
    category: "Tech & Gadgets",
    coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80",
    bestFor: "E-commerce, Tech Accessories, Cosmetics, Consumer Electronics",
    prompt: "Place The Provided Product in a clean studio setup with a light gray seamless background. Soft diffused lighting, subtle natural shadow, product fully visible, sharp edges, realistic reflections if the material is glossy. Premium e-commerce photography. The image provided should be analyzed and used as a reference image to accurately reproduce the product.",
  },
  {
    id: "t38",
    label: "Upload product",
    category: "E-Commerce",
    coverImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
    bestFor: "E-commerce, App Store Screenshots, Social Media Ads, Any Product",
    prompt: "Turn The Provided Product into a floating studio product image on a clean neutral background. Preserve exact product geometry, add a soft shadow below to ground it, keep all visible details realistic and accurate. The image provided should be analyzed and used as a reference image to replicate the product precisely.",
  },
  {
    id: "t39",
    label: "Upload product",
    category: "Fashion",
    coverImage: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=80",
    bestFor: "Food, Skincare, Fashion Accessories, Stationery, Lifestyle Products",
    prompt: "Create a top-down flat lay of The Provided Product on a clean studio surface. Balanced composition, soft even lighting, realistic material texture, minimal shadow, commercial product photography style. The image provided should be analyzed and used as a reference image to replicate the product accurately.",
  },
  {
    id: "t40",
    label: "Upload product",
    category: "Universal",
    coverImage: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80",
    bestFor: "Any Product Category, Lifestyle Brands, FMCG",
    prompt: "Place The Provided Product in its natural real-life environment, styled realistically. Preserve the exact product design, branding, and proportions. Use believable lighting and shadows to make the scene look like authentic commercial photography. The image provided should be analyzed and used as a reference image to match the product faithfully.",
  },
  {
    id: "t41",
    label: "Upload product",
    category: "Skincare",
    coverImage: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80",
    bestFor: "Home Décor, Furniture, Skincare, Tech Accessories",
    prompt: "Place The Provided Product in a modern minimal interior. Clean composition, neutral styling, realistic daylight, product remains the hero, no clutter, editorial e-commerce photography. The image provided should be analyzed and used as a reference image to preserve product design and inform the interior aesthetic.",
  },
  {
    id: "t42",
    label: "Upload product",
    category: "Outdoor & Sports",
    coverImage: "https://images.unsplash.com/photo-1542466500-dccb2789cbbb?w=400&q=80",
    bestFor: "Outdoor Gear, Sports, Food & Beverage, Health Supplements",
    prompt: "Place The Provided Product in an outdoor setting that matches its intended use. Natural light, realistic environment, accurate product texture and color, product clearly visible. Premium lifestyle product photography. The image provided should be analyzed and used as a reference image to match the product and guide the outdoor scene.",
  },
  {
    id: "t43",
    label: "Upload product",
    category: "Skincare",
    coverImage: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80",
    bestFor: "Tech, Skincare, Food, Beverage, Mobile Apps, Small Consumer Products",
    prompt: "Show The Provided Product being interacted with by hands only — no full person visible. Realistic hand-product interaction, clean or contextual background, sharp focus on the product. Modern commercial photography. The image provided should be analyzed and used as a reference image to preserve exact product design.",
  },
  {
    id: "t44",
    label: "Upload product",
    category: "Skincare",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80",
    bestFor: "Tech Accessories, Stationery, Coffee, Skincare, Books",
    prompt: "Place The Provided Product in a realistic desk setup with complementary objects. Clean arrangement, soft window light, product as the clear focal point. Modern commercial photography. The image provided should be analyzed and used as a reference image to accurately reproduce the product.",
  },
  {
    id: "t45",
    label: "Upload product",
    category: "Fashion",
    coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80",
    bestFor: "E-commerce Catalogs, Fashion, Skincare, Electronics, Footwear",
    prompt: "Create a clean product composition showing The Provided Product from front, side, and slightly angled views in one frame. Consistent studio lighting, neutral background, preserve exact color and shape. Catalog-ready photography. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t46",
    label: "Upload product with packaging",
    category: "Food & Beverage",
    coverImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
    bestFor: "Packaging, Cosmetics, Food, Luxury Boxes, Candles",
    prompt: "Show The Provided Product in both closed and open state in one clean composition. Preserve exact design, color, and proportions. Soft studio lighting, neutral background, e-commerce detail photography. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t47",
    label: "Upload product",
    category: "Jewelry",
    coverImage: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=80",
    bestFor: "Luxury Fashion, Leather Goods, Jewelry, Premium Skincare, Watches",
    prompt: "Create a close-up detail image of The Provided Product focused on its material texture, stitching, surface finish, or key feature. Soft directional lighting, shallow depth of field, premium quality feel. The image provided should be analyzed and used as a reference image to identify the key detail area.",
  },
  {
    id: "t48",
    label: "Upload product",
    category: "Skincare",
    coverImage: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80",
    bestFor: "Skincare, Supplements, Mobile Accessories, Food & Beverage, Small Gadgets",
    prompt: "Show The Provided Product being held naturally in one hand to communicate scale. Realistic proportions, clean background, clear focus on the product, no distortion. E-commerce lifestyle photography. The image provided should be analyzed and used as a reference image to preserve exact product dimensions and design.",
  },
  {
    id: "t49",
    label: "Upload product",
    category: "Fashion",
    coverImage: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80",
    bestFor: "Skincare, Fashion, Fitness, Food & Beverage, Tech Wearables",
    prompt: "Show a model naturally using The Provided Product in a realistic setting. Keep the product clearly visible and in focus. Authentic lighting, modern lifestyle product photography. The image provided should be analyzed and used as a reference image to preserve exact product design and inform the scene.",
  },
  {
    id: "t50",
    label: "Upload product",
    category: "Beauty",
    coverImage: "https://images.unsplash.com/photo-1542466500-dccb2789cbbb?w=400&q=80",
    bestFor: "Skincare, Nail Care, Jewelry, Luxury Beauty, Cosmetics",
    prompt: "Show elegant hands interacting with The Provided Product. No face visible, clean composition, soft studio lighting, sharp product focus. Premium beauty and skincare photography style. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t51",
    label: "Upload product",
    category: "Beauty",
    coverImage: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80",
    bestFor: "Beauty, Skincare, Food & Beverage, Fashion, Any Seasonal Campaign",
    prompt: "Place The Provided Product in a fresh spring-themed scene. Light, airy styling, soft natural light, clean composition, subtle seasonal details such as blossoms or pastel tones. Preserve the exact product shape, branding, and details. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t52",
    label: "Upload product",
    category: "Fashion",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80",
    bestFor: "Beverages, Suncare, Fashion, Outdoor Products, FMCG",
    prompt: "Place The Provided Product in a bright summer setting. Warm natural light, fresh energetic atmosphere, clean composition, product clearly visible. Premium seasonal lifestyle photography. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t53",
    label: "Upload product",
    category: "Luxury Fashion",
    coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80",
    bestFor: "Skincare, Hot Beverages, Luxury Gifts, Winter Fashion",
    prompt: "Place The Provided Product in a crisp snowy winter setting. Bright, cold winter light, clean composition, subtle frost or snow atmosphere, preserve the exact product shape, branding, and details. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t54",
    label: "Upload product",
    category: "Urban & Retail",
    coverImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
    bestFor: "Any Product Category, Retail Promotions, E-commerce Sales",
    prompt: "Place The Provided Product in a bold Black Friday themed campaign scene. Strong commercial composition, high-contrast dramatic lighting, modern promotional feel with dark tones and power colors. Preserve the exact product shape, branding, and details. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t55",
    label: "Upload product",
    category: "Jewelry",
    coverImage: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=80",
    bestFor: "Luxury Gifts, Beauty, Food & Beverage, Jewelry, Any Gifting Product",
    prompt: "Place The Provided Product in a festive gifting season scene. Elegant celebratory styling with warm golden tones, subtle holiday elements, clean composition, realistic lighting. Premium seasonal atmosphere. Preserve the exact product shape, branding, and details. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t56",
    label: "Upload product",
    category: "CGI & Brand",
    coverImage: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80",
    bestFor: "Brand Awareness, FMCG, Any Product, Large-Scale Campaigns",
    prompt: "Create a hyper-realistic CGI advertisement where The Provided Product is scaled up to a massive size, placed in the middle of a bustling modern city street. It should appear like a towering monument, blending seamlessly with skyscrapers, traffic, and pedestrians. Add realistic lighting, reflections, and shadows matching the urban environment. Crowds of people nearby should look small in comparison, emphasizing the gigantic scale. Wide camera angle, awe-inspiring composition, ultra-detailed, photorealistic, 9:16 ratio. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t57",
    label: "Upload product",
    category: "Outdoor & Sports",
    coverImage: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80",
    bestFor: "Brand Awareness, Adventure / Outdoor Brands, Premium Campaigns",
    prompt: "Generate a cinematic CGI ad where The Provided Product is shown at an enormous scale against a dramatic natural or landmark backdrop — towering beside snowy mountains, adjacent to a famous monument, or emerging from a vast desert landscape. Seamlessly integrated with proper textures, shadows, and atmospheric perspective such as mist, sunlight, and clouds. People, vehicles, or animals appear tiny nearby. Wide-angle composition, dramatic natural lighting, ultra-photorealistic, 9:16 ratio. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t58",
    label: "Upload product",
    category: "Urban & Retail",
    coverImage: "https://images.unsplash.com/photo-1542466500-dccb2789cbbb?w=400&q=80",
    bestFor: "Retail Brands, FMCG, Urban Campaigns, Any Product",
    prompt: "Design a hyper-realistic CGI advertisement where The Provided Product appears at gigantic scale in a casual urban setting — spanning multiple traffic lanes, dominating a shopping district, or covering the rooftop of a moving car. Scale contrast is striking: cars, buses, and bicycles look tiny. Add environmental interaction: cast shadows, window reflections, and pedestrians reacting in awe. Cinematic composition, seamless realism, 9:16 ratio. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t59",
    label: "Upload product",
    category: "Food & Beverage",
    coverImage: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80",
    bestFor: "Festive Campaigns, FMCG, Food & Beverage, Cultural Brand Activations",
    prompt: "Create a hyper-realistic CGI advertisement where The Provided Product is scaled to gigantic proportions and placed in the middle of a vibrant festival scene — colorful decorations, glowing lights, flower garlands, festive crowds. Fireworks or colored powders in the air enhance the surreal celebratory vibe. People celebrating appear tiny beside it. Ultra-detailed, photorealistic, 9:16 ratio. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t60",
    label: "Upload product",
    category: "Festive",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80",
    bestFor: "Urban Brands, FMCG, Cultural Campaigns, Street Marketing",
    prompt: "Design a cinematic CGI ad where The Provided Product is scaled to massive proportions and placed across multiple rooftops in a dense urban neighborhood. It dominates the skyline, stretching above satellite dishes, water tanks, and clotheslines. Pedestrians and vehicles below look tiny, reacting in awe. Add neon lights, traffic glow, and a hazy evening sky. Ultra-realistic, 9:16 ratio. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t61",
    label: "Upload product",
    category: "Design & Events",
    coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80",
    bestFor: "Bold Brand Campaigns, Launch Events, FMCG, Any Product",
    prompt: "Generate a hyper-realistic CGI ad where The Provided Product is scaled to massive size and loaded dramatically onto a flatbed truck or trailer, moving through a crowded city street. The product looks impossibly huge compared to surrounding cars and street vendors. Add shadows, reflections, and street-level chaos. People stop and stare in amazement. Side-view camera angle to capture both truck and product in full frame. Ultra-detailed, photorealistic, 9:16 ratio. The image provided should be analyzed and used as a reference image.",
  },
  {
    id: "t62",
    label: "Upload product",
    category: "General",
    coverImage: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
    bestFor: "Surreal Brand Campaigns, Water/Nature Products, Premium Awareness Ads",
    prompt: "Create a surreal CGI advertisement where The Provided Product is enlarged to colossal size and placed floating in a river, lake, or beside the seashore. Boats, fishermen, or swimmers nearby look miniature in comparison. Add water reflections, ripples, and splashes to blend the product naturally into the environment. Cinematic atmosphere with morning mist or golden sunset lighting. Wide panoramic angle, epic composition, ultra-photorealistic, 9:16 ratio. The image provided should be analyzed and used as a reference image.",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Template = typeof SOCIAL_TEMPLATES[0];

type SocialAdsFormProps = {
  generating: boolean;
  setGenerating: (val: boolean) => void;
  setGeneratedImages: (images: string[]) => void;
  setGenerated: (val: boolean) => void;
  refImage: string | null;
  setRefImage: (val: string | null) => void;
  resolution: string;
  model: string;
  setModel: (val: string) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function SocialAdsForm({
  generating, setGenerating, setGeneratedImages, setGenerated,
  refImage, setRefImage, model, setModel
}: SocialAdsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedResolution, setSelectedResolution] = useState('1K');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [progressMsg, setProgressMsg] = useState('');
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── File handling ──────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setRefImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  const clearImage = (e: React.MouseEvent) => { e.stopPropagation(); setRefImage(null); setSavedPath(null); };

  // ── Generation ─────────────────────────────────────────────────────────────
  const generateSocialAd = async (templateOverride?: Template) => {
    if (!refImage) { alert('Please upload a product image first.'); return; }
    const activeTemplate = templateOverride ?? selectedTemplate;
    if (!activeTemplate) { alert('Please select a template design first.'); return; }

    setSavedPath(null);
    setSaveError(null);

    try {
      setGenerating(true);
      setGenerated(false);
      setGeneratedImages([]);
      setProgressMsg('Uploading product image...');

      // 1. Upload product image to Fal CDN
      const uploadedProduct = await resolveImageInput(refImage, 'Product');
      if (!uploadedProduct) throw new Error('Product upload failed');

      // 2. Build the final prompt with poster directive + language instruction
      const langLabel = SOCIAL_LANGUAGES.find(l => l.id === selectedLanguage);
      const langDirective = selectedLanguage === 'english'
        ? 'All text in the poster must be written in English.'
        : selectedLanguage === 'arabic'
          ? 'All text in the poster must be written in Arabic (عربي). Use Arabic script for every headline, tagline, and call-to-action.'
          : 'All text in the poster must be written in French (Français). Use French for every headline, tagline, and call-to-action.';
      const posterDirective = 'This is a poster design that should be engaging for social media, showing some of the best features of the product with high energy, bold visual impact, and eye-catching composition.';
      const ratioDirective = `Aspect ratio: ${selectedRatio}. Resolution: ${selectedResolution}.`;
      const basePrompt = activeTemplate.prompt.replace('{{ASPECT_RATIO}}', selectedRatio);
      const finalPrompt = `${basePrompt} ${posterDirective} ${ratioDirective} ${langDirective}`;

      setProgressMsg(`Generating with ${model}...`);

      // 3. Call Nano Banana (same endpoint as Generate tab)
      const result = await (window as any).api.fal.nanoBananaEdit({
        model,
        prompt: finalPrompt,
        image_urls: [uploadedProduct],
        resolution: selectedResolution,
        aspect_ratio: selectedRatio,
        num_images: 1,
        output_format: 'jpeg',
      });

      if (!result?.images?.length) throw new Error('No image returned from model');
      const imageUrl = result.images[0].url;

      setGeneratedImages([imageUrl]);
      setGenerated(true);

      // 4. Save to OutputSocialAds folder
      setProgressMsg('Saving to OutputSocialAds...');
      const filename = `SocialAd_${activeTemplate.id}_${selectedRatio.replace(':', 'x')}_${Date.now()}.jpg`;
      const saveResult = await (window as any).api.social.saveAdImage({ imageUrl, filename });

      if (saveResult.success) {
        setSavedPath(saveResult.localUrl);
      } else {
        setSaveError(saveResult.error);
      }

    } catch (err: any) {
      console.error(err);
      alert(`Generation Error: ${err.message}`);
    } finally {
      setGenerating(false);
      setProgressMsg('');
    }
  };

  const openOutputFolder = () => (window as any).api.social.openOutputFolder();

  // ── Lightbox confirm → select + generate ────────────────────────────────
  const handleLightboxGenerate = () => {
    if (previewTemplate) {
      setSelectedTemplate(previewTemplate);
      const tpl = previewTemplate;
      setPreviewTemplate(null);
      generateSocialAd(tpl);
    }
  };

  // Close lightbox on Escape key
  useEffect(() => {
    if (!previewTemplate) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreviewTemplate(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewTemplate]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const canGenerate = !generating && !!refImage && !!selectedTemplate;

  // Build live prompt preview helper
  const buildPromptPreview = (t: Template) => {
    const langText = selectedLanguage === 'english'
      ? 'All text in the poster must be written in English.'
      : selectedLanguage === 'arabic'
        ? 'All text in the poster must be written in Arabic (عربي).'
        : 'All text in the poster must be written in French (Français).';
    return `${t.prompt} This is a poster design that should be engaging for social media, showing some of the best features of the product with high energy. Aspect ratio: ${selectedRatio}. Resolution: ${selectedResolution}. ${langText}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Lightbox Modal ──────────────────────────────────────────────── */}
      {previewTemplate && (
        <div
          onClick={() => setPreviewTemplate(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 40, animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setPreviewTemplate(null)}
            style={{
              position: 'absolute', top: 28, right: 28, zIndex: 10,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#FFF', width: 38, height: 38, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>

          {/* Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#111318', borderRadius: 16,
              width: '100%', maxWidth: 920, display: 'flex', overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
              animation: 'scaleIn 0.2s ease-out'
            }}
          >
            {/* Left: Large Template Image */}
            <div style={{
              flex: '1.2', background: '#0A0A0A', minHeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#000' }}>
                <img
                  src={`/OutputSocialAds/${previewTemplate.id}.png`}
                  onError={(e) => { (e.target as HTMLImageElement).src = previewTemplate.coverImage; }}
                  alt={previewTemplate.label}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Right: Details Panel */}
            <div style={{ flex: '1', padding: '28px 28px', display: 'flex', flexDirection: 'column', color: '#FFF' }}>
              {/* Header */}
              <div style={{ marginBottom: 16 }}>
                <h2 style={{
                  fontSize: 11, fontWeight: 800, color: '#3B82F6',
                  margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1px'
                }}>
                  Social Ad Template
                </h2>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFF', margin: 0 }}>
                  {previewTemplate.label}
                </h3>
              </div>

              {/* Category + Best For */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(59,130,246,0.15)', color: '#60A5FA',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  {previewTemplate.category}
                </span>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '12px 14px', marginBottom: 14
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
                  <Tag size={9} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  Best For
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
                  {previewTemplate.bestFor}
                </p>
              </div>

              {/* Prompt Preview */}
              <div style={{
                background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)',
                borderRadius: 10, padding: '12px 14px', marginBottom: 'auto',
                maxHeight: 180, overflowY: 'auto'
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
                  Prompt Preview
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
                  {previewTemplate.prompt}
                  {' '}
                  <span style={{ color: '#F59E0B' }}>
                    This is a poster design that should be engaging for social media, showing some of the best features of the product with high energy.
                    {' '}Aspect ratio: {selectedRatio}. Resolution: {selectedResolution}.
                    {' '}
                    {selectedLanguage === 'english'
                      ? 'All text in English.'
                      : selectedLanguage === 'arabic'
                        ? 'All text in Arabic (عربي).'
                        : 'All text in French (Français).'}
                  </span>
                </p>
              </div>

              {/* Bottom: Meta + Generate */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>📐</span>
                    <span>{selectedRatio}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>🔤</span>
                    <span style={{ textTransform: 'capitalize' }}>{selectedLanguage}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981' }}>
                    <Zap size={12} />
                    <span>Instant Execute</span>
                  </div>
                </div>

                <button
                  onClick={handleLightboxGenerate}
                  disabled={!refImage || generating}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                    background: refImage ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'rgba(255,255,255,0.08)',
                    color: refImage ? '#FFF' : 'rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: 14, fontWeight: 700,
                    cursor: refImage ? 'pointer' : 'not-allowed',
                    boxShadow: refImage ? '0 4px 20px rgba(59,130,246,0.35)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <Sparkles size={16} />
                  {refImage ? 'Generate Image' : 'Upload product image first'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main layout: upload + template gallery ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>

        {/* Left: Product Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            1 · Product Image
          </label>

          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: 'none' }} />

          <div
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            onClick={() => !refImage && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--ma-accent)' : refImage ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 10, flex: 1, minHeight: 200, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: refImage ? 'default' : 'pointer',
              background: refImage ? '#000' : 'rgba(255,255,255,0.02)',
              position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s'
            }}
          >
            {refImage ? (
              <>
                <img src={refImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Product" />
                <button onClick={clearImage} style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(0,0,0,0.65)', border: 'none', color: '#FFF',
                  width: 26, height: 26, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}>
                  <X size={12} />
                </button>
              </>
            ) : (
              <>
                <Upload size={28} color="rgba(255,255,255,0.2)" style={{ marginBottom: 10 }} />
                <span style={{ fontSize: 12, color: '#FFF', fontWeight: 600 }}>Drop product image</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>or click to browse</span>
              </>
            )}
          </div>

          {/* ── Aspect Ratio ── */}
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            2 · Aspect Ratio
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {SOCIAL_RATIOS.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRatio(r.id)}
                style={{
                  padding: '8px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: selectedRatio === r.id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                  outline: selectedRatio === r.id ? '1.5px solid #3B82F6' : '1.5px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: selectedRatio === r.id ? '#3B82F6' : 'rgba(255,255,255,0.7)' }}>
                  {r.label}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{r.desc}</div>
              </button>
            ))}
          </div>

          {/* ── Resolution ── */}
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            3 · Resolution
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {SOCIAL_RESOLUTIONS.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedResolution(r.id)}
                style={{
                  padding: '7px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: selectedResolution === r.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                  outline: selectedResolution === r.id ? '1.5px solid #8B5CF6' : '1.5px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: selectedResolution === r.id ? '#8B5CF6' : 'rgba(255,255,255,0.7)' }}>
                  {r.label}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{r.desc}</div>
              </button>
            ))}
          </div>

          {/* ── Language ── */}
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            4 · Ad Language
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {SOCIAL_LANGUAGES.map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLanguage(l.id)}
                style={{
                  flex: 1, padding: '8px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: selectedLanguage === l.id ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                  outline: selectedLanguage === l.id ? '1.5px solid #F59E0B' : '1.5px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s', textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 16, lineHeight: 1 }}>{l.flag}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: selectedLanguage === l.id ? '#F59E0B' : 'rgba(255,255,255,0.7)', marginTop: 3 }}>
                  {l.label}
                </div>
              </button>
            ))}
          </div>

          {/* ── Model ── */}
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            5 · Model
          </label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            style={{
              background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)',
              color: '#FFF', borderRadius: 8, padding: '8px 10px', fontSize: 12,
              cursor: 'pointer', width: '100%'
            }}
          >
            {SOCIAL_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label} — {m.desc}</option>
            ))}
          </select>
        </div>

        {/* Right: Template Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={14} color="var(--ma-accent)" />
                6 · Select Template
              </h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0 0' }}>
                Click a style to use its prompt with your product image.
              </p>
            </div>
          </div>

          {/* Template grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 10,
            overflowY: 'auto',
            maxHeight: 700,
            paddingRight: 4,
          }}>
            {SOCIAL_TEMPLATES.map(t => {
              const isSelected = selectedTemplate?.id === t.id;
              const catColors: Record<string, string> = {
                'Skincare': '#F472B6', 'Beauty': '#EC4899', 'Serums & Oils': '#DB2777',
                'Haircare': '#A855F7', 'Spa & Wellness': '#8B5CF6', 'Fragrance': '#C084FC',
                'Fashion': '#A78BFA', 'Luxury Fashion': '#7C3AED', 'Winter Fashion': '#6366F1',
                'Textiles': '#818CF8', 'Jewelry': '#F59E0B', 'Footwear': '#F97316',
                'Home & Décor': '#8B5CF6', 'Furniture': '#6D28D9',
                'Food & Beverage': '#10B981', 'Food & Condiments': '#34D399', 'Fast Food': '#F97316',
                'Beverage': '#14B8A6', 'Fitness & Supplements': '#22D3EE',
                'Outdoor & Sports': '#06B6D4', 'Suncare': '#FBBF24',
                'Tech & Gadgets': '#3B82F6', 'Tech & SaaS': '#2563EB', 'Gaming': '#EF4444',
                'E-Commerce': '#6B7280', 'Packaging': '#9CA3AF',
                'CGI & Brand': '#EF4444', 'Festive': '#F97316', 'Urban & Retail': '#64748B',
                'Launch & Bold': '#DC2626', 'Art & Print': '#D946EF', 'Design & Events': '#C026D3',
                'Universal': '#6B7280', 'General': '#6B7280', 'Baby Products': '#FDA4AF',
              };
              const catColor = catColors[t.category] ?? '#6B7280';
              return (
                <button
                  key={t.id}
                  onClick={() => setPreviewTemplate(t)}
                  style={{
                    background: 'var(--ma-elevated)',
                    border: `1px solid ${isSelected ? '#3B82F6' : 'var(--ma-border)'}`,
                    borderRadius: 12,
                    padding: 0,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    position: 'relative',
                    boxShadow: isSelected ? '0 0 0 2px #3B82F6, 0 0 16px rgba(59,130,246,0.3)' : 'none',
                  }}
                >
                  {/* Thumbnail — poster-proportioned card */}
                  <div style={{ width: '100%', aspectRatio: '4 / 5', position: 'relative', background: '#000' }}>
                    <img
                      src={`/OutputSocialAds/${t.id}.png`}
                      alt={t.label}
                      onError={(e) => { (e.target as HTMLImageElement).src = t.coverImage; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Gradient overlay with label */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 50%)',
                      display: 'flex', alignItems: 'flex-end', padding: 10
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#FFF', lineHeight: 1.3 }}>
                        {t.label}
                      </span>
                    </div>

                    {/* Selected check badge */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6,
                        background: '#3B82F6', borderRadius: '50%',
                        width: 20, height: 20,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(59,130,246,0.7)',
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Meta row — category + "1-Click" (mirrors AI Fashion duration/1-click row) */}
                  <div style={{
                    padding: '7px 10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderTop: '1px solid var(--ma-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: catColor, display: 'inline-block', flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 9, fontWeight: 600, color: catColor, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {t.category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--ma-green, #10B981)' }}>
                      <Sparkles size={9} />
                      <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase' }}>1-Click</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Prompt preview — only when template selected */}
          {selectedTemplate && (
            <div style={{
              background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: 8, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>
                Prompt Preview
              </div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.55 }}>
                {selectedTemplate.prompt}
                {' '}
                <span style={{ color: '#F59E0B' }}>
                  This is a poster design that should be engaging for social media, showing some of the best features of the product with high energy.
                  {' '}Aspect ratio: {selectedRatio}. Resolution: {selectedResolution}.
                  {' '}
                  {selectedLanguage === 'english'
                    ? 'All text in the poster must be written in English.'
                    : selectedLanguage === 'arabic'
                      ? 'All text in the poster must be written in Arabic (عربي).'
                      : 'All text in the poster must be written in French (Français).'}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Generate Button + Status ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={generateSocialAd}
          disabled={!canGenerate}
          style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: canGenerate ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'var(--ma-elevated)',
            color: canGenerate ? '#FFF' : 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 14, fontWeight: 700,
            cursor: canGenerate ? 'pointer' : 'not-allowed',
            boxShadow: canGenerate ? '0 4px 20px rgba(59,130,246,0.35)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {generating ? (
            <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />{progressMsg || 'Generating...'}</>
          ) : (
            <><Sparkles size={16} />Generate Social Ad {selectedTemplate ? `· ${selectedTemplate.label}` : ''} {selectedRatio}</>
          )}
        </button>

        {/* Save status */}
        {savedPath && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 8, padding: '8px 12px'
          }}>
            <CheckCircle2 size={14} color="#22C55E" />
            <span style={{ fontSize: 11, color: '#22C55E', flex: 1 }}>
              Saved to OutputSocialAds folder
            </span>
            <button
              onClick={openOutputFolder}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', color: '#22C55E',
                fontSize: 10, fontWeight: 700, cursor: 'pointer'
              }}
            >
              <FolderOpen size={11} /> Open
            </button>
            <button
              onClick={() => window.open(savedPath, '_blank')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', color: '#22C55E',
                fontSize: 10, fontWeight: 700, cursor: 'pointer'
              }}
            >
              <Download size={11} /> View
            </button>
          </div>
        )}

        {saveError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#EF4444'
          }}>
            ⚠️ Generated but save failed: {saveError}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
