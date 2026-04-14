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
        return await responseWithExpand.json()
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

      const queueData = await response.json()
      const result = await this.pollVisionStatus(queueData.request_id, auth)
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

  private async pollVisionStatus(requestId: string, auth: string, maxAttempts = 60, intervalMs = 1500): Promise<any> {
    const endpoint = 'openrouter/router/vision'
    const statusUrl = `https://queue.fal.run/${endpoint}/requests/${requestId}/status`

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      const res = await fetch(statusUrl, { headers: { 'Authorization': auth, 'Accept': 'application/json' } })

      if (!res.ok) {
        throw new Error(`Polling failed (${res.status}): ${await res.text()}`)
      }

      const data = await res.json()
      if (data.status === 'COMPLETED') {
        const finalRes = await fetch(`https://queue.fal.run/${endpoint}/requests/${requestId}`, {
          headers: { 'Authorization': auth, 'Accept': 'application/json' }
        })
        return await finalRes.json()
      } else if (data.status === 'FAILED') {
        throw new Error(`Vision analysis failed on server: ${data.error}`)
      }

      await new Promise(r => setTimeout(r, intervalMs))
    }
    throw new Error('Vision polling timed out.')
  }
}


export const falService = new FalService()
