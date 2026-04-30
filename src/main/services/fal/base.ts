import { keystoreService } from '../../keystore'

export class FalClient {
  protected async getApiKey(): Promise<string> {
    const apiKey = await keystoreService.getFalKey()
    if (!apiKey) throw new Error('No Fal.ai API key found. Please configure it in Settings.')
    return apiKey
  }

  protected async request(url: string, options: RequestInit = {}): Promise<Response> {
    const apiKey = await this.getApiKey()
    const headers = {
      Authorization: `Key ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    }

    return fetch(url, {
      ...options,
      headers
    })
  }

  protected async pollStatus(
    requestId: string,
    endpoint: string,
    maxAttempts = 60,
    auth: string
  ): Promise<any> {
    const resultUrl = `https://queue.fal.run/${endpoint}/requests/${requestId}`

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const res = await fetch(resultUrl, {
        method: 'GET',
        headers: { Authorization: auth }
      })

      if (!res.ok) throw new Error(`Polling failed: ${res.statusText}`)

      const data = (await res.json()) as any

      if (data.status === 'COMPLETED') {
        return data
      } else if (data.status === 'FAILED') {
        const error = data.error || 'Unknown error'
        throw new Error(`Generation failed: ${error}`)
      } else {
        // IN_QUEUE or IN_PROGRESS
        continue
      }
    }

    throw new Error(`Timed out after ${maxAttempts * 2} seconds`)
  }
}
