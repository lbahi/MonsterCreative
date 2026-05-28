import { FalClient } from './base'
import { AudioGenerationRequest, AudioResult } from './types'

interface FalAudioOutput {
  audio?: { url: string }
  url?: string
  message?: string
}

export class AudioService extends FalClient {
  async generateSpeech(request: AudioGenerationRequest): Promise<AudioResult> {
    const key = await this.getApiKey()
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
      let errorMsg = response.statusText
      try {
        const error = await response.json()
        errorMsg = error.message || error.detail || response.statusText
      } catch (_e) {}
      throw new Error(`Fal API Error: ${errorMsg}`)
    }


    const data = (await response.json()) as FalAudioOutput
    return {
      url: data.audio?.url || data.url || ''
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
      throw new Error(`Fal API Error: ${error.message || response.statusText}`)
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
      console.error('[cloneVoice] Fal error response:', rawText)
      throw new Error(`Fal API Error (${response.status}): ${rawText}`)
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
      console.error('[generateClonedSpeech] Fal error response:', rawText)
      throw new Error(`Fal API Error (${response.status}): ${rawText}`)
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
      } catch (_e) {}
      throw new Error(`Fal API Error: ${errorMsg}`)
    }

    const data = (await response.json()) as FalAudioOutput
    return {
      url: data.audio?.url || data.url || ''
    }
  }
}
