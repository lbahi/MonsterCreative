import type { VideoModel, VideoTemplate } from './types';

export const VIDEO_MODELS: VideoModel[] = [
  {
    id: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    label: 'Kling 2.6 Pro',
    endpoint: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    pricePerSec: {
      noAudio: 0.07,
      withAudio: 0.14,
    },
    maxDur: 10,
    supportedDurations: [5, 10],
    supportsAudio: true,
    desc: 'Production model with cinematic motion quality and native audio generation.',
    purpose: 'production',
    badge: 'Production',
    fixedDuration: null,
  },
  {
    id: 'fal-ai/minimax/video-01',
    label: 'Hailuo MiniMax',
    endpoint: 'fal-ai/minimax/video-01',
    pricePerSec: {
      noAudio: 0.05,
      withAudio: 0.05,
    },
    maxDur: 6,
    supportedDurations: [6],
    supportsAudio: false,
    desc: 'High-quality cinematic video with stable character movement.',
    purpose: 'quality',
    badge: 'Standard',
    fixedDuration: 6,
    fixedDurationNote: 'Always generates 6s'
  },
  {
    id: 'fal-ai/ltx-video',
    label: 'LTX Video',
    endpoint: 'fal-ai/ltx-video',
    pricePerSec: {
      noAudio: 0.02,
      withAudio: 0.02,
    },
    maxDur: 2,
    supportedDurations: [2],
    supportsAudio: false,
    desc: 'Ultra-fast video generation with realistic physics.',
    purpose: 'speed',
    badge: 'Fast',
    fixedDuration: 2,
    fixedDurationNote: 'Always generates 2s'
  },
  {
    id: 'fal-ai/pixverse/v6/image-to-video',
    label: 'Pixverse v6',
    endpoint: 'fal-ai/pixverse/v6/image-to-video',
    pricePerSec: {
      noAudio: 0.04,
      withAudio: 0.08,
    },
    maxDur: 10,
    supportedDurations: [5, 10],
    supportsAudio: true,
    desc: 'Great for character animation and style consistency.',
    purpose: 'style',
    badge: 'Flexible',
    fixedDuration: null,
  }
];

