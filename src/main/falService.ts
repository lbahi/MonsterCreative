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
import { VideoService } from './services/fal/video.service'

const billingService = new BillingService()
const textService = new TextService()
const imageService = new ImageService()
const audioService = new AudioService()
const videoService = new VideoService()

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
    return videoService.generateVideo(request)
  }
}

export const falService = new FalService()
