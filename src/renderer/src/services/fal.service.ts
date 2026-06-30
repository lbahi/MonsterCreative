/**
 * FalService - TypeScript Port
 * Identical logic to C# FalService.cs
 * Uses fal.ai queue + openrouter/router for LLM calls
 */

import * as Sentry from '@sentry/electron/renderer'
import { sanitizeDiagnosticText, summarizePrompt } from '../../../shared/sentryPrivacy'


export interface FalResponse {
  request_id: string
  status?: string
  images?: Array<{ url: string; width: number; height: number }>
  video?: { url: string }
}

export interface CopyVariant {
  variantType: string
  headline1: string
  headline2: string
  headline3: string
  hook: string
  bodyCopy: string
  cta: string
  triggersUsed: string
  landingPagePart?: string
  videoScripts?: string
}

export class FalService {
  private readonly baseUrl = 'https://queue.fal.run'

  private async getAuthHeader(): Promise<string> {
    const key = await window.api.keystore.getFalKey()
    if (!key) throw new Error('Fal.ai API Key not found in Keystore.')
    return `Key ${key}`
  }

  /**
   * Polls the fal.ai queue until status is COMPLETED or FAILED.
   * Matches the C# PollAsync logic exactly.
   */
  private async pollStatus(
    requestId: string,
    endpoint: string,
    maxAttempts = 60
  ): Promise<unknown> {
    const auth = await this.getAuthHeader()
    const statusUrl = `${this.baseUrl}/${endpoint}/requests/${requestId}/status`
    const resultUrl = `${this.baseUrl}/${endpoint}/requests/${requestId}`

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const statusRes = await fetch(statusUrl, {
        method: 'GET',
        headers: { Authorization: auth }
      })

      if (!statusRes.ok) throw new Error(`Polling failed: ${statusRes.statusText}`)

      const statusData = (await statusRes.json()) as {
        status: string
        error?: string
      }

      switch (statusData.status) {
        case 'COMPLETED': {
          // Fetch the full result from the result endpoint (matching C# pattern)
          const resultRes = await fetch(resultUrl, {
            method: 'GET',
            headers: { Authorization: auth }
          })
          if (!resultRes.ok) throw new Error(`Result fetch failed: ${resultRes.statusText}`)
          return await resultRes.json()
        }
        case 'FAILED': {
          const error = statusData.error || 'Unknown error'
          throw new Error(`Generation failed: ${error}`)
        }
        case 'IN_QUEUE':
        case 'IN_PROGRESS':
          continue
      }
    }

