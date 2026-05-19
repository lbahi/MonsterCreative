import { falService } from './fal.service'
import { anthropicService } from './anthropic.service'

export interface ProductShotsParams {
  productImage: string | string[]
  systemPrompt: string
  numberOfImages: number
  imageModelEndpoint: string
  aspectRatio?: string
  resolution?: string
  isVton?: boolean
  vibeDescription?: string
  modelType?: {
    label: string
    gender: string
    ageMin: number
    ageMax: number
    promptFragment: string
  }
  onProgress?: (msg: string) => void
}

/**
 * Shared service orchestrating both VTON (wearable/fashion) and Category-specific AI Shots.
 * Operates a 2-call pipeline:
 *  - Call 1: Vision LLM (Gemini 3.1 Pro) parses product/garments and returns prompts.
 *  - Call 2: Nano Banana (or selected engine) executes image generation loops.
 */
export async function generateProductShots({
  productImage,
  systemPrompt,
  numberOfImages,
  imageModelEndpoint,
  aspectRatio = '1:1',
  resolution = '1K',
  isVton = false,
  vibeDescription = 'Studio',
  modelType,
  onProgress
}: ProductShotsParams): Promise<string[]> {
  const urls = Array.isArray(productImage) ? productImage : [productImage]

  if (urls.length === 0) {
    throw new Error('Please upload at least one image.')
  }

  let prompts: string[] = []

  // ── STEP 1: Vision LLM Prompt Builder ──
  if (isVton) {
    if (onProgress) {
      onProgress('AI Casting Director analyzing ensemble...')
    }
    const ideation = await anthropicService.generateVirtualTryOnIdeas(
      urls,
      vibeDescription,
      numberOfImages,
      'google/gemini-3.1-pro-preview',
      modelType,
      aspectRatio
    )
    prompts = ideation.sceneVariations.map((scene) => `${ideation.modelPrompt} in a ${scene}`)
  } else {
    if (onProgress) {
      onProgress('Analyzing your product...')
    }
    const userContent: any[] = [
      {
        type: 'text',
        text: `Analyze the provided product image and generate exactly ${numberOfImages} distinct commercial photoshoot scene generation prompts according to the system rules. You must output a valid JSON string array of prompts: ["prompt 1", "prompt 2", ...]. Do not include any explanation or markdown block.`
      }
    ]
    userContent.push({ type: 'image_url', image_url: { url: urls[0] } })

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ]

    const response = await window.api.fal.chatCompletion(messages, 'google/gemini-3.1-pro-preview')
    if (response.error) {
      throw new Error('Failed to analyze product. Please try again.')
    }

    const raw = response.data!
    const jsonStr = raw
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    try {
      prompts = JSON.parse(jsonStr)
    } catch (e) {
      const start = jsonStr.indexOf('[')
      const end = jsonStr.lastIndexOf(']')
      if (start !== -1 && end !== -1) {
        try {
          prompts = JSON.parse(jsonStr.substring(start, end + 1))
        } catch {
          throw new Error('Failed to analyze product. Please try again.')
        }
      } else {
        throw new Error('Failed to analyze product. Please try again.')
      }
    }

    if (!Array.isArray(prompts) || prompts.length === 0) {
      throw new Error('Failed to analyze product. Please try again.')
    }
  }

  // ── STEP 2: Call Image Model N times ──
  const genImages: string[] = []
  for (let i = 0; i < prompts.length; i++) {
    if (onProgress) {
      onProgress(`Generating image ${i + 1} of ${prompts.length}...`)
    }

    let activePrompt = prompts[i]
    if (activePrompt && typeof activePrompt === 'object') {
      activePrompt = (activePrompt as any).prompt || ''
    }

    try {
      const result = await falService.nanoBananaEdit({
        model: imageModelEndpoint,
        prompt: activePrompt,
        image_urls: urls,
        resolution,
        aspect_ratio: aspectRatio,
        num_images: 1,
        output_format: 'jpeg',
        safety_tolerance: '3',
        limit_generations: true
      })
      if (result.images && result.images[0]) {
        genImages.push(result.images[0].url)
      }
    } catch (err) {
      console.error(`Image generation ${i + 1} failed:`, err)
      // Skip that image, continue with remaining prompts
    }
  }

  return genImages
}
