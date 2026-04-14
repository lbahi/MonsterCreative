/**
 * FalService - TypeScript Port
 * Identical logic to C# FalService.cs
 * Uses fal.ai queue + openrouter/router for LLM calls
 */

export interface FalResponse {
  request_id: string
  status?: string
  images?: Array<{ url: string; width: number; height: number }>
  video?: { url: string }
}

export interface CopyVariant {
  variantType: string
  headline1: string
  headline2: string
  headline3: string
  hook: string
  bodyCopy: string
  cta: string
  triggersUsed: string
  landingPagePart?: string
  videoScripts?: string
}

export class FalService {
  private readonly baseUrl = 'https://queue.fal.run'

  private async getAuthHeader(): Promise<string> {
    const key = await window.api.keystore.getFalKey()
    if (!key) throw new Error('Fal.ai API Key not found in Keystore.')
    return `Key ${key}`
  }

  /**
   * Polls the fal.ai queue until status is COMPLETED or FAILED.
   * Matches the C# PollAsync logic exactly.
   */
  private async pollStatus(requestId: string, endpoint: string, maxAttempts = 60): Promise<any> {
    const auth = await this.getAuthHeader()
    const statusUrl = `${this.baseUrl}/${endpoint}/requests/${requestId}/status`
    const resultUrl = `${this.baseUrl}/${endpoint}/requests/${requestId}`

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const statusRes = await fetch(statusUrl, {
        method: 'GET',
        headers: { 'Authorization': auth }
      })

      if (!statusRes.ok) throw new Error(`Polling failed: ${statusRes.statusText}`)

      const statusData = await statusRes.json()

      switch (statusData.status) {
        case 'COMPLETED': {
          // Fetch the full result from the result endpoint (matching C# pattern)
          const resultRes = await fetch(resultUrl, {
            method: 'GET',
            headers: { 'Authorization': auth }
          })
          if (!resultRes.ok) throw new Error(`Result fetch failed: ${resultRes.statusText}`)
          return await resultRes.json()
        }
        case 'FAILED': {
          const error = statusData.error || 'Unknown error'
          throw new Error(`Generation failed: ${error}`)
        }
        case 'IN_QUEUE':
        case 'IN_PROGRESS':
          continue
      }
    }

