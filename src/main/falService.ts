import { keystoreService } from './keystore'

const FAL_API_BASE_URL = 'https://api.fal.ai/v1'

export interface FalUsageResponse {
  next_cursor: string | null
  has_more: boolean
  time_series?: Array<{
    bucket: string
    results: Array<{
      endpoint_id: string
      unit: string
      quantity: number
      unit_price: number
      cost: number
      currency: string
      auth_method?: string
    }>
  }>
  summary?: Array<{
    endpoint_id: string
    unit: string
    quantity: number
    unit_price: number
    cost: number
    currency: string
    auth_method?: string
  }>
}

export interface ValidationResult {
  valid: boolean
  credits?: number
  currency?: string
  error?: string
}

export interface VideoGenerationRequest {
  modelId: string
  prompt: string
  imageUrl: string
  endImageUrl?: string
  aspectRatio?: string
  resolution: string
  duration: number
  audio: boolean
  negativePrompt?: string
  seed?: number
}

export interface VideoGenerationResult {
  url: string
  fileName: string
  fileSize: number
}

export interface AudioGenerationRequest {
  text: string
  voiceId: string
  stability?: number
  similarity_boost?: number
  speed?: number
  model?: string
}

export interface AudioResult {
  url: string
  duration?: number
}

export class FalService {
  /**
   * Smoke-tests a key BEFORE saving it. Hits the billing endpoint directly.
   * Returns { valid: true, credits, currency } on success, or { valid: false, error } on failure.
   */
  async validateKey(key: string): Promise<ValidationResult> {
    try {
      const url = new URL(`${FAL_API_BASE_URL}/account/billing`)
      url.searchParams.append('expand', 'credits')

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Key ${key}`,
          Accept: 'application/json'
        }
      })

      if (response.status === 401) {
        return { valid: false, error: 'Invalid API key. Please check your fal.ai dashboard.' }
      }

      // 403 = authenticated but no billing permission — key is still valid
      if (response.status === 403) {
        return { valid: true }
      }

      if (!response.ok) {
        return { valid: false, error: `API Error (${response.status}): ${response.statusText}` }
      }

      const data = await response.json()
      return {
        valid: true,
        credits: data.credits?.current_balance,
        currency: data.credits?.currency
      }
    } catch (err: any) {
      return { valid: false, error: `Network error: ${err.message}` }
    }
  }

  async getPricing(endpointIds: string[]): Promise<any | { error: string }> {
    try {
      const apiKey = await keystoreService.getFalKey()
      if (!apiKey) return { error: 'No API key configured.' }

      const url = new URL(`${FAL_API_BASE_URL}/models/pricing`)
      endpointIds.forEach(id => url.searchParams.append('endpoint_id', id))

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Authorization': `Key ${apiKey}`, 'Accept': 'application/json' }
      })

      if (!response.ok) {
        return { error: `Pricing API Error (${response.status}): ${response.statusText}` }
      }
      return await response.json()
    } catch (err: any) {
      return { error: `Network error: ${err.message}` }
    }
  }

  async getAnalytics(endpointIds: string[], start?: string, end?: string): Promise<any | { error: string }> {
    try {
      const apiKey = await keystoreService.getFalKey()
      if (!apiKey) return { error: 'No API key configured.' }

      const url = new URL(`${FAL_API_BASE_URL}/models/analytics`)
      endpointIds.forEach(id => url.searchParams.append('endpoint_id', id))
      url.searchParams.append('expand', 'time_series')
      url.searchParams.append('expand', 'summary')
      url.searchParams.append('expand', 'request_count')
      url.searchParams.append('expand', 'success_count')
      url.searchParams.append('expand', 'p50_duration')
      url.searchParams.append('expand', 'p90_duration')

      const s = start ?? (() => {
        const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.toISOString()
      })()
      url.searchParams.append('start', s)
      if (end) url.searchParams.append('end', end)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Authorization': `Key ${apiKey}`, 'Accept': 'application/json' }
      })

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        return { error: `Analytics API Error (${response.status}): ${errJson.error?.message || response.statusText}` }
      }
      return await response.json()
    } catch (err: any) {
      return { error: `Network error: ${err.message}` }
    }
  }


  async getUsage(timeframe: string = 'day', start?: string, end?: string): Promise<FalUsageResponse | { error: string }> {
    try {
      const apiKey = await keystoreService.getFalKey()
      if (!apiKey) {
        return { error: 'No Fal.ai API key found. Please configure it in Settings.' }
      }

      const url = new URL(`${FAL_API_BASE_URL}/models/usage`)
      url.searchParams.append('expand', 'time_series')
      url.searchParams.append('expand', 'summary')
      url.searchParams.append('limit', '100')
      url.searchParams.append('timeframe', timeframe)

      if (start) {
        url.searchParams.append('start', start)
      } else {
        // default: start of current month
        const s = new Date()
        s.setDate(1)
        s.setHours(0, 0, 0, 0)
        url.searchParams.append('start', s.toISOString())
      }
      if (end) url.searchParams.append('end', end)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        const errMsg = errJson.error?.message || response.statusText
        return { error: `Fal API Error (${response.status}): ${errMsg}` }
      }

      const data = await response.json()
      return data as FalUsageResponse
    } catch (err: any) {
      return { error: `Network connection failed: ${err.message}` }
    }
  }

  async getBilling(): Promise<any | { error: string }> {
    try {
      const apiKey = await keystoreService.getFalKey()
      if (!apiKey) {
        return { error: 'No Fal.ai API key found. Please configure it in Settings.' }
      }

      // Try 1: with expand=credits (full billing data)
      const urlWithExpand = new URL(`${FAL_API_BASE_URL}/account/billing`)
      urlWithExpand.searchParams.append('expand', 'credits')

      const responseWithExpand = await fetch(urlWithExpand.toString(), {
        method: 'GET',
        headers: { 'Authorization': `Key ${apiKey}`, 'Accept': 'application/json' }
      })

      if (responseWithExpand.ok) {
        const payload = await responseWithExpand.json()
        console.log('[DEBUG] Fal billing response payload:', JSON.stringify(payload, null, 2))
        try { require('fs').writeFileSync('C:/Users/bahaa/.gemini/antigravity/brain/e6d8ef9b-9cb4-4c0e-9a9b-7b6e37bd8135/scratch/debug_billing.json', JSON.stringify(payload, null, 2)); } catch(e){}
        return payload
      }

      // Try 2: plain billing endpoint without expand
      if (responseWithExpand.status === 403 || responseWithExpand.status === 400) {
        const urlPlain = new URL(`${FAL_API_BASE_URL}/account/billing`)
        const responsePlain = await fetch(urlPlain.toString(), {
          method: 'GET',
          headers: { 'Authorization': `Key ${apiKey}`, 'Accept': 'application/json' }
        })

        if (responsePlain.ok) {
          return await responsePlain.json()
        }

        // 403 on billing = key is valid but has no billing read scope
        if (responsePlain.status === 403 || responseWithExpand.status === 403) {
          return { billing_restricted: true }
        }
      }

      const errJson = await responseWithExpand.json().catch(() => ({}))
      const errMsg = errJson.error?.message || responseWithExpand.statusText
      return { error: `Fal API Error (${responseWithExpand.status}): ${errMsg}` }
    } catch (err: any) {
      return { error: `Network connection failed: ${err.message}` }
    }
  }

  /**
   * ONE-SHOT VISION ANALYSIS
   * Uses the correct openrouter/router/vision schema:
   * { image_urls, prompt, system_prompt?, model, max_tokens? }
   * Returns the plain text `output` field from the response.
   */
  async analyzeImageVision(
    imageUrl: string,
    prompt: string,
    systemPrompt: string,
    modelId: string,
    maxTokens: number = 4096
  ): Promise<{ data?: string; error?: string }> {
    try {
      const apiKey = await keystoreService.getFalKey()
      if (!apiKey) return { error: 'No Fal.ai API key configured.' }

      const auth = `Key ${apiKey}`
      const queueUrl = 'https://queue.fal.run/openrouter/router/vision'

      const body: Record<string, any> = {
        image_urls: [imageUrl],
        prompt,
        system_prompt: systemPrompt,
        model: modelId,
        max_tokens: maxTokens
      }

      const response = await fetch(queueUrl, {
        method: 'POST',
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errBody = await response.text()
        return { error: `Vision queue submit failed (${response.status}): ${errBody}` }
      }

      const queueData = await response.json();
      const result = await this.pollStatus(queueData.request_id, 'openrouter/router/vision', 120, auth);
      // The vision endpoint returns { output: string, usage: {...} }
      return { data: result?.output ?? JSON.stringify(result) }
    } catch (err: any) {
      return { error: `Network error: ${err.message}` }
    }
  }

  /**
   * MULTI-TURN CHAT COMPLETION (synchronous)
   * Uses fal.run/openrouter/router/openai/v1/chat/completions
   * This is the OpenAI-compatible bridge - it supports:
   *   - Full `messages` history array (for interview flow)
   *   - system/user/assistant roles
   *   - Plain text: wrap the prompt in a user message
   * No polling needed - response comes back directly.
   */
  async chatCompletion(
    messages: any[],
    modelId: string,
    maxTokens: number = 4096
  ): Promise<{ data?: string; error?: string }> {
    try {
      const apiKey = await keystoreService.getFalKey()
      if (!apiKey) return { error: 'No Fal.ai API key configured.' }

      const response = await fetch('https://fal.run/openrouter/router/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          max_tokens: maxTokens
        })
      })

      if (!response.ok) {
        const errBody = await response.text()
        return { error: `Chat completion failed (${response.status}): ${errBody}` }
      }

      const data = await response.json()
      // Standard OpenAI response format
      const text = data?.choices?.[0]?.message?.content ?? ''
      return { data: text }
    } catch (err: any) {
      return { error: `Network error: ${err.message}` }
    }
  }

  /**
   * Backward-compatible wrapper.
   * String prompt → wraps in a user message → calls chatCompletion.
   * Message array → calls chatCompletion directly.
   */
  async generateCopy(promptOrMessages: any, modelId: string, maxTokens: number = 4096): Promise<{ data?: string; error?: string }> {
    const messages = Array.isArray(promptOrMessages)
      ? promptOrMessages
      : [{ role: 'user', content: promptOrMessages }]
    return this.chatCompletion(messages, modelId, maxTokens)
  }


  /**
   * Uploads a base64 data URL to fal.media CDN.
   * Called from the renderer via IPC — the main process handles it
   * because Electron's renderer security blocks direct requests to fal.media.
   */
  async uploadImageFromDataUrl(dataUrl: string): Promise<{ url?: string; error?: string }> {
    try {
      const apiKey = await keystoreService.getFalKey()
      if (!apiKey) return { error: 'No Fal.ai API key found.' }

      // Parse the data URL: data:<mime>;base64,<data>
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) return { error: 'Invalid data URL format.' }

      const mime = matches[1]
      const base64Data = matches[2]
      const buffer = Buffer.from(base64Data, 'base64')
      const ext = mime.split('/')[1] || 'jpg'
      const fileName = `upload.${ext}`
      const authVariants = [`Bearer ${apiKey}`, `Key ${apiKey}`]
      const bodyVariants: Array<{ label: string; body: any }> = [
        { label: 'blob', body: new Blob([buffer], { type: mime }) },
        { label: 'buffer', body: buffer }
      ]

      const failures: string[] = []

      for (const auth of authVariants) {
        for (const bodyVariant of bodyVariants) {
          try {
            const response = await fetch('https://fal.media/files/upload', {
              method: 'POST',
              headers: {
                'Authorization': auth,
                'X-Fal-File-Name': fileName,
                'Content-Type': mime,
                'Accept': 'application/json'
              },
              body: bodyVariant.body
            })

            if (!response.ok) {
              const errBody = await response.text()
              failures.push(`auth=${auth.startsWith('Bearer') ? 'Bearer' : 'Key'} body=${bodyVariant.label} status=${response.status} body=${errBody.slice(0, 160)}`)
              continue
            }

            const data = await response.json() as any
            const accessUrl = (data.access_url as string | undefined)?.replace(/ /g, '%20')
            if (accessUrl) {
              return { url: accessUrl }
            }

            failures.push(`auth=${auth.startsWith('Bearer') ? 'Bearer' : 'Key'} body=${bodyVariant.label} missing access_url`)
          } catch (err: any) {
            failures.push(`auth=${auth.startsWith('Bearer') ? 'Bearer' : 'Key'} body=${bodyVariant.label} error=${err?.message ?? 'unknown'}`)
          }
        }
      }

      return {
        error: `CDN upload failed after retries. ${failures.join(' | ')}`
      }
    } catch (err: any) {
      return { error: `Upload error: ${err.message}` }
    }
  }
  private async pollStatus(requestId: string, endpoint: string, maxAttempts = 60, auth: string): Promise<any> {
    const resultUrl = `https://queue.fal.run/${endpoint}/requests/${requestId}`

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const res = await fetch(resultUrl, {
        method: 'GET',
        headers: { 'Authorization': auth }
      })

      if (!res.ok) throw new Error(`Polling failed: ${res.statusText}`)

      const data = await res.json() as any

      if (data.status === 'COMPLETED') {
        return data
      } else if (data.status === 'FAILED') {
        const error = data.error || 'Unknown error'
        throw new Error(`Generation failed: ${error}`)
      } else {
        // IN_QUEUE or IN_PROGRESS
        continue
      }
    }

    throw new Error(`Timed out after ${maxAttempts * 2} seconds`)
  }

