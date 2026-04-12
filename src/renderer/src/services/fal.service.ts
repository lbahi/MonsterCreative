/**
 * FalService - TypeScript Port
 * Identical logic to C# FalService.cs
 */

export interface FalResponse {
  request_id: string
  status?: string
  images?: Array<{ url: string; width: number; height: number }>
  video?: { url: string }
}

export class FalService {
  private readonly baseUrl = 'https://queue.fal.run'

  private async getAuthHeader(): Promise<string> {
    const key = await window.api.keystore.getFalKey()
    if (!key) throw new Error('Fal.ai API Key not found in Keystore.')
    return `Key ${key}`
  }

  /**
   * Identical polling logic: Polls until status is 'COMPLETED' or 'IN_PROGRESS' becomes too long.
   */
  private async pollStatus(requestId: string, endpoint: string): Promise<FalResponse> {
    const auth = await this.getAuthHeader()
    const pollUrl = `${this.baseUrl}/${endpoint}/requests/${requestId}`

    while (true) {
      const response = await fetch(pollUrl, {
        method: 'GET',
        headers: { 'Authorization': auth }
      })

      if (!response.ok) throw new Error(`Polling failed: ${response.statusText}`)

      const result = await response.json() as FalResponse
      
      if (result.status === 'COMPLETED') return result
      if (result.status === 'FAILED') throw new Error('Generation failed on fal.ai.')

      // Wait 2 seconds before next poll, matching C# logic
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  async generateImage(prompt: string, model: string = 'flux/pro-1.1'): Promise<FalResponse> {
    const auth = await this.getAuthHeader()
    const endpoint = `fal-ai/${model}`
    const queueUrl = `${this.baseUrl}/${endpoint}`

    const response = await fetch(queueUrl, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        image_size: 'square_hd',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false,
        output_format: 'jpeg'
      })
    })

    if (!response.ok) throw new Error(`Request failed: ${response.statusText}`)

    const queueData = await response.json() as FalResponse
    return this.pollStatus(queueData.request_id, endpoint)
  }

  async generateCopy(prompt: string): Promise<string> {
    const auth = await this.getAuthHeader()
    const endpoint = 'openrouter/router' // Per technical findings rule
    const queueUrl = `${this.baseUrl}/${endpoint}`

    const response = await fetch(queueUrl, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-405b',
        prompt,
        max_tokens: 4096
      })
    })

    if (!response.ok) throw new Error(`Text request failed: ${response.statusText}`)

    const queueData = await response.json() as FalResponse
    const finalResult = await this.pollStatus(queueData.request_id, endpoint)
    
    // In any-llm responses, the text is usually in 'output' or similar.
    // Matching the expected structure from C# findings.
    return (finalResult as any).output || (finalResult as any).text || ''
  }
}

export const falService = new FalService()
