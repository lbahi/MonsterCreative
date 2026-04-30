import { FalClient } from './base'

export class ImageService extends FalClient {
  /**
   * Uploads a base64 data URL to fal.media CDN.
   * Called from the renderer via IPC — the main process handles it
   * because Electron's renderer security blocks direct requests to fal.media.
   */
  async uploadImageFromDataUrl(dataUrl: string): Promise<{ url?: string; error?: string }> {
    try {
      const apiKey = await this.getApiKey()

      // Parse the data URL: data:<mime>;base64,<data>
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) return { error: 'Invalid data URL format.' }

      const mime = matches[1]
      const base64Data = matches[2]
      const buffer = Buffer.from(base64Data, 'base64')
      const ext = mime.split('/')[1] || 'jpg'
      const fileName = `upload.${ext}`
      const authVariants = [`Bearer ${apiKey}`, `Key ${apiKey}`]
      const bodyVariants: Array<{ label: string; body: any }> = [
        { label: 'blob', body: new Blob([buffer], { type: mime }) },
        { label: 'buffer', body: buffer }
      ]

      const failures: string[] = []

      for (const auth of authVariants) {
        for (const bodyVariant of bodyVariants) {
          try {
            const response = await fetch('https://fal.media/files/upload', {
              method: 'POST',
              headers: {
                'Authorization': auth,
                'X-Fal-File-Name': fileName,
                'Content-Type': mime,
                'Accept': 'application/json'
              },
              body: bodyVariant.body
            })

            if (!response.ok) {
              const errBody = await response.text()
              failures.push(`auth=${auth.startsWith('Bearer') ? 'Bearer' : 'Key'} body=${bodyVariant.label} status=${response.status} body=${errBody.slice(0, 160)}`)
              continue
            }

            const data = await response.json() as any
            const accessUrl = (data.access_url as string | undefined)?.replace(/ /g, '%20')
            if (accessUrl) {
              return { url: accessUrl }
            }

            failures.push(`auth=${auth.startsWith('Bearer') ? 'Bearer' : 'Key'} body=${bodyVariant.label} missing access_url`)
          } catch (err: any) {
            failures.push(`auth=${auth.startsWith('Bearer') ? 'Bearer' : 'Key'} body=${bodyVariant.label} error=${err?.message ?? 'unknown'}`)
          }
        }
      }

      return {
        error: `CDN upload failed after retries. ${failures.join(' | ')}`
      }
    } catch (err: any) {
      return { error: `Upload error: ${err.message}` }
    }
  }

  /**
   * Nano Banana 2 Specialized Handler
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
  }): Promise<any> {
    // auth is handled by request() method

    let endpoint = '';
    let body: any = {};

    if (params.model === 'Seedream V4.5 Edit') {
      endpoint = 'fal-ai/bytedance/seedream/v4.5/edit';
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        image_size: params.resolution === '4K' ? 'auto_4K' : undefined,
        num_images: params.num_images || 1,
        max_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        enable_safety_checker: true
      };
    } else if (params.model === 'Nano Banana Pro') {
      endpoint = 'fal-ai/nano-banana-pro/edit';
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
        limit_generations: params.limit_generations ?? true
      };
    } else if (params.model === 'Nano Banana 2') {
      endpoint = 'fal-ai/nano-banana-2/edit';
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        aspect_ratio: params.aspect_ratio || 'auto',
        num_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        output_format: params.output_format || 'png',
        safety_tolerance: params.safety_tolerance || '4',
        limit_generations: params.limit_generations ?? true
      };
    } else if (params.model === 'Nano Banana') {
      endpoint = 'fal-ai/nano-banana/edit';
      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        aspect_ratio: params.aspect_ratio || 'auto',
        num_images: params.num_images || 1,
        seed: params.seed ? parseInt(params.seed) : undefined,
        output_format: params.output_format || 'png',
        safety_tolerance: params.safety_tolerance || '4',
        limit_generations: params.limit_generations ?? true
      };
    } else if (params.model === 'GPT Image 2') {
      endpoint = 'openai/gpt-image-2/edit';
      
      // Map standard ratios to GPT Image 2 enums
      let gptImageSize = 'auto';
      const ratio = params.aspect_ratio || 'auto';
      if (ratio === '1:1') gptImageSize = 'square';
      else if (ratio === '4:3') gptImageSize = 'landscape_4_3';
      else if (ratio === '3:4') gptImageSize = 'portrait_4_3';
      else if (ratio === '16:9') gptImageSize = 'landscape_16_9';
      else if (ratio === '9:16') gptImageSize = 'portrait_16_9';
      else if (ratio === 'auto') gptImageSize = 'auto';

      body = {
        prompt: params.prompt,
        image_urls: params.image_urls,
        image_size: gptImageSize,
        quality: 'high',
        num_images: params.num_images || 1,
        output_format: params.output_format || 'png'
      };
    }

    const response = await this.request(`https://fal.run/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Generation request failed (${response.status}): ${errText}`);
    }

    return await response.json();
  }

  /**
   * Smart Reframe — fal-ai/image-editing/reframe
   * Returns a normalized { images: [{ url }] } shape regardless of API response format.
   */
  async reframeImage(params: {
    image_url: string;
    aspect_ratio: string;
    output_format?: string;
    guidance_scale?: number;
    num_inference_steps?: number;
  }): Promise<any> {
    const body = {
      image_url: params.image_url,
      aspect_ratio: params.aspect_ratio,
      output_format: params.output_format ?? 'jpeg',
      guidance_scale: params.guidance_scale ?? 3.5,
      num_inference_steps: params.num_inference_steps ?? 30,
    };

    const response = await this.request('https://fal.run/fal-ai/image-editing/reframe', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Reframe failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    console.log('[reframeImage] raw response:', JSON.stringify(data).slice(0, 400));

    // Normalize: API may return { image: {...} } OR { images: [...] }
    const url: string | undefined =
      data?.image?.url ??
      data?.images?.[0]?.url ??
      data?.output?.image?.url ??
      data?.output?.images?.[0]?.url;

    if (!url) throw new Error(`Reframe: no image URL in response. Keys: ${Object.keys(data).join(', ')}`);
    return { images: [{ url }] };
  }

  /**
   * FLUX.1 Kontext Pro — fal-ai/flux-pro/kontext
   * Contextual image transformation with optional explicit width/height
   * for non-standard (non-enum) target dimensions.
   */
  async kontextEdit(params: {
    image_url: string;
    prompt: string;
    aspect_ratio?: string;   // standard enum formats
    width?: number;           // non-standard; takes precedence if provided
    height?: number;          // non-standard; takes precedence if provided
    output_format?: string;
    num_images?: number;
  }): Promise<any> {
    const body: any = {
      image_url: params.image_url,
      prompt: params.prompt,
      output_format: params.output_format ?? 'jpeg',
      num_images: params.num_images ?? 1,
    };

    // Prefer explicit dimensions for non-standard ratios; fall back to enum
    if (params.width && params.height) {
      body.width = params.width;
      body.height = params.height;
    } else if (params.aspect_ratio) {
      body.aspect_ratio = params.aspect_ratio;
    }

    const response = await this.request('https://fal.run/fal-ai/flux-pro/kontext', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Kontext edit failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    console.log('[kontextEdit] raw response:', JSON.stringify(data).slice(0, 400));

    // Normalize: API may return { images: [...] } or { image: {...} }
    const url: string | undefined =
      data?.images?.[0]?.url ??
      data?.image?.url ??
      data?.output?.images?.[0]?.url;

    if (!url) throw new Error(`Kontext: no image URL in response. Keys: ${Object.keys(data).join(', ')}`);
    return { images: [{ url }] };
  }
}
