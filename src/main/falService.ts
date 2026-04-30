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
import { TextService } from './services/fal/text.service'
import { ImageService } from './services/fal/image.service'
import { AudioService } from './services/fal/audio.service'

const billingService = new BillingService()
const textService = new TextService()
const imageService = new ImageService()
const audioService = new AudioService()

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

  async generateSpeech(request: AudioGenerationRequest): Promise<AudioResult> {
    return audioService.generateSpeech(request)
  }

  async speechToSpeech(params: any): Promise<AudioResult> {
    return audioService.speechToSpeech(params)
  }

  async cloneVoice(params: { audioUrl: string; referenceText?: string }): Promise<{ speakerEmbeddingUrl: string }> {
    return audioService.cloneVoice(params)
  }

  async generateClonedSpeech(params: { text: string; speakerEmbeddingUrl: string }): Promise<AudioResult> {
    return audioService.generateClonedSpeech(params)
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const apiKey = await keystoreService.getFalKey()
    if (!apiKey) throw new Error('No Fal.ai API key configured.')

    const { modelId } = request
    const directRunEndpoint = `https://fal.run/${modelId}`
    const queueEndpoint = `https://queue.fal.run/${modelId}`
    const genericQueueBase = `https://queue.fal.run`

    const payload = this.buildVideoPayload(request)

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
        if (parsed) return parsed
      }
    } catch (err) {
      console.warn(`[Direct Run Error] ${err}`)
    }

    const queueSubmit = await fetch(queueEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!queueSubmit.ok) {
      throw new Error(`Queue submit failed: ${queueSubmit.statusText}`)
    }

    const { request_id } = await queueSubmit.json()
    if (!request_id) throw new Error('No request_id')

    let attempts = 0
    while (attempts < 60) {
      const sRes = await fetch(`${queueEndpoint}/requests/${request_id}/status`, { 
        headers: { 'Authorization': `Key ${apiKey}` } 
      })
      if (sRes.ok) {
        const sData = await sRes.json()
        if (sData.status === 'COMPLETED') {
          const rRes = await fetch(`${queueEndpoint}/requests/${request_id}`, { 
            headers: { 'Authorization': `Key ${apiKey}` } 
          })
          if (rRes.ok) {
            const rData = await rRes.json()
            const parsed = toVideoResult(rData)
            if (parsed) return parsed
          }
        }
      }
      await new Promise(r => setTimeout(r, 5000))
      attempts++
    }

    throw new Error('Timeout')
  }

  private buildVideoPayload(request: VideoGenerationRequest): Record<string, unknown> {
    const { modelId } = request
    const base: Record<string, any> = {
      prompt: request.prompt,
      resolution: request.resolution,
      duration: request.duration,
      aspect_ratio: request.aspectRatio,
      negative_prompt: request.negativePrompt
    }

    if (modelId.includes('pixverse')) {
      return {
        ...base,
        image_url: request.imageUrl,
        generate_audio_switch: request.audio,
        thinking_type: 'disabled'
      }
    }

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

    return {
      ...base,
      image_url: request.imageUrl,
      generate_audio: request.audio,
    }
  }
}

export const falService = new FalService()
