import { Crop, Monitor, Wand2, Sparkles } from 'lucide-react'

import type { ModeOption } from './types'

export interface PlatformFormat {
  id: string
  label: string
  platform: string
  w: number
  h: number
  // Enum accepted by Reframe + Kontext. null = non-standard
  aspectRatioEnum: string | null
  // Fallback enum for models that don't support explicit W×H
  closestEnum: string
}

export const MODES: ModeOption[] = [
  {
    id: 'generate',
    path: '/image-gen/generate',
    label: 'Generate',
    description: 'Create original ad images from text prompts',
    icon: Wand2,
    color: '#6C63FF'
  },
  {
    id: 'ai-shots',
    path: '/image-gen/ai-shots',
    label: 'AI Shots',
    description: 'Create high-end product photoshoots using AI',
    icon: Sparkles,
    color: '#6C63FF'
  },
  {
    id: 'social',
    path: '/image-gen/social',
    label: 'Social Ads',
    description: 'Generate platform-ready social ads from product images',
    icon: Wand2,
    color: '#3B82F6'
  },
  {
    id: 'resize',
    path: '/image-gen/resize',
    label: 'Format Resizer',
    description: 'Resize and adapt creatives for every platform',
    icon: Crop,
    color: '#F59E0B'
  },
  {
    id: 'landing',
    path: '/image-gen/landing',
    label: 'Landing Page',
    description: 'Generate a hero image for landing pages',
    icon: Monitor,
    color: '#22C55E',
    comingSoon: true
  }
]

export const STYLES = [
  'Photorealistic',
  'Studio Lit',
  'Cinematic',
  'Editorial',
  'Flat Design',
  'Illustration',
  'Dark Premium',
  'Vibrant'
]
export const RATIOS = ['1:1', '4:5', '9:16', '16:9', '2:3', '1.91:1']
export const MODELS = ['FLUX.1 Pro', 'FLUX.1 Dev', 'FLUX Schnell', 'Stable Diffusion XL']
export const NANO_BANANA_MODELS = ['Nano Banana', 'Nano Banana 2', 'Nano Banana Pro', 'GPT Image 2']
export const NANO_BANANA_RATIOS = [
  'auto',
  '1:1',
  '4:5',
  '3:4',
  '2:3',
  '9:16',
  '16:9',
  '4:1',
  '1:4',
  '8:1',
  '1:8'
]
export const NANO_BANANA_RESOLUTIONS = ['0.5K', '1K', '2K', '4K']
export const NANO_BANANA_FORMATS = ['png', 'jpeg', 'webp']

export const RESIZE_MODELS = [
  { id: 'reframe', label: 'Smart Reframe', endpoint: 'fal-ai/image-editing/reframe', price: 0.04 },
  { id: 'kontext', label: 'FLUX.1 Kontext Pro', endpoint: 'fal-ai/flux-pro/kontext', price: 0.04 },
  {
    id: 'nano-banana',
    label: 'Nano Banana (Budget)',
    endpoint: 'fal-ai/nano-banana/edit',
    price: 0.039
  }
]

export const PLATFORM_FORMATS: PlatformFormat[] = [
  {
    id: 'instagram_post',
    label: 'Instagram Post',
    platform: 'Instagram',
    w: 1080,
    h: 1080,
    aspectRatioEnum: '1:1',
    closestEnum: '1:1'
  },
  {
    id: 'meta_feed',
    label: 'Meta Feed',
    platform: 'Meta',
    w: 1080,
    h: 1350,
    aspectRatioEnum: '3:4',
    closestEnum: '3:4'
  },
  {
    id: 'meta_story',
    label: 'Meta Story',
    platform: 'Meta',
    w: 1080,
    h: 1920,
    aspectRatioEnum: '9:16',
    closestEnum: '9:16'
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    platform: 'TikTok',
    w: 1080,
    h: 1920,
    aspectRatioEnum: '9:16',
    closestEnum: '9:16'
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    platform: 'Pinterest',
    w: 1000,
    h: 1500,
    aspectRatioEnum: '2:3',
    closestEnum: '2:3'
  },
  {
    id: 'google_display',
    label: 'Google Display',
    platform: 'Google',
    w: 1200,
    h: 628,
    aspectRatioEnum: '16:9',
    closestEnum: '16:9'
  },
  {
    id: 'woocommerce',
    label: 'WooCommerce',
    platform: 'WooCommerce',
    w: 800,
    h: 800,
    aspectRatioEnum: '1:1',
    closestEnum: '1:1'
  },
  // Non-standard — requires exact W×H; closestEnum used as fallback for models without W/H support
  {
    id: 'facebook_ad',
    label: 'Facebook Ad',
    platform: 'Facebook',
    w: 1200,
    h: 630,
    aspectRatioEnum: null,
    closestEnum: '16:9'
  },
  {
    id: 'twitter_header',
    label: 'Twitter/X Header',
    platform: 'Twitter',
    w: 1500,
    h: 500,
    aspectRatioEnum: null,
    closestEnum: '16:9'
  }
]

