import { FalClient } from './base'

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
      const response = await this.request('https://fal.run/openrouter/router/openai/v1/chat/completions', {
        method: 'POST',
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
}
