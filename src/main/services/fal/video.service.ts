import { FalClient } from './base'
import { VideoGenerationRequest, VideoGenerationResult } from './types'

interface FalVideoOutput {
  video?: { url: string; file_name?: string; file_size?: number }
  output?: { video?: { url: string; file_name?: string; file_size?: number } }
  data?: { video?: { url: string; file_name?: string; file_size?: number } }
  url?: string
  file_name?: string
  file_size?: number
}

export class VideoService extends FalClient {
  /**
   * Universal Video Generation Handler
   * Consolidates endpoint logic and uses model-specific payload builders.
   */
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const apiKey = await this.getApiKey()
    const { modelId } = request
    console.log(`[VideoService:generateVideo] Targeting model: ${modelId}`)

    // 1. Configurable Endpoints
    const directRunEndpoint = `https://fal.run/${modelId}`
    const queueEndpoint = `https://queue.fal.run/${modelId}`
    const genericQueueBase = `https://queue.fal.run`

    // 2. Build Model-Specific Payload
    const payload = this.buildVideoPayload(request)
    console.log(`[VideoService:generateVideo] Payload prepared for ${modelId}`)


    const toVideoResult = (data: unknown): VideoGenerationResult | null => {
      const d = data as FalVideoOutput
      const video = d?.video ?? d?.output?.video ?? d?.data?.video
      const url = video?.url ?? d?.url
      if (!url) return null

      return {
        url,
        fileName: video?.file_name ?? d?.file_name ?? 'output.mp4',
        fileSize: video?.file_size ?? d?.file_size ?? 0
      }
    }

    // --- EXECUTION: PRIMARY PATH (Direct Run) ---
    try {
      const runRes = await fetch(directRunEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (runRes.ok) {
        const runData = await runRes.json()
        const parsed = toVideoResult(runData)
        if (parsed) {
          console.log(`[VideoService:generateVideo] Direct run success for ${modelId}`)
          return parsed
        }
      }
    } catch (err) {
      console.warn(
        `[VideoService:generateVideo] Direct run failed for ${modelId}, falling back to queue.`,
        err
      )
    }

    // --- EXECUTION: FALLBACK PATH (Queue + Polling) ---
    const queueSubmit = await fetch(queueEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!queueSubmit.ok) {
      const errBody = await queueSubmit.text()
      throw new Error(`[${modelId}] Submit failed (${queueSubmit.status}): ${errBody}`)
    }

    const { request_id } = await queueSubmit.json()
    if (!request_id) throw new Error(`[${modelId}] No request_id returned from queue submit`)
    console.log(`[VideoService:generateVideo] Queued: ${request_id}`)

    const statusUrls = [
      `${queueEndpoint}/requests/${request_id}/status`,
      `${genericQueueBase}/requests/${request_id}/status`
    ]
    const resultUrls = [
      `${queueEndpoint}/requests/${request_id}`,
      `${genericQueueBase}/requests/${request_id}`
    ]

    // Unified Poller
    let attempts = 0
    const maxAttempts = 60 // 5 minutes at 5s intervals
    const auth = `Key ${apiKey}`

    while (attempts < maxAttempts) {
      // Check status
      for (const sUrl of statusUrls) {
        try {
          const sRes = await fetch(sUrl, { headers: { Authorization: auth } })
          if (sRes.ok) {
            const sData = await sRes.json()
            if (sData.status === 'COMPLETED') {
              // Try to get result
              for (const rUrl of resultUrls) {
                const rRes = await fetch(rUrl, { headers: { Authorization: auth } })
                if (rRes.ok) {
                  const rData = await rRes.json()
                  const parsed = toVideoResult(rData)
                  if (parsed) return parsed
                }
              }
            }
          }
        } catch (e) {
          /* ignore individual poll failure */
        }
      }

      await new Promise((r) => setTimeout(r, 5000))
      attempts++
    }

    throw new Error(`[${modelId}] Polling timed out after 5 minutes.`)
  }

  /**
   * Model-Specific Payload Mapping
   */
  private buildVideoPayload(request: VideoGenerationRequest): Record<string, unknown> {
    const { modelId } = request

    const base: Record<string, unknown> = {
      prompt: request.prompt,
      resolution: request.resolution,
      duration: request.duration
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
        duration: String(request.duration), // Pixverse v6 expects string "5" or "10"
        image_url: request.imageUrl,
        generate_audio_switch: request.audio,
        thinking_type: 'disabled'
      }
    }

    // Kling Mapping (Primary)
    if (modelId.includes('kling')) {
      const klingPayload: Record<string, unknown> = {
        ...base,
        // Passing the numeric duration directly to allow for precision
        duration: request.duration,
        start_image_url: request.imageUrl,
        generate_audio: request.audio
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
      generate_audio: request.audio
    }
  }
}