export const KONTEXT_RESIZE_PROMPT =
  'Reformat this product image to the requested dimensions. Keep the main product centered and perfectly visible. ' +
  'Extend the background to fill the new canvas naturally and seamlessly. Preserve colors, lighting, and overall style.'

export const VIBES = [
  {
    id: 'Studio',
    label: 'Studio',
    desc: 'Professional minimalist studio, white backdrop, high-key lighting',
    image: './VtonVibes/studio.png'
  },
  {
    id: 'Urban',
    label: 'Urban',
    desc: 'City street scene, concrete textures, natural daylight',
    image: './VtonVibes/urban.png'
  },
  {
    id: 'Nature',
    label: 'Nature',
    desc: 'Golden hour in a lush park or beach setting, warm lighting',
    image: './VtonVibes/nature.png'
  },
  {
    id: 'Luxury',
    label: 'Luxury',
    desc: 'High-end penthouse, dramatic lighting, marble surfaces',
    image: './VtonVibes/luxury.png'
  },
  {
    id: 'Vintage',
    label: 'Vintage',
    desc: '35mm film grain aesthetic, warm amber tones, soft focus',
    image: './VtonVibes/vintage.png'
  },
  {
    id: 'Candid',
    label: 'Candid',
    desc: 'Handheld smartphone style, realistic home setting',
    image: './VtonVibes/candid.png'
  }
]
export const MODEL_ENDPOINT_MAP: Record<string, string> = {
  'FLUX.1 Pro': 'fal-ai/flux-pro',
  'FLUX.1 Dev': 'fal-ai/flux/dev',
  'FLUX Schnell': 'fal-ai/flux/schnell',
  'Stable Diffusion XL': 'fal-ai/fast-sdxl'
}

export const MODEL_FALLBACK_PRICES: Record<string, number> = {
  'FLUX.1 Pro': 0.048,
  'FLUX.1 Dev': 0.024,
  'FLUX Schnell': 0.008,
  'Stable Diffusion XL': 0.006
}

export const IMG_STEPS: { label: string; duration: number }[] = [
  { label: 'Processing prompt & context', duration: 800 },
  { label: 'Initializing model', duration: 1200 },
  { label: 'Generating base composition', duration: 2000 },
  { label: 'Applying style refinements', duration: 1500 },
  { label: 'Post-processing & upscaling', duration: 900 }
]

export const NB_TEMPLATES = {
  'Nano Banana': `{{USER_PROMPT}}`,
  'Nano Banana 2': `NANO BANANA 2 — FULL TEMPLATE (SMART MODE)
You are a professional AI image editor.

Goal:
Create a high-quality final image by editing and combining the provided images.

Image usage:
- Use the first image as the base
- Integrate elements from additional images naturally
- Ensure seamless blending between all elements

Edit request:
{{USER_PROMPT}}

Style:
{{STYLE}} (default: photorealistic, cinematic lighting, high contrast)

Quality:
- resolution target: {{RESOLUTION}}
- aspect ratio: {{ASPECT_RATIO}}
- quality level: {{QUALITY_HINT}}

Instructions:
- maintain realistic lighting, shadows, and perspective
- ensure high detail and sharpness
- preserve subject identity and proportions
- avoid artifacts or unnatural blending

Constraints:
- do not distort faces or key objects
- keep composition balanced
- avoid over-processing

Output:
- {{NUM_IMAGES}} high-quality images
- consistent colors and lighting
- format optimized for {{OUTPUT_FORMAT}}`,
  'Nano Banana Pro': `NANO BANANA PRO — HIGH FIDELITY MODE
Goal: Execute the following professional image edit with extreme realism and precision.

User Instruction: {{USER_PROMPT}}
Aesthetic Style: {{STYLE}}
Resolution: {{RESOLUTION}}
Ratio: {{ASPECT_RATIO}}

Requirements:
- Photorealistic results with perfect lighting and shadows.
- Preserve all key features of the product/subject.
- High-resolution textures and crisp details.`,
  'GPT Image 2': `{{USER_PROMPT}}`
}

export const SAMPLE_OUTPUTS = [
  'https://images.unsplash.com/photo-1771762013405-ad64577dfc55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
  'https://images.unsplash.com/photo-1591348069836-57e47c84c6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
  'https://images.unsplash.com/photo-1668260920944-ec171ceb8633?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
  'https://images.unsplash.com/photo-1657812159075-7f0abd98f7b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
]

export const PROMPT_TIPS = [
  'Include brand colors and mood',
  'Specify product placement',
  'Mention target demographic',
  'Add lighting preference',
  'Reference visual style (e.g. "studio-lit with soft shadows")'
]
