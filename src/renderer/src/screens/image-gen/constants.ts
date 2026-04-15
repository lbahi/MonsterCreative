import type { Step } from '../../components/ui/StepChecklist';
import { Crop, Monitor, Shirt, Wand2 } from 'lucide-react';

import type { ModeOption } from './types';

export const MODES: ModeOption[] = [
  { id: 'generate', path: '/image-gen/generate', label: 'Generate', description: 'Create original ad images from text prompts', icon: Wand2, color: '#6C63FF' },
  { id: 'vton', path: '/image-gen/vton', label: 'Virtual Try-On', description: 'AI Casting Director for your garments', icon: Shirt, color: '#EC4899' },
  { id: 'resize', path: '/image-gen/resize', label: 'Format Resizer', description: 'Resize and adapt creatives for every platform', icon: Crop, color: '#F59E0B' },
  { id: 'landing', path: '/image-gen/landing', label: 'Landing Page', description: 'Generate a hero image for landing pages', icon: Monitor, color: '#22C55E' },
];

export const STYLES = ['Photorealistic', 'Studio Lit', 'Cinematic', 'Editorial', 'Flat Design', 'Illustration', 'Dark Premium', 'Vibrant'];
export const RATIOS = ['1:1', '4:5', '9:16', '16:9', '2:3', '1.91:1'];
export const MODELS = ['FLUX.1 Pro', 'FLUX.1 Dev', 'FLUX Schnell', 'Stable Diffusion XL'];
export const NANO_BANANA_MODELS = ['Nano Banana 2', 'Seedream 4.5'];
export const NANO_BANANA_RATIOS = ['auto', '1:1', '4:5', '3:4', '2:3', '9:16', '16:9', '4:1', '1:4', '8:1', '1:8'];
export const NANO_BANANA_RESOLUTIONS = ['0.5K', '1K', '2K', '4K'];
export const NANO_BANANA_FORMATS = ['png', 'jpeg', 'webp'];

export const MODEL_ENDPOINT_MAP: Record<string, string> = {
  'FLUX.1 Pro': 'fal-ai/flux-pro',
  'FLUX.1 Dev': 'fal-ai/flux/dev',
  'FLUX Schnell': 'fal-ai/flux/schnell',
  'Stable Diffusion XL': 'fal-ai/fast-sdxl',
};

export const MODEL_FALLBACK_PRICES: Record<string, number> = {
  'FLUX.1 Pro': 0.048,
  'FLUX.1 Dev': 0.024,
  'FLUX Schnell': 0.008,
  'Stable Diffusion XL': 0.006,
};

export const IMG_STEPS: Step[] = [
  { label: 'Processing prompt & context', duration: 800 },
  { label: 'Initializing model', duration: 1200 },
  { label: 'Generating base composition', duration: 2000 },
  { label: 'Applying style refinements', duration: 1500 },
  { label: 'Post-processing & upscaling', duration: 900 },
];

export const NB_TEMPLATES = {
  'Nano Banana 2': `NANO BANANA 2 â€” FULL TEMPLATE (SMART MODE)
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
  'Seedream 4.5': `{{USER_PROMPT}}`
};

export const SAMPLE_OUTPUTS = [
  'https://images.unsplash.com/photo-1771762013405-ad64577dfc55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
  'https://images.unsplash.com/photo-1591348069836-57e47c84c6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
  'https://images.unsplash.com/photo-1668260920944-ec171ceb8633?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
  'https://images.unsplash.com/photo-1657812159075-7f0abd98f7b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
];

export const PROMPT_TIPS = [
  'Include brand colors and mood',
  'Specify product placement',
  'Mention target demographic',
  'Add lighting preference',
  'Reference visual style (e.g. "studio-lit with soft shadows")',
];
