/**
 * Shared pricing constants — imported by both main process (analyticsService.ts)
 * and renderer screens. These match the values in renderer constants files and
 * must be kept in sync manually when model pricing changes.
 */

export const IMAGE_MODEL_ENDPOINT_MAP: Record<string, string> = {
  'FLUX.1 Pro': 'fal-ai/flux-pro',
  'FLUX.1 Dev': 'fal-ai/flux/dev',
  'FLUX Schnell': 'fal-ai/flux/schnell',
  'Stable Diffusion XL': 'fal-ai/fast-sdxl'
}

export const IMAGE_MODEL_FALLBACK_PRICES: Record<string, number> = {
  'FLUX.1 Pro': 0.048,
  'FLUX.1 Dev': 0.024,
  'FLUX Schnell': 0.008,
  'Stable Diffusion XL': 0.006
}

export interface VideoModelPricing {
  id: string
  pricePerSec: { noAudio: number; withAudio: number }
}

export const VIDEO_MODEL_PRICING: VideoModelPricing[] = [
  {
    id: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    pricePerSec: { noAudio: 0.07, withAudio: 0.14 }
  },
  {
    id: 'fal-ai/minimax/video-01',
    pricePerSec: { noAudio: 0.05, withAudio: 0.05 }
  },
  {
    id: 'fal-ai/ltx-video',
    pricePerSec: { noAudio: 0.02, withAudio: 0.02 }
  },
  {
    id: 'fal-ai/pixverse/v6/image-to-video',
    pricePerSec: { noAudio: 0.04, withAudio: 0.08 }
  },
  {
    id: 'bytedance/seedance-2.0/reference-to-video',
    pricePerSec: { noAudio: 0.07, withAudio: 0.14 }
  }
]

/**
 * Estimate cost for a fal.ai API call given a model ID and usage parameters.
 * Mirrors the pricing logic shown in DashboardScreen and ApiCostsScreen.
 */
export function estimateFalCost(
  modelId: string,
  options: {
    duration?: number
    imagesCount?: number
    charsCount?: number
    audio?: boolean
  } = {}
): number {
  // 1. Image generation models (by endpoint ID)
  const imgModelKey = Object.keys(IMAGE_MODEL_ENDPOINT_MAP).find(
    (key) => IMAGE_MODEL_ENDPOINT_MAP[key] === modelId
  )
  if (imgModelKey && IMAGE_MODEL_FALLBACK_PRICES[imgModelKey] != null) {
    return IMAGE_MODEL_FALLBACK_PRICES[imgModelKey] * (options.imagesCount || 1)
  }

  // Nano Banana variants / GPT Image 2 / Resize models (endpoint substrings)
  if (modelId.includes('gpt-image-2')) return 0.039 * (options.imagesCount || 1)
  if (modelId.includes('image-editing/reframe')) return 0.04 * (options.imagesCount || 1)
  if (modelId.includes('flux-pro/kontext')) return 0.04 * (options.imagesCount || 1)
  if (modelId.includes('seedream')) return 0.039 * (options.imagesCount || 1)

  // 2. Video models
  const videoModel = VIDEO_MODEL_PRICING.find(
    (m) => m.id === modelId || modelId.includes(m.id)
  )
  if (videoModel) {
    const rate = options.audio
      ? videoModel.pricePerSec.withAudio
      : videoModel.pricePerSec.noAudio
    return rate * (options.duration || 5)
  }

  // 3. Audio Lab
  if (modelId.includes('elevenlabs/tts')) {
    // ElevenLabs: ~$0.10 per 1000 chars
    return 0.0001 * (options.charsCount || 100)
  }
  if (modelId.includes('voice-changer')) {
    return 0.0001 * (options.charsCount || 100)
  }
  if (modelId.includes('elevenlabs/music')) {
    return 0.02
  }
  if (modelId.includes('qwen-3-tts')) {
    return 0.005
  }

  // 4. LLM via openrouter (ad-copy vision / chat)
  if (modelId.includes('openrouter') || modelId.includes('vision') || modelId.includes('chat')) {
    return 0.001 // Small flat estimate for text calls
  }

  return 0
}
