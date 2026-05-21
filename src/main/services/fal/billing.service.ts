import { FalClient } from './base'
import { ValidationResult, FalUsageResponse } from './types'

export class BillingService extends FalClient {
  /**
   * Smoke-tests a key BEFORE saving it. Hits the billing endpoint directly.
   * Returns { valid: true, credits, currency } on success, or { valid: false, error } on failure.
   */
  async validateKey(key: string): Promise<ValidationResult> {
    try {
      const url = new URL('https://api.fal.ai/v1/account/billing')
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
    } catch (err: unknown) {
      return { valid: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  async getPricing(endpointIds: string[]): Promise<unknown | { error: string }> {
    try {
      const url = new URL('https://api.fal.ai/v1/models/pricing')
      endpointIds.forEach((id) => url.searchParams.append('endpoint_id', id))

      const response = await this.request(url.toString())

      if (!response.ok) {
        return { error: `Pricing API Error (${response.status}): ${response.statusText}` }
      }
      return await response.json()
    } catch (err: unknown) {
      return { error: `Network error: ${err instanceof Error ? err.message : String(err)}` }
    }
  }

  async getAnalytics(
    endpointIds: string[],
    start?: string,
    end?: string
  ): Promise<unknown | { error: string }> {
    try {
      const url = new URL('https://api.fal.ai/v1/models/analytics')
      endpointIds.forEach((id) => url.searchParams.append('endpoint_id', id))
      url.searchParams.append('expand', 'time_series')
      url.searchParams.append('expand', 'summary')
      url.searchParams.append('expand', 'request_count')
      url.searchParams.append('expand', 'success_count')
      url.searchParams.append('expand', 'p50_duration')
      url.searchParams.append('expand', 'p90_duration')

      const s =
        start ??
        (() => {
          const d = new Date()
          d.setDate(1)
          d.setHours(0, 0, 0, 0)
          return d.toISOString()
        })()
      url.searchParams.append('start', s)
      if (end) url.searchParams.append('end', end)

      const response = await this.request(url.toString())

      if (!response.ok) {
        const errJson = (await response.json().catch(() => ({}))) as Record<string, any>
        return {
          error: `Analytics API Error (${response.status}): ${errJson.error?.message || response.statusText}`
        }
      }
      return await response.json()
    } catch (err: unknown) {
      return { error: `Network error: ${err instanceof Error ? err.message : String(err)}` }
    }
  }

  async getUsage(
    timeframe = 'day',
    start?: string,
    end?: string
  ): Promise<FalUsageResponse | { error: string }> {
    try {
      const url = new URL('https://api.fal.ai/v1/models/usage')
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

      const response = await this.request(url.toString())

      if (!response.ok) {
        const errJson = (await response.json().catch(() => ({}))) as any
        const errMsg = errJson.error?.message || response.statusText
        return { error: `Fal API Error (${response.status}): ${errMsg}` }
      }

      const data = await response.json()
      return data as FalUsageResponse
    } catch (err: unknown) {
      return { error: `Network connection failed: ${(err as Error).message}` }
    }
  }

  async getBilling(): Promise<unknown | { error: string }> {
    try {
      const apiKey = await this.getApiKey()

      // Try 1: with expand=credits (full billing data)
      const urlWithExpand = new URL('https://api.fal.ai/v1/account/billing')
      urlWithExpand.searchParams.append('expand', 'credits')

      const responseWithExpand = await fetch(urlWithExpand.toString(), {
        method: 'GET',
        headers: { Authorization: `Key ${apiKey}`, Accept: 'application/json' }
      })

      if (responseWithExpand.ok) {
        const payload = await responseWithExpand.json()
        return payload
      }

      // Try 2: plain billing endpoint without expand
      if (responseWithExpand.status === 403 || responseWithExpand.status === 400) {
        const urlPlain = new URL('https://api.fal.ai/v1/account/billing')
        const responsePlain = await fetch(urlPlain.toString(), {
          method: 'GET',
          headers: { Authorization: `Key ${apiKey}`, Accept: 'application/json' }
        })

        if (responsePlain.ok) {
          return await responsePlain.json()
        }

        // 403 on billing = key is valid but has no billing read scope
        if (responsePlain.status === 403 || responseWithExpand.status === 403) {
          return { billing_restricted: true }
        }
      }

      const errJson = (await responseWithExpand.json().catch(() => ({}))) as any
      const errMsg = errJson.error?.message || responseWithExpand.statusText
      return { error: `Fal API Error (${responseWithExpand.status}): ${errMsg}` }
    } catch (err: unknown) {
      return { error: `Network connection failed: ${(err as Error).message}` }
    }
  }
}