export const VIDEO_DEFAULTS = {
  duration: 5,
  resolution: '720p',
  audio: false,
  style: undefined,
  thinkingType: 'disabled',
} as const;

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'tmpl-runway',
    label: 'Runway Fashion Walk',
    prompt: 'A professional fashion model wearing the provided garment without modifying it walks a high-end runway. Smooth, confident catwalk strut. Camera tracks model head-on as she walks toward lens, full body visible. Cool neutral studio lighting. Clean white runway. Minimal shadows. Blurred audience bokeh in background. Photorealistic. High-fashion editorial. 4K. Slow motion.',
    coverImage: 'https://images.unsplash.com/photo-1733324961705-97bd6cd7f4ba?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/runway fashion walk.mp4',
    recommendedModelId: 'fal-ai/pixverse/v6/image-to-video',
    recommendedDuration: 2,
  },
  {
    id: 'tmpl-360',
    label: '360 Studio Turn',
    prompt: 'The subject rotates smoothly 360 degrees in place on a seamless white studio background. Soft box lighting, hyper-detailed, seamless loop motion.',
    coverImage: 'https://images.unsplash.com/photo-1746970890953-c9fcab24e665?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/360studioturn.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  },
  {
    id: 'tmpl-fabric-macro',
    label: 'Fabric Macro Detail',
    prompt: 'Extreme macro close-up of the garment, camera slowly panning across the fabric texture revealing the premium weave and stitching. Soft dramatic side lighting, high contrast.',
    coverImage: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Fabric Macro Detail.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  },
  {
    id: 'tmpl-fitting-room',
    label: 'Fitting Room Mirror',
    prompt: 'Subject posing naturally in front of a chic fitting room mirror. Warm ambient lighting, casual lifestyle aesthetic, subtle camera movement simulating handheld POV. Subject checks the fit of the provided garment.',
    coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Fitting Room Mirror.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  },
  {
    id: 'tmpl-flat-lay',
    label: 'Flat Lay Reveal',
    prompt: 'The provided garment lies flat on a clean pastel background. The camera slowly zooms out as creative abstract elements subtly shift around it. Crisp top-down perspective, hyper-detailed textures.',
    coverImage: 'https://images.unsplash.com/photo-1542466500-dccb2789cbbb?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Flat Lay Reveal.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  },
  {
    id: 'tmpl-ghost-mannequin',
    label: 'Ghost Mannequin Float',
    prompt: 'The provided garment is worn by an invisible ghost mannequin. It floats gracefully in mid-air in a pristine white infinite studio room, slowly rotating while maintaining hollow shape.',
    coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Ghost Mannequin Float.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  },
  {
    id: 'tmpl-golden-hour',
    label: 'Golden Hour Street Walk',
    prompt: 'Subject wearing the provided garment walking down a beautiful European cobblestone street during golden hour. Warm sunlight flaring the lens softly. Shallow depth of field, blurred background.',
    coverImage: 'https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Golden Hour Street Walk.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  },
  {
    id: 'tmpl-hanger-spin',
    label: 'Hanger Spin Product',
    prompt: 'The exact provided garment hangs elegantly on a premium wooden hanger, rotating slowly. Studio lighting catches the natural folds of the material against a clean gradient background.',
    coverImage: 'https://images.unsplash.com/photo-1521369909029-2afed882ba95?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Hanger Spin Product.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  },
  {
    id: 'tmpl-mirror-tunnel',
    label: 'Infinite Mirror Tunnel',
    prompt: 'Subject wearing the provided garment standing inside an infinity mirror tunnel with cool neon lighting. Multiple symmetrical reflections. Slow, cinematic camera pullback.',
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Infinite Mirror Tunnel.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 10,
  },
  {
    id: 'tmpl-luxury-hotel',
    label: 'Luxury Hotel Corridor',
    prompt: 'Tracking shot of a subject modeling the provided garment walking confidently down a moody, dimly lit luxury hotel corridor with elegant sconces and a carpet runner. High fashion.',
    coverImage: 'https://images.unsplash.com/photo-1517232883015-38b80fcceebc?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Luxury Hotel Corridor.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  },
  {
    id: 'tmpl-rain-editorial',
    label: 'Rain Editorial',
    prompt: 'Subject posed dramatically in the provided garment under soft cinematic rain. Moody cyber-noir backlighting, wet pavement reflections. High aesthetic mood board style.',
    coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Rain Editorial.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 10,
  },
  {
    id: 'tmpl-seated-pose',
    label: 'Seated Editorial Pose',
    prompt: 'Subject wearing the provided garment posing on a minimalist modern cube chair. Studio setting. Camera slowly arcs around the subject to capture the drape and fit from different angles.',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Seated Editorial Pose.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  },
  {
    id: 'tmpl-smoke-fog',
    label: 'Smoke and Fog Editorial',
    prompt: 'High fashion portrait of subject in the provided garment, enveloped by gently rolling low fog and dry ice smoke. Ethereal, mysterious atmosphere, cool lighting accents.',
    coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Smoke and Fog Editorial.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 10,
  },
  {
    id: 'tmpl-staircase',
    label: 'Staircase Descent',
    prompt: 'Subject wearing the provided garment gracefully walking down a grand marble staircase. Slow motion, wide shot. Elegant and cinematic luxury commercial style.',
    coverImage: 'https://images.unsplash.com/photo-1506452899435-021c33f260bc?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Staircase Descent.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  },
  {
    id: 'tmpl-underwater',
    label: 'Underwater Editorial',
    prompt: 'Subject posing in the provided garment completely submerged underwater. Slow motion floating, beautiful light rays piercing the surface, bubbles rising, ethereal physics.',
    coverImage: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Underwater Editorial.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 10,
  },
  {
    id: 'tmpl-wind-blow',
    label: 'Wind Blow Editorial',
    prompt: 'Subject wearing the provided garment standing on a cliff or studio setup with a strong artificial wind blowing the fabric dramatically. High energy, dynamic motion.',
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Wind Blow Editorial.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  },
  {
    id: 'tmpl-zero-gravity',
    label: 'Zero Gravity Float',
    prompt: 'Subject and the provided garment floating weightlessly in a minimalist white void. Abstract slow-motion twists and turns showcasing the physics of the material. Hyper-realistic.',
    coverImage: 'https://images.unsplash.com/photo-1533230495811-165f9b460eaf?q=80&w=687&auto=format&fit=crop',
    previewVideo: './OutputVideos/Zero Gravity Float.mp4',
    recommendedModelId: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    recommendedDuration: 5,
  }
];

export const VIDEO_DURATIONS = [2, 5, 6, 10] as const;
export type VideoDuration = typeof VIDEO_DURATIONS[number];

export const VIDEO_ASPECT_RATIOS = ['auto', '16:9', '9:16', '1:1', '4:3', '3:4'];

export const VIDEO_RESOLUTIONS = ['360p', '540p', '720p', '1080p'] as const;
export type VideoResolution = typeof VIDEO_RESOLUTIONS[number];

export const VIDEO_STEPS = [
  { label: 'Analyzing source image structure', duration: 15000 },
  { label: 'Generating initial keyframes', duration: 25000 },
  { label: 'Rendering temporal motion vectors', duration: 35000 },
  { label: 'Synthesizing audio channels (if enabled)', duration: 20000 },
  { label: 'Upscaling output frames & finalizing', duration: 25000 },
];
