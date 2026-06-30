import { FalClient } from './base'
import { sanitizeDiagnosticText } from '../../../shared/sentryPrivacy'

interface FalQueueResponse {
  request_id: string
}

interface FalVisionResult {
  output?: string
}

interface FalChatCompletionResponse {
  choices?: Array<{
    finish_reason?: string
    message?: {
      content?: string
      reasoning_content?: string
    }
  }>
}

export class TextService extends FalClient {
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
      const apiKey = await this.getApiKey()
      const auth = `Key ${apiKey}`
      const queueUrl = 'https://queue.fal.run/openrouter/router/vision'

      const body: Record<string, unknown> = {
        image_urls: [imageUrl],
        prompt,
        system_prompt: systemPrompt,
        model: modelId,
        max_tokens: maxTokens
      }

      const response = await fetch(queueUrl, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errBody = await response.text()
        return {
          error: `Vision queue submit failed (${response.status}): ${sanitizeDiagnosticText(errBody)}`
        }
      }

      const queueData = (await response.json()) as FalQueueResponse
      const result = (await this.pollStatus(
        queueData.request_id,
        'openrouter/router/vision',
        120,
        auth
      )) as FalVisionResult
      // The vision endpoint returns { output: string, usage: {...} }
      return { data: result?.output ?? JSON.stringify(result) }
    } catch (err: unknown) {
      return { error: `Network error: ${(err as Error).message}` }
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
    messages: unknown[],
    modelId: string,
    maxTokens = 4096
  ): Promise<{ data?: string; error?: string }> {
    try {
      const response = await this.request(
        'https://fal.run/openrouter/router/openai/v1/chat/completions',
        {
          method: 'POST',
          body: JSON.stringify({
            model: modelId,
            messages,
            max_tokens: maxTokens
          })
        }
      )

      if (!response.ok) {
        const errBody = await response.text()
        return {
          error: `Chat completion failed (${response.status}): ${sanitizeDiagnosticText(errBody)}`
        }
      }

      const data = (await response.json()) as FalChatCompletionResponse
      // Standard OpenAI response format
      // Some models (e.g. Gemini thinking) may put content in reasoning_content
      const choice = data?.choices?.[0]
      const text = choice?.message?.content
        || choice?.message?.reasoning_content
        || ''
      console.log('[TextService] chatCompletion model:', modelId, 'finish_reason:', choice?.finish_reason)
      if (!text) {
        console.error('[TextService] Empty content response')
      }
      return { data: text }
    } catch (err: unknown) {
      return { error: `Network error: ${(err as Error).message}` }
    }
  }

  /**
   * Backward-compatible wrapper.
   * String prompt → wraps in a user message → calls chatCompletion.
   * Message array → calls chatCompletion directly.
   */
  async generateCopy(
    promptOrMessages: string | unknown[],
    modelId: string,
    maxTokens = 4096
  ): Promise<{ data?: string; error?: string }> {
    const messages = Array.isArray(promptOrMessages)
      ? promptOrMessages
      : [{ role: 'user', content: promptOrMessages }]
    return this.chatCompletion(messages, modelId, maxTokens)
  }
}