    throw new Error(`Timed out after ${maxAttempts * 2} seconds`)
  }

  /**
   * "Monster Search" — extract the JSON array from potentially chatty LLM output.
   * Finds the first [ and last ] to survive any preamble/postamble.
   */
  private extractJsonArray(text: string): string {
    // Strip markdown code fences
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const firstBracket = cleaned.indexOf('[')
    const lastBracket = cleaned.lastIndexOf(']')

    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      return cleaned.substring(firstBracket, lastBracket + 1)
    }

    // Fallback: try object extraction
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return '[' + cleaned.substring(firstBrace, lastBrace + 1) + ']'
    }

    return cleaned
  }

  async generateImage(prompt: string, model = 'flux/pro-1.1'): Promise<FalResponse> {
    try {
      const auth = await this.getAuthHeader()
      const endpoint = `fal-ai/${model}`
      const queueUrl = `${this.baseUrl}/${endpoint}`

      const response = await fetch(queueUrl, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          image_size: 'square_hd',
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: false,
          output_format: 'jpeg'
        })
      })

      if (!response.ok) throw new Error(`Request failed: ${response.statusText}`)

      const queueData = (await response.json()) as FalResponse
      return (await this.pollStatus(queueData.request_id, endpoint)) as FalResponse
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('fal_model', model)
        scope.setExtra('payload_summary', { prompt: summarizePrompt(prompt) })
        Sentry.captureException(error)
      })
      throw error
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
  }): Promise<FalResponse> {
    try {
      return (await window.api.fal.nanoBananaEdit(params)) as FalResponse
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('fal_model', params.model)
        scope.setExtra('payload_summary', { prompt: summarizePrompt(params) })
        Sentry.captureException(error)
      })
      throw error
    }
  }

  /**
   * Sends a prompt to an LLM via fal.ai's generateCopy bridge.
   */
  async generateCopy(
    promptOrMessages: string | unknown[],
    modelId = 'google/gemini-3-pro'
  ): Promise<string> {
    try {
      const response = await window.api.fal.generateCopy(promptOrMessages, modelId)
      if (response.error) throw new Error(response.error)
      return response.data ?? ''
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('fal_model', modelId)
        scope.setExtra('payload_summary', { prompt: summarizePrompt(promptOrMessages) })
        Sentry.captureException(error)
      })
      throw error
    }
  }

  /**
   * High-level method: generates ad copy variants and parses them into structured objects.
   */
  async generateAdCopyVariants(prompt: string, modelId: string): Promise<CopyVariant[]> {
    const rawOutput = await this.generateCopy(prompt, modelId)
    const jsonString = this.extractJsonArray(rawOutput)

    try {
      const parsed = JSON.parse(jsonString)
      const variants: CopyVariant[] = Array.isArray(parsed) ? parsed : [parsed]
      return variants
    } catch (e: unknown) {
      const err = e as Error
      console.error('Failed to parse LLM JSON response:', err.message)
      throw new Error(`Failed to parse LLM response: ${err.message}`)
    }
  }

  /**
   * Uploads an image directly from the renderer using the native File object.
   */
  async uploadImage(file: File): Promise<{ url?: string; error?: string }> {
    try {
      const apiKey = await window.api.keystore.getFalKey()
      if (!apiKey) return { error: 'No Fal.ai API key found.' }

      const response = await fetch('https://fal.media/files/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'X-Fal-File-Name': file.name,
          'Content-Type': file.type,
          Accept: 'application/json'
        },
        body: file
      })

      if (!response.ok) {
        const errBody = await response.text()
        return { error: `CDN upload failed (${response.status}): ${sanitizeDiagnosticText(errBody)}` }
      }

      const data = (await response.json()) as { access_url?: string }
      let accessUrl = data.access_url
      if (accessUrl) {
        accessUrl = accessUrl.replace(/ /g, '%20')
      }

      return { url: accessUrl }
    } catch (err: unknown) {
      return { error: `Image upload failed: ${(err as Error).message}` }
    }
  }

  /** Dual-mode upload: Tries browser first, falls back to IPC if needed */
  async uploadImageFromDataUrl(dataUrl: string): Promise<{ url?: string; error?: string }> {
    let browserError: string | null = null
    try {
      const apiKey = await window.api.keystore.getFalKey()
      if (!apiKey) {
        const ipcRes = (await window.api.fal.uploadImageFromDataUrl(dataUrl)) as {
          url?: string
          error?: string
        }
        return ipcRes
      }

      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) {
        return { error: 'Invalid data URL format.' }
      }

      const mime = matches[1]
      const base64Data = matches[2]
      const binary = atob(base64Data)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      const ext = mime.split('/')[1] || 'png'
      const file = new File([bytes], `upload.${ext}`, { type: mime })
      const browserUpload = await this.uploadImage(file)
      if (!browserUpload.error && browserUpload.url) {
        return browserUpload
      }
      browserError = browserUpload.error ?? 'unknown browser upload error'
    } catch (err: unknown) {
      browserError = (err as Error)?.message ?? 'unknown browser upload exception'
    }

    const ipcUpload = (await window.api.fal.uploadImageFromDataUrl(dataUrl)) as {
      url?: string
      error?: string
    }
    if (!ipcUpload.error || !browserError) {
      return ipcUpload
    }

    return {
      error: `Renderer upload failed: ${browserError}; IPC upload failed: ${ipcUpload.error}`
    }
  }

  /** Smart Reframe bridge — routes to fal-ai/image-editing/reframe via IPC */
  async reframeImage(params: {
    image_url: string
    aspect_ratio: string
    output_format?: string
  }): Promise<{ images: Array<{ url: string }> }> {
    try {
      return (await window.api.fal.reframeImage(params)) as { images: Array<{ url: string }> }
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('fal_model', 'fal-ai/image-editing/reframe')
        scope.setExtra('payload_summary', { prompt: summarizePrompt(`Reframe to ${params.aspect_ratio}`) })
        Sentry.captureException(error)
      })
      throw error
    }
  }

  /** Kontext Edit bridge — routes to fal-ai/kontext via IPC */
  async kontextEdit(params: {
    image_url: string
    prompt: string
    width?: number
    height?: number
    aspect_ratio?: string
    output_format?: string
  }): Promise<{ images: Array<{ url: string }> }> {
    try {
      return (await window.api.fal.kontextEdit(params)) as { images: Array<{ url: string }> }
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('fal_model', 'fal-ai/kontext')
        scope.setExtra('payload_summary', { prompt: summarizePrompt(params) })
        Sentry.captureException(error)
      })
      throw error
    }
  }

  /** Generation bridge — routes to video generation via IPC */
  async generateVideo(params: {
    model: string
    prompt: string
    image_url: string
    duration: number | string
    aspect_ratio: string
    resolution?: string
    audio: boolean
    end_image_url?: string
  }): Promise<FalResponse> {
    try {
      return (await window.api.fal.generateVideo(params)) as FalResponse
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('fal_model', params.model)
        scope.setExtra('payload_summary', { prompt: summarizePrompt(params) })
        Sentry.captureException(error)
      })
      throw error
    }
  }
}

export const falService = new FalService()