    throw new Error(`Timed out after ${maxAttempts * 2} seconds`)
  }

  /**
   * Extracts the raw LLM text output from the fal.ai openrouter/router result.
   * Mirrors the C# ExtractLlmOutput method exactly.
   */
  private extractLlmOutput(result: any): string {
    let output = ''

    // Shape: { "output": "...text..." }
    if (typeof result.output === 'string') {
      output = result.output
    }

    // Shape: { "output": { "text": "..." } }
    if (!output && result.output && typeof result.output === 'object' && result.output.text) {
      output = result.output.text
    }

    // Shape: { "text": "..." }
    if (!output && typeof result.text === 'string') {
      output = result.text
    }

    // Shape: { "choices": [{ "message": { "content": "..." } }] } (Standard OpenAI/OpenRouter)
    if (!output && result.choices && result.choices[0]?.message?.content) {
      output = result.choices[0].message.content
    }

    // Shape: { "choices": [{ "text": "..." }] } (Older Completion API)
    if (!output && result.choices && result.choices[0]?.text) {
      output = result.choices[0].text
    }

    // Fallback to entire JSON body
    if (!output) {
      output = JSON.stringify(result)
    }

    return output
  }

  /**
   * "Monster Search" — extract the JSON array from potentially chatty LLM output.
   * Finds the first [ and last ] to survive any preamble/postamble.
   */
  private extractJsonArray(text: string): string {
    // Strip markdown code fences
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    const firstBracket = cleaned.indexOf('[')
    const lastBracket = cleaned.lastIndexOf(']')

    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      return cleaned.substring(firstBracket, lastBracket + 1)
    }

    // Fallback: try object extraction
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return '[' + cleaned.substring(firstBrace, lastBrace + 1) + ']'
    }

    return cleaned
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

  /**
   * Nano Banana 2 Specialized Handler
   * polymorphic method that supports NB2, FLUX, and Qwen schemas.
   */
  async nanoBananaEdit(params: {
    model: string,
    prompt: string,
    image_urls: string[],
    resolution?: string,
    aspect_ratio?: string,
    num_images?: number,
    seed?: string,
    output_format?: string,
    safety_tolerance?: string,
    thinking_level?: string,
    enable_web_search?: boolean,
    limit_generations?: boolean
  }): Promise<FalResponse> {
    const auth = await this.getAuthHeader();
    let endpoint = '';
    let body: any = {};

    // 1. Determine Endpoint and Map Schemas
    if (params.model === 'Nano Banana 2') {
      endpoint = 'fal-ai/nano-banana-2/edit';
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        resolution: params.resolution || '1K',
        aspect_ratio: params.aspect_ratio || 'auto',
        num_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        output_format: params.output_format || 'png',
        safety_tolerance: params.safety_tolerance || '4',
        enable_web_search: params.enable_web_search || false,
        thinking_level: params.thinking_level || undefined,
        limit_generations: params.limit_generations ?? true
      };
    } else if (params.model === 'FLUX.2') {
      endpoint = 'fal-ai/flux-2/flash/edit';
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls.slice(0, 1), // Flux flash edit takes 1 image usually
        num_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        output_format: params.output_format || 'png',
        image_size: params.aspect_ratio === '1:1' ? 'square_hd' : params.aspect_ratio === '16:9' ? 'landscape_4_3' : 'square_hd', // simple mapping for now
        enable_safety_checker: true
      };
    } else if (params.model === 'Qwen Image') {
      endpoint = 'fal-ai/qwen-image-2/pro/edit';
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        num_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        output_format: params.output_format || 'png',
        enable_safety_checker: true,
        enable_prompt_expansion: true
      };
    }

    const queueUrl = `${this.baseUrl}/${endpoint}`;
    const response = await fetch(queueUrl, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Generation request failed (${response.status}): ${errText}`);
    }

    const queueData = await response.json() as FalResponse;
    return this.pollStatus(queueData.request_id, endpoint);
  }

  /**
   * Sends a prompt to an LLM via fal.ai's openrouter/router bridge.
   * Mirrors the C# AnthropicService.GenerateCopyAsync queue + poll pattern.
   *
   * @param prompt - The full system prompt
   * @param modelId - OpenRouter model ID (e.g. 'google/gemini-3-pro', 'anthropic/claude-opus-4-20250514')
   * @param maxTokens - Max tokens for the response
   * @returns Raw text output from the LLM
   */
  async generateCopy(promptOrMessages: string | any[], modelId: string = 'google/gemini-3-pro', maxTokens: number = 4096): Promise<string> {
    const response = await window.api.fal.generateCopy(promptOrMessages, modelId);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    // response.data is already the extracted plain text from chatCompletion
    return response.data ?? '';
  }

  /**
   * High-level method: generates ad copy variants and parses them into structured objects.
   * Combines generateCopy + Monster Search JSON extraction + parsing.
   */
  async generateAdCopyVariants(prompt: string, modelId: string): Promise<CopyVariant[]> {
    const rawOutput = await this.generateCopy(prompt, modelId)
    const jsonString = this.extractJsonArray(rawOutput)

    try {
      const parsed = JSON.parse(jsonString)
      const variants: CopyVariant[] = Array.isArray(parsed) ? parsed : [parsed]
      return variants
    } catch (e: any) {
      console.error('Failed to parse LLM JSON response:', e.message)
      console.error('Raw output:', rawOutput)
      throw new Error(`Failed to parse LLM response: ${e.message}`)
    }
  }

  /**
   * Uploads an image directly from the renderer using the native File object.
   * Eliminates the need to base64 encode and bypasses Node.js native fetch Buffer bugs.
   */
  async uploadImage(file: File): Promise<{ url?: string; error?: string }> {
    try {
      const apiKey = await window.api.keystore.getFalKey()
      if (!apiKey) return { error: 'No Fal.ai API key found.' }

      const response = await fetch('https://fal.media/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Fal-File-Name': file.name,
          'Content-Type': file.type,
          'Accept': 'application/json'
        },
        body: file
      })

      if (!response.ok) {
        const errBody = await response.text()
        return { error: `CDN upload failed (${response.status}): ${errBody}` }
      }

      const data = await response.json()
      let accessUrl = data.access_url
      if (accessUrl) {
        accessUrl = accessUrl.replace(/ /g, '%20')
      }

      return { url: accessUrl }
    } catch (err: any) {
      return { error: `Image upload failed: ${err.message}` }
    }
  }
  async uploadImageFromDataUrl(dataUrl: string): Promise<{ url?: string; error?: string }> {
    try {
      // Convert data URL to Blob
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const ext = blob.type.split('/')[1] || 'jpg'
      const file = new File([blob], `product.${ext}`, { type: blob.type })
      return this.uploadImage(file)
    } catch (err: any) {
      return { error: `Failed to convert image: ${err.message}` }
    }
  }
}

export const falService = new FalService()