  /**
   * Nano Banana 2 Specialized Handler
   */
  async nanoBananaEdit(params: {
    model: string,
    prompt: string,
    image_urls: string[],
    resolution?: string,
    aspect_ratio?: string,
    num_images?: number,
    seed?: string,
    output_format?: string,
    safety_tolerance?: string,
    thinking_level?: string,
    enable_web_search?: boolean,
    limit_generations?: boolean
  }): Promise<any> {
    const apiKey = await keystoreService.getFalKey();
    if (!apiKey) throw new Error('No Fal.ai API key found.');
    const auth = `Key ${apiKey}`;

    let endpoint = '';
    let body: any = {};

    if (params.model === 'Seedream V4.5 Edit') {
      endpoint = 'fal-ai/bytedance/seedream/v4.5/edit';
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        image_size: params.resolution === '4K' ? 'auto_4K' : undefined,
        num_images: params.num_images || 1,
        max_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        enable_safety_checker: true
      };
    } else if (params.model === 'Nano Banana Pro') {
      endpoint = 'fal-ai/nano-banana-pro/edit';
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
      };
    } else if (params.model === 'Nano Banana 2') {
      endpoint = 'fal-ai/nano-banana-2/edit';
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        aspect_ratio: params.aspect_ratio || 'auto',
        num_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        output_format: params.output_format || 'png',
        safety_tolerance: params.safety_tolerance || '4',
        limit_generations: params.limit_generations ?? true
      };
    } else if (params.model === 'Nano Banana') {
      endpoint = 'fal-ai/nano-banana/edit';
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        aspect_ratio: params.aspect_ratio || 'auto',
        num_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        output_format: params.output_format || 'png',
        safety_tolerance: params.safety_tolerance || '4',
        limit_generations: params.limit_generations ?? true
      };
    } else if (params.model === 'GPT Image 2') {
      endpoint = 'openai/gpt-image-2/edit';
      
      // Map standard ratios to GPT Image 2 enums
      let gptImageSize = 'auto';
      const ratio = params.aspect_ratio || 'auto';
      if (ratio === '1:1') gptImageSize = 'square';
      else if (ratio === '4:3') gptImageSize = 'landscape_4_3';
      else if (ratio === '3:4') gptImageSize = 'portrait_4_3';
      else if (ratio === '16:9') gptImageSize = 'landscape_16_9';
      else if (ratio === '9:16') gptImageSize = 'portrait_16_9';
      else if (ratio === 'auto') gptImageSize = 'auto';

      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        image_size: gptImageSize,
        quality: 'high',
        num_images: params.num_images || 1,
        output_format: params.output_format || 'png'
      };
    }

    const runUrl = `https://fal.run/${endpoint}`;
    const response = await fetch(runUrl, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Generation request failed (${response.status}): ${errText}`);
    }

    return await response.json();
  }

  /**
   * Smart Reframe — fal-ai/image-editing/reframe
   * Returns a normalized { images: [{ url }] } shape regardless of API response format.
   */
  async reframeImage(params: {
    image_url: string;
    aspect_ratio: string;
    output_format?: string;
    guidance_scale?: number;
    num_inference_steps?: number;
  }): Promise<any> {
    const apiKey = await keystoreService.getFalKey();
    if (!apiKey) throw new Error('No Fal.ai API key found.');

    const body = {
      image_url: params.image_url,
      aspect_ratio: params.aspect_ratio,
      output_format: params.output_format ?? 'jpeg',
      guidance_scale: params.guidance_scale ?? 3.5,
      num_inference_steps: params.num_inference_steps ?? 30,
    };

    const response = await fetch('https://fal.run/fal-ai/image-editing/reframe', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Reframe failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    console.log('[reframeImage] raw response:', JSON.stringify(data).slice(0, 400));

    // Normalize: API may return { image: {...} } OR { images: [...] }
    const url: string | undefined =
      data?.image?.url ??
      data?.images?.[0]?.url ??
      data?.output?.image?.url ??
      data?.output?.images?.[0]?.url;

    if (!url) throw new Error(`Reframe: no image URL in response. Keys: ${Object.keys(data).join(', ')}`);
    return { images: [{ url }] };
  }

  /**
   * FLUX.1 Kontext Pro — fal-ai/flux-pro/kontext
   * Contextual image transformation with optional explicit width/height
   * for non-standard (non-enum) target dimensions.
   */
  async kontextEdit(params: {
    image_url: string;
    prompt: string;
    aspect_ratio?: string;   // standard enum formats
    width?: number;           // non-standard; takes precedence if provided
    height?: number;          // non-standard; takes precedence if provided
    output_format?: string;
    num_images?: number;
  }): Promise<any> {
    const apiKey = await keystoreService.getFalKey();
    if (!apiKey) throw new Error('No Fal.ai API key found.');

    const body: any = {
      image_url: params.image_url,
      prompt: params.prompt,
      output_format: params.output_format ?? 'jpeg',
      num_images: params.num_images ?? 1,
    };

    // Prefer explicit dimensions for non-standard ratios; fall back to enum
    if (params.width && params.height) {
      body.width = params.width;
      body.height = params.height;
    } else if (params.aspect_ratio) {
      body.aspect_ratio = params.aspect_ratio;
    }

    const response = await fetch('https://fal.run/fal-ai/flux-pro/kontext', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Kontext edit failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    console.log('[kontextEdit] raw response:', JSON.stringify(data).slice(0, 400));

    // Normalize: API may return { images: [...] } or { image: {...} }
    const url: string | undefined =
      data?.images?.[0]?.url ??
      data?.image?.url ??
      data?.output?.images?.[0]?.url;

    if (!url) throw new Error(`Kontext: no image URL in response. Keys: ${Object.keys(data).join(', ')}`);
    return { images: [{ url }] };
  }

  /**
   * Universal Video Generation Handler
   * Consolidates endpoint logic and uses model-specific payload builders.
   */
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const apiKey = await keystoreService.getFalKey()
    if (!apiKey) throw new Error('No Fal.ai API key configured.')

    const { modelId } = request
    console.log(`[FalService:generateVideo] Targeting model: ${modelId}`)

    // 1. Configurable Endpoints
    const directRunEndpoint = `https://fal.run/${modelId}`
    const queueEndpoint = `https://queue.fal.run/${modelId}`
    const genericQueueBase = `https://queue.fal.run`

    // 2. Build Model-Specific Payload
    const payload = this.buildVideoPayload(request)
    console.log(`[FalService:generateVideo] Payload prepared for ${modelId}`)

    const toVideoResult = (data: any): VideoGenerationResult | null => {
      const video = data?.video ?? data?.output?.video ?? data?.data?.video
      const url = video?.url ?? data?.url
      if (!url) return null

      return {
        url,
        fileName: video?.file_name ?? data?.file_name ?? 'output.mp4',
        fileSize: video?.file_size ?? data?.file_size ?? 0,
      }
    }

    // --- EXECUTION: PRIMARY PATH (Direct Run) ---
    try {
      const runRes = await fetch(directRunEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (runRes.ok) {
        const runData = await runRes.json()
        const parsed = toVideoResult(runData)
        if (parsed) {
          console.log(`[FalService:generateVideo] Direct run success for ${modelId}`)
          return parsed
        }
      }
    } catch (err) {
      console.warn(`[FalService:generateVideo] Direct run failed for ${modelId}, falling back to queue.`, err)
    }

    // --- EXECUTION: FALLBACK PATH (Queue + Polling) ---
    const queueSubmit = await fetch(queueEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!queueSubmit.ok) {
      const errBody = await queueSubmit.text()
      throw new Error(`[${modelId}] Submit failed (${queueSubmit.status}): ${errBody}`)
    }

    const { request_id } = await queueSubmit.json()
    if (!request_id) throw new Error(`[${modelId}] No request_id returned from queue submit`)
    console.log(`[FalService:generateVideo] Queued: ${request_id}`)

    const statusUrls = [
      `${queueEndpoint}/requests/${request_id}/status`,
      `${genericQueueBase}/requests/${request_id}/status`,
    ]
    const resultUrls = [
      `${queueEndpoint}/requests/${request_id}`,
      `${genericQueueBase}/requests/${request_id}`,
    ]

    // Unified Poller
    let attempts = 0
    const maxAttempts = 60 // 5 minutes at 5s intervals
    
    while (attempts < maxAttempts) {
      // Check status
      for (const sUrl of statusUrls) {
        try {
          const sRes = await fetch(sUrl, { headers: { 'Authorization': `Key ${apiKey}` } })
          if (sRes.ok) {
            const sData = await sRes.json()
            if (sData.status === 'COMPLETED') {
              // Try to get result
              for (const rUrl of resultUrls) {
                const rRes = await fetch(rUrl, { headers: { 'Authorization': `Key ${apiKey}` } })
                if (rRes.ok) {
                  const rData = await rRes.json()
                  const parsed = toVideoResult(rData)
                  if (parsed) return parsed
                }
              }
            }
          }
        } catch (e) { /* ignore individual poll failure */ }
      }

      await new Promise(r => setTimeout(r, 5000))
      attempts++
    }

    throw new Error(`[${modelId}] Polling timed out after 5 minutes.`)
  }

  /**
   * Model-Specific Payload Mapping
   */
  private buildVideoPayload(request: VideoGenerationRequest): Record<string, unknown> {
    const { modelId } = request
    
    const base: Record<string, any> = {
      prompt: request.prompt,
      resolution: request.resolution,
      duration: request.duration,
    }

    // Aspect Ratio mapping
    if (request.aspectRatio) {
      base.aspect_ratio = request.aspectRatio
    }

    // Negative Prompt
    if (request.negativePrompt) {
      base.negative_prompt = request.negativePrompt
    }

    // Pixverse v6 Mapping
    if (modelId.includes('pixverse')) {
      return {
        ...base,
        image_url: request.imageUrl,
        generate_audio_switch: request.audio,
        thinking_type: 'disabled'
      }
    }

    // Kling Mapping (Primary)
    if (modelId.includes('kling')) {
      const klingDuration = request.duration <= 5 ? '5' : '10'
      const klingPayload: Record<string, any> = {
        ...base,
        duration: klingDuration,
        start_image_url: request.imageUrl,
        generate_audio: request.audio,
      }
      if (request.endImageUrl) {
        klingPayload.end_image_url = request.endImageUrl
      }
      return klingPayload
    }

    // Default Fallback (handles most other models like Hailuo, Minimax)
    return {
      ...base,
      image_url: request.imageUrl,
      generate_audio: request.audio,
    }
  }
  async generateSpeech(request: AudioGenerationRequest): Promise<AudioResult> {
    const key = await keystoreService.getFalKey()
    if (!key) throw new Error('Fal API key not found in keystore')

    const response = await fetch('https://fal.run/fal-ai/elevenlabs/tts/eleven-v3', {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: request.text,
        voice: request.voiceId,
        stability: request.stability ?? 0.5
      })
    })

    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const error = await response.json()
        errorMsg = error.message || error.detail || response.statusText;
      } catch (e) {}
      throw new Error(`Fal API Error: ${errorMsg}`)
    }

    const data = await response.json()
    return {
      url: data.audio?.url || data.url
    }
  }

  async speechToSpeech(params: any): Promise<AudioResult> {
    const key = await keystoreService.getFalKey()
    if (!key) throw new Error('Fal API key not found in keystore')

    const response = await fetch('https://queue.fal.run/fal-ai/elevenlabs/voice-changer', {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Fal API Error: ${error.message || response.statusText}`)
    }

    const data = await response.json()
    return {
      url: data.audio?.url || data.url
    }
  }

  /**
   * STEP 1: Clone a voice from an audio sample.
   * Endpoint: fal-ai/qwen-3-tts/clone-voice/1.7b
   * Returns a `speaker_embedding` URL (safetensors file) to be used in Step 2.
   */
  async cloneVoice(params: { audioUrl: string; referenceText?: string }): Promise<{ speakerEmbeddingUrl: string }> {
    const key = await keystoreService.getFalKey()
    if (!key) throw new Error('Fal API key not found in keystore')

    const body: Record<string, any> = { audio_url: params.audioUrl }
    if (params.referenceText) body.reference_text = params.referenceText

    const response = await fetch('https://fal.run/fal-ai/qwen-3-tts/clone-voice/1.7b', {
      method: 'POST',
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const rawText = await response.text()
      console.error('[cloneVoice] Fal error response:', rawText)
      let msg = rawText
      try {
        const e = JSON.parse(rawText)
        msg = e.message || e.detail || e.error || JSON.stringify(e)
      } catch (_) {}
      throw new Error(`Clone Voice Error: ${msg}`)
    }

    const data = await response.json()
    const embeddingUrl = data.speaker_embedding?.url
    if (!embeddingUrl) throw new Error('No speaker_embedding URL returned from clone API')
    return { speakerEmbeddingUrl: embeddingUrl }
  }

  /**
   * STEP 2: Generate TTS using a cloned speaker embedding.
   * Endpoint: fal-ai/qwen-3-tts/1.7b
   * Takes the speaker_embedding URL from Step 1 + the text to speak.
   */
  async generateClonedSpeech(params: { text: string; speakerEmbeddingUrl: string }): Promise<AudioResult> {
    const key = await keystoreService.getFalKey()
    if (!key) throw new Error('Fal API key not found in keystore')

    const response = await fetch('https://fal.run/fal-ai/qwen-3-tts/1.7b', {
      method: 'POST',
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: params.text,
        speaker_embedding: params.speakerEmbeddingUrl
      })
    })

    if (!response.ok) {
      const rawText = await response.text()
      console.error('[generateClonedSpeech] Fal error response:', rawText)
      let msg = rawText
      try {
        const e = JSON.parse(rawText)
        msg = e.message || e.detail || e.error || JSON.stringify(e)
      } catch (_) {}
      throw new Error(`Cloned Speech Generation Error: ${msg}`)
    }

    const data = await response.json()
    return { url: data.audio?.url || data.url }
  }
}

export const falService = new FalService()
