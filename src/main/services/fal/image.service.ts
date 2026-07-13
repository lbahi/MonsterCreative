import { FalClient } from './base'
import log from 'electron-log'
import { fal } from '@fal-ai/client'


interface FalImageOutput {
  image?: { url: string }
  images?: Array<{ url: string }>
  output?: {
    image?: { url: string }
    images?: Array<{ url: string }>
  }
}

interface FalKontextOutput {
  images?: Array<{ url: string }>
  image?: { url: string }
  output?: {
    images?: Array<{ url: string }>
    image?: { url: string }
  }
}

export class ImageService extends FalClient {
  /**
   * Uploads a base64 data URL to fal storage via the official @fal-ai/client
   * helper (fal.storage.upload). Routed through the main process per the
   * Secure IPC Pattern (constitution §4.8); never reached from the renderer.
   */
  async uploadImageFromDataUrl(dataUrl: string): Promise<{ url?: string; error?: string }> {
    try {
      if (!dataUrl || typeof dataUrl !== 'string') {
        return { error: 'Invalid dataUrl: must be a non-empty string' }
      }

      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) return { error: 'Invalid data URL format.' }

      const mime = matches[1]
      const base64Data = matches[2]
      const ext = mime.split('/')[1] || 'jpg'

      const buffer = Buffer.from(base64Data, 'base64')
      const blob = new Blob([buffer], { type: mime })

      fal.config({
        credentials: await this.getApiKey(),
        suppressLocalCredentialsWarning: true
      })

      const uploadUrl = await fal.storage.upload(blob, {
        lifecycle: { expiresIn: '30d' }
      })

      if (!uploadUrl) return { error: 'Upload returned no URL' }
      return { url: uploadUrl }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      log.error('[fal.storage.upload] failed:', message)
      return { error: `Upload error: ${message}` }
    }
  }

  /**
   * Nano Banana 2 Specialized Handler
   */
  async nanoBananaEdit(params: {
    model: string
    prompt: string
    image_urls: string[]
    resolution?: string
    aspect_ratio?: string
    num_images?: number
    seed?: string
    output_format?: string
    safety_tolerance?: string
    thinking_level?: string
    enable_web_search?: boolean
    limit_generations?: boolean
  }): Promise<unknown> {
    // auth is handled by request() method

    let endpoint = ''
    let body: Record<string, unknown> = {}

    if (params.model === 'Seedream V4.5 Edit') {
      endpoint = 'fal-ai/bytedance/seedream/v4.5/edit'
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        image_size: params.resolution === '4K' ? 'auto_4K' : undefined,
        num_images: params.num_images || 1,
        max_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        enable_safety_checker: true
      }
    } else if (params.model === 'Nano Banana Pro' || params.model === 'fal-ai/nano-banana-pro/edit') {
      endpoint = 'fal-ai/nano-banana-pro/edit'
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        resolution: params.resolution || '1K',
        aspect_ratio: params.aspect_ratio || 'auto',
        num_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        output_format: params.output_format || 'png',
        safety_tolerance: params.safety_tolerance || '4',
        enable_web_search: params.enable_web_search || false,
        limit_generations: params.limit_generations ?? true
      }
    } else if (params.model === 'Nano Banana 2' || params.model === 'fal-ai/nano-banana-2/edit') {
      endpoint = 'fal-ai/nano-banana-2/edit'
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        aspect_ratio: params.aspect_ratio || 'auto',
        num_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        output_format: params.output_format || 'png',
        safety_tolerance: params.safety_tolerance || '4',
        limit_generations: params.limit_generations ?? true
      }
    } else if (params.model === 'Nano Banana' || params.model === 'fal-ai/nano-banana/edit' || params.model === 'fal-ai/nano-banana/pro/edit') {
      endpoint = 'fal-ai/nano-banana/edit'
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        aspect_ratio: params.aspect_ratio || 'auto',
        num_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        output_format: params.output_format || 'png',
        safety_tolerance: params.safety_tolerance || '4',
        limit_generations: params.limit_generations ?? true
      }
    } else if (params.model === 'GPT Image 2' || params.model === 'openai/gpt-image-2/edit') {
      endpoint = 'openai/gpt-image-2/edit'

      // Map standard ratios to GPT Image 2 enums
      let gptImageSize = 'auto'
      const ratio = params.aspect_ratio || 'auto'
      if (ratio === '1:1') gptImageSize = 'square'
      else if (ratio === '4:3') gptImageSize = 'landscape_4_3'
      else if (ratio === '3:4') gptImageSize = 'portrait_4_3'
      else if (ratio === '16:9') gptImageSize = 'landscape_16_9'
      else if (ratio === '9:16') gptImageSize = 'portrait_16_9'
      else if (ratio === 'auto') gptImageSize = 'auto'

      let gptQuality = 'high'
      if (params.resolution === '0.5K') {
        gptQuality = 'low'
      } else if (params.resolution === '1K' || params.resolution === '2K') {
        gptQuality = 'medium'
      } else if (params.resolution === '4K') {
        gptQuality = 'high'
      }

      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        image_size: gptImageSize,
        quality: gptQuality,
        num_images: params.num_images || 1,
        output_format: params.output_format || 'png'
      }
    }

    const response = await this.request(`https://fal.run/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(
        `Generation request failed (${response.status}): ${sanitizeDiagnosticText(errText)}`
      )
    }

    return await response.json()
  }

  /**
   * Smart Reframe — fal-ai/image-editing/reframe
   * Returns a normalized { images: [{ url }] } shape regardless of API response format.
   */
  async reframeImage(params: {
    image_url: string
    aspect_ratio: string
    output_format?: string
    guidance_scale?: number
    num_inference_steps?: number
  }): Promise<unknown> {
    const body = {
      image_url: params.image_url,
      aspect_ratio: params.aspect_ratio,
      output_format: params.output_format ?? 'jpeg',
      guidance_scale: params.guidance_scale ?? 3.5,
      num_inference_steps: params.num_inference_steps ?? 30
    }

    const response = await this.request('https://fal.run/fal-ai/image-editing/reframe', {
      method: 'POST',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Reframe failed (${response.status}): ${sanitizeDiagnosticText(errText)}`)
    }


    const data = (await response.json()) as FalImageOutput

    // Normalize: API may return { image: {...} } OR { images: [...] }
    const url: string | undefined =
      data?.image?.url ??
      data?.images?.[0]?.url ??
      data?.output?.image?.url ??
      data?.output?.images?.[0]?.url

    if (!url) {
      throw new Error(
        `Reframe: no image URL in response. Keys: ${Object.keys(data as object).join(', ')}`
      )
    }
    return { images: [{ url }] }
  }

  /**
   * GPT Image 2 — openai/gpt-image-2/edit
   * Advanced image generation and editing using GPT Image 2 via fal.ai
   */
  async gptImage2Edit(params: {
    prompt: string
    image_urls: string[]
    image_size?: string
    quality?: string
    num_images?: number
    output_format?: string
  }): Promise<{ images?: Array<{ url: string }>; error?: string }> {

    try {
      const apiKey = await this.getApiKey()
      if (!apiKey) return { error: 'No Fal.ai API key configured' }

      const body: Record<string, unknown> = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        n: params.num_images ?? 1
      }

      if (params.image_size) body.image_size = params.image_size
      if (params.quality) body.quality = params.quality
      if (params.output_format) body.output_format = params.output_format

      const response = await fetch('https://fal.run/openai/gpt-image-2/edit', {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errText = await response.text()
        const safeErrText = sanitizeDiagnosticText(errText)
        log.error('=== STORYBOARD GENERATION FAILED (HTTP) ===')
        log.error('storyboardQuality:', params.quality)
        log.error('image_size:', params.image_size)
        log.error('storyboardPrompt length:', params.prompt?.length)
        log.error('HTTP status:', response.status)
        log.error('HTTP error text:', safeErrText)
        console.error('[Main] fal IPC error:', safeErrText)
        console.error('[Main] fal IPC status:', response.status)
        throw new Error(`Generation request failed (${response.status}): ${safeErrText}`)
      }

      const data = await response.json()

      // Normalize response - API returns { images: [{ url: string }] }
      const images = data?.images ?? data?.data?.images ?? null
      if (!images || !images[0]?.url) {
        log.error('=== STORYBOARD GENERATION FAILED (No URL) ===')
        log.error('storyboardQuality:', params.quality)
        log.error('aspectRatio:', params.image_size)
        log.error('storyboardPrompt length:', params.prompt?.length)
        throw new Error('No image URL in response')
      }

      return { images }
    } catch (err: unknown) {
      log.error('=== STORYBOARD GENERATION FAILED (Exception) ===')
      log.error('storyboardQuality:', params.quality)
      log.error('image_size:', params.image_size)
      log.error('storyboardPrompt length:', params.prompt?.length)
      console.error('[Main] gptImage2Edit error:', (err as Error).message)
      return { error: (err as Error).message }
    }
  }

  /**
   * FLUX.1 Kontext Pro — fal-ai/flux-pro/kontext
   * Contextual image transformation with optional explicit width/height
   * for non-standard (non-enum) target dimensions.
   */
  async kontextEdit(params: {
    image_url: string
    prompt: string
    aspect_ratio?: string // standard enum formats
    width?: number // non-standard; takes precedence if provided
    height?: number // non-standard; takes precedence if provided
    output_format?: string
    num_images?: number
  }): Promise<unknown> {
    const body: Record<string, unknown> = {
      image_url: params.image_url,
      prompt: params.prompt,
      output_format: params.output_format ?? 'jpeg',
      num_images: params.num_images ?? 1
    }

    // Prefer explicit dimensions for non-standard ratios; fall back to enum
    if (params.width && params.height) {
      body.width = params.width
      body.height = params.height
    } else if (params.aspect_ratio) {
      body.aspect_ratio = params.aspect_ratio
    }

    const response = await this.request('https://fal.run/fal-ai/flux-pro/kontext', {
      method: 'POST',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Kontext edit failed (${response.status}): ${sanitizeDiagnosticText(errText)}`)
    }


    const data = (await response.json()) as FalKontextOutput

    // Normalize: API may return { images: [...] } or { image: {...} }
    const url: string | undefined =
      data?.images?.[0]?.url ??
      data?.image?.url ??
      data?.output?.images?.[0]?.url ??
      data?.output?.image?.url

    if (!url) {
      throw new Error(
        `Kontext: no image URL in response. Keys: ${Object.keys(data as object).join(', ')}`
      )
    }
    return { images: [{ url }] }
  }
}
