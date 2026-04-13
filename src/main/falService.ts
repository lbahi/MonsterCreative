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
   * Uploads an image (as base64) to fal.ai CDN storage.
   * Returns the publicly accessible CDN URL for use with vision models.
   *
   * Flow: POST initiate → PUT binary → return file_url
   */
  async uploadImage(base64Data: string, fileName: string, contentType: string): Promise<{ url?: string; error?: string }> {
    try {
      const apiKey = await keystoreService.getFalKey()
      if (!apiKey) return { error: 'No Fal.ai API key found.' }

      // Step 1: Initiate the upload to get a presigned URL
      const initRes = await fetch('https://rest.alpha.fal.ai/storage/upload/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          file_name: fileName,
          content_type: contentType
        })
      })

      if (!initRes.ok) {
        const errBody = await initRes.text()
        return { error: `Storage initiate failed (${initRes.status}): ${errBody}` }
      }

      const { file_url, upload_url } = await initRes.json()

      // Step 2: Upload the raw binary to the presigned URL
      const buffer = Buffer.from(base64Data, 'base64')
      const uploadRes = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: buffer
      })

      if (!uploadRes.ok) {
        return { error: `Storage upload failed (${uploadRes.status}): ${uploadRes.statusText}` }
      }

      return { url: file_url }
    } catch (err: any) {
      return { error: `Image upload failed: ${err.message}` }
    }
  }
}


export const falService = new FalService()
