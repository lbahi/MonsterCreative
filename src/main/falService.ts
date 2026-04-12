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

export class FalService {
  async getUsage(timeframe: string = 'day'): Promise<FalUsageResponse | { error: string }> {
    try {
      const apiKey = await keystoreService.getFalKey()
      if (!apiKey) {
        return { error: 'No Fal.ai API key found. Please configure it in Settings.' }
      }

      // We want to fetch the usage from API
      // We will expand=time_series to get bucketed stats
      // timeframe can be minute, hour, day, week, month
      const url = new URL(`${FAL_API_BASE_URL}/models/usage`)
      url.searchParams.append('expand', 'time_series')
      url.searchParams.append('limit', '100') // fetch up to 100 buckets/items if needed
      
      // Let's ask for the past week if timeframe is day
      const start = new Date()
      start.setDate(start.getDate() - 7)
      url.searchParams.append('start', start.toISOString())
      url.searchParams.append('timeframe', timeframe)

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

      const url = new URL(`${FAL_API_BASE_URL}/account/billing`)
      url.searchParams.append('expand', 'credits')

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

      return await response.json()
    } catch (err: any) {
      return { error: `Network connection failed: ${err.message}` }
    }
  }
}


export const falService = new FalService()
