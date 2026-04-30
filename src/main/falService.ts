import { keystoreService } from './keystore'
import {
  FalUsageResponse,
  ValidationResult,
  VideoGenerationRequest,
  VideoGenerationResult,
  AudioGenerationRequest,
  AudioResult
} from './services/fal/types'

import { BillingService } from './services/fal/billing.service'

const billingService = new BillingService()

import { TextService } from './services/fal/text.service'

const textService = new TextService()

export class FalService {
  async validateKey(key: string): Promise<ValidationResult> {
    return billingService.validateKey(key)
  }

  async getPricing(endpointIds: string[]): Promise<any | { error: string }> {
    return billingService.getPricing(endpointIds)
  }

  async getAnalytics(endpointIds: string[], start?: string, end?: string): Promise<any | { error: string }> {
    return billingService.getAnalytics(endpointIds, start, end)
  }

  async getUsage(timeframe: string = 'day', start?: string, end?: string): Promise<FalUsageResponse | { error: string }> {
    return billingService.getUsage(timeframe, start, end)
  }

  async getBilling(): Promise<any | { error: string }> {
    return billingService.getBilling()
  }

  async analyzeImageVision(
    imageUrl: string,
    prompt: string,
    systemPrompt: string,
    modelId: string,
    maxTokens: number = 4096
  ): Promise<{ data?: string; error?: string }> {
    return textService.analyzeImageVision(imageUrl, prompt, systemPrompt, modelId, maxTokens)
  }

  async chatCompletion(
    messages: any[],
    modelId: string,
    maxTokens: number = 4096
  ): Promise<{ data?: string; error?: string }> {
    return textService.chatCompletion(messages, modelId, maxTokens)
  }

  async generateCopy(promptOrMessages: any, modelId: string, maxTokens: number = 4096): Promise<{ data?: string; error?: string }> {
    return textService.generateCopy(promptOrMessages, modelId, maxTokens)
  }


  async uploadImageFromDataUrl(dataUrl: string): Promise<{ url?: string; error?: string }> {
    return imageService.uploadImageFromDataUrl(dataUrl)
  }

  async nanoBananaEdit(params: any): Promise<any> {
    return imageService.nanoBananaEdit(params)
  }

  async reframeImage(params: any): Promise<any> {
    return imageService.reframeImage(params)
  }

  async kontextEdit(params: any): Promise<any> {
    return imageService.kontextEdit(params)
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
