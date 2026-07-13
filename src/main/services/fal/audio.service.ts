import { FalClient } from './base'
import { AudioGenerationRequest, AudioResult } from './types'
import { sanitizeDiagnosticText } from '../../../shared/sentryPrivacy'
import { trackFalApiCall, getErrorType, estimateFalCost } from '../../analyticsService'

interface FalAudioOutput {
  audio?: { url: string }
  url?: string
  message?: string
}

export class AudioService extends FalClient {
  async generateSpeech(request: AudioGenerationRequest): Promise<AudioResult> {
    const key = await this.getApiKey()
    const t0 = Date.now()
    const MODEL_ID = 'fal-ai/elevenlabs/tts/eleven-v3'
    try {
      const response = await fetch(`https://fal.run/${MODEL_ID}`, {
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
        let errorMsg = response.statusText
        try {
          const error = await response.json()
          errorMsg = error.message || error.detail || response.statusText
        } catch {
          // Keep the HTTP status text when the provider response is not JSON.
        }
        const err = new Error(`Fal API Error: ${sanitizeDiagnosticText(errorMsg)}`)
        trackFalApiCall({ modelId: MODEL_ID, endpointCategory: 'audio_tts', durationMs: Date.now() - t0, status: 'error', errorType: getErrorType(err), estimatedCostUsd: estimateFalCost(MODEL_ID, { charsCount: request.text?.length }) })
        throw err
      }

      const data = (await response.json()) as FalAudioOutput
      trackFalApiCall({ modelId: MODEL_ID, endpointCategory: 'audio_tts', durationMs: Date.now() - t0, status: 'success', estimatedCostUsd: estimateFalCost(MODEL_ID, { charsCount: request.text?.length }) })
      return { url: data.audio?.url || data.url || '' }
    } catch (err: unknown) {
      trackFalApiCall({ modelId: MODEL_ID, endpointCategory: 'audio_tts', durationMs: Date.now() - t0, status: 'error', errorType: getErrorType(err), estimatedCostUsd: estimateFalCost(MODEL_ID, { charsCount: request.text?.length }) })
      throw err
    }
  }

  async speechToSpeech(params: Record<string, unknown>): Promise<AudioResult> {
    const key = await this.getApiKey()
    const response = await fetch('https://queue.fal.run/fal-ai/elevenlabs/voice-changer', {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const error = (await response.json()) as { message?: string }
      throw new Error(
        `Fal API Error: ${sanitizeDiagnosticText(error.message || response.statusText)}`
      )
    }

    const data = (await response.json()) as FalAudioOutput
    return {
      url: data.audio?.url || data.url || ''
    }
  }

  /**
   * STEP 1: Clone a voice from an audio sample.
   * Endpoint: fal-ai/qwen-3-tts/clone-voice/1.7b
   * Returns a `speaker_embedding` URL (safetensors file) to be used in Step 2.
   */
  async cloneVoice(params: {
    audioUrl: string
    referenceText?: string
  }): Promise<{ speakerEmbeddingUrl: string }> {
    const key = await this.getApiKey()
    const body: Record<string, unknown> = { audio_url: params.audioUrl }
    if (params.referenceText) body.reference_text = params.referenceText

    const response = await fetch('https://fal.run/fal-ai/qwen-3-tts/clone-voice/1.7b', {
      method: 'POST',
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const rawText = await response.text()
      const safeText = sanitizeDiagnosticText(rawText)
      console.error('[cloneVoice] Fal error response:', safeText)
      throw new Error(`Fal API Error (${response.status}): ${safeText}`)
    }

    const data = await response.json()
    const embeddingUrl = data?.speaker_embedding?.url || data?.url
    if (!embeddingUrl) throw new Error('No speaker embedding URL in response')

    return { speakerEmbeddingUrl: embeddingUrl }
  }

  /**
   * STEP 2: Generate speech using a speaker embedding.
   * Endpoint: fal-ai/qwen-3-tts/v1
   */
  async generateClonedSpeech(params: {
    text: string
    speakerEmbeddingUrl: string
  }): Promise<AudioResult> {
    const key = await this.getApiKey()
    const response = await fetch('https://fal.run/fal-ai/qwen-3-tts/v1', {
      method: 'POST',
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: params.text,
        speaker_embedding_url: params.speakerEmbeddingUrl
      })
    })

    if (!response.ok) {
      const rawText = await response.text()
      const safeText = sanitizeDiagnosticText(rawText)
      console.error('[generateClonedSpeech] Fal error response:', safeText)
      throw new Error(`Fal API Error (${response.status}): ${safeText}`)
    }

    const data = await response.json()
    const url = data?.audio?.url || data?.url
    if (!url) throw new Error('No audio URL in response')

    return { url }
  }

  async generateMusic(prompt: string, durationMs?: number): Promise<AudioResult> {
    const key = await this.getApiKey()
    const response = await fetch('https://fal.run/fal-ai/elevenlabs/music', {
      method: 'POST',
      headers: {
        Authorization: `Key ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        music_length_ms: durationMs ?? 10000
      })
    })

    if (!response.ok) {
      let errorMsg = response.statusText
      try {
        const error = await response.json()
        errorMsg = error.message || error.detail || response.statusText
      } catch {
        // Keep the HTTP status text when the provider response is not JSON.
      }
      throw new Error(`Fal API Error: ${sanitizeDiagnosticText(errorMsg)}`)
    }

    const data = (await response.json()) as FalAudioOutput
    return {
      url: data.audio?.url || data.url || ''
    }
  }
}
