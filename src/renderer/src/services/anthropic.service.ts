import { falService, CopyVariant } from './fal.service'
import {
  ChatMessage,
  ConsultationResponse,
  VtonIdeationResponse,
  ProductAnalysis,
  OneShotResult,
  ContentStrategyResult
} from './anthropic.types'
import { getContentStrategyPrompt } from './prompts/contentStrategy'
import { getProductAnalysisPrompt } from './prompts/productAnalysis'
import { getConsultationPrompt } from './prompts/consultation'
import { getFinalMarketingPlanPrompt } from './prompts/finalMarketingPlan'
import { getVtonIdeationPrompt } from './prompts/vtonIdeation'
import { getGarmentAnalysisPrompt } from './prompts/garmentAnalysis'

export class AnthropicService {
  // resolveModelId removed

  /**
   * ONE-SHOT: Analyzes the product image AND generates the full content plan
   * in a single API call. The AI self-determines: audience, price tier, platforms.
   */
  async generatePlanFromImage(
    dataUrl: string,
    selectedModel: string = 'google/gemini-2.5-flash',
    targetLanguage: string = 'arabic'
  ): Promise<OneShotResult> {
    const langInstruction =
      targetLanguage === 'arabic'
        ? 'باللغة العربية'
        : targetLanguage === 'french'
          ? 'en Français'
          : 'in English'

    const systemPrompt = getContentStrategyPrompt(langInstruction)

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `حلّل هذا المنتج وأنشئ خطة التسويق الكاملة. MUST BE WRITTEN IN ${targetLanguage.toUpperCase()}`
          },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }
    ]

    const response = await window.api.fal.chatCompletion(messages, selectedModel)
    if (response.error) throw new Error(response.error)

    const raw = response.data!
    const jsonStr = raw
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()
    const start = jsonStr.indexOf('{')
    const end = jsonStr.lastIndexOf('}')
    const parsed = JSON.parse(jsonStr.substring(start, end + 1))

    return {
      analysis: parsed.analysis as ProductAnalysis,
      variants: parsed.variants as CopyVariant[]
    }
  }

  /**
   * @deprecated Use generatePlanFromImage instead.
   * Kept for backward compatibility with other screens.
   */
  async analyzeProductImage(
    dataUrl: string,
    selectedModel: string = 'google/gemini-2.5-flash'
  ): Promise<ProductAnalysis> {
    const systemPrompt = getProductAnalysisPrompt()

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'حلل هذا المنتج وأخرج JSON التشخيص التسويقي.' },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }
    ]

    const response = await window.api.fal.chatCompletion(messages, selectedModel)
    if (response.error) throw new Error(response.error)

    const jsonStr = response
      .data!.replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()
    return JSON.parse(jsonStr) as ProductAnalysis
  }

  /**
   * Phase 2: The Proactive Strategist.
   * Makes intelligent suggestions based on the product analysis, then confirms
   * or refines with the user. Collects: Audience, Price, Platforms, Video Content.
   * Does NOT ask — it SUGGESTS and asks the user to confirm.
   */
  async getNextConsultationQuestion(
    history: ChatMessage[],
    productInfo: ProductAnalysis,
    selectedModel: string = 'google/gemini-2.5-flash'
  ): Promise<ConsultationResponse> {
    const systemPrompt = getConsultationPrompt(productInfo)

    // Gemini requires: system → user → assistant → user → ...
    // We inject a synthetic trigger user message so history always follows a valid turn pattern.
    // Without this, system → assistant → user causes Gemini to ignore prior turns.
    const triggerMessage = {
      role: 'user' as const,
      content: `المنتج: ${productInfo.product} | الفئة: ${productInfo.category} | الميزات: ${productInfo.features?.join('، ')}. ابدأ جلسة الاستراتيجية.`
    }

    const messages = [{ role: 'system', content: systemPrompt }, triggerMessage, ...history]

    const response = await window.api.fal.chatCompletion(messages, selectedModel)
    if (response.error) throw new Error(response.error)

    const jsonStr = response
      .data!.replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()
    return JSON.parse(jsonStr) as ConsultationResponse
  }

  /**
   * Final Step: Synthesis.
   * Generates the multi-variant content plan from the entire consultation.
   */
  async generateFinalMarketingPlan(
    history: ChatMessage[],
    productInfo: ProductAnalysis,
    selectedModel: string = 'google/gemini-2.5-pro'
  ): Promise<ContentStrategyResult> {
    const transcript = history
      .map(
        (m) =>
          `${m.role.toUpperCase()}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`
      )
      .join('\n')

    const prompt = getFinalMarketingPlanPrompt(transcript, productInfo)

    const rawOutput = await falService.generateCopy(prompt, selectedModel)

    let jsonString = rawOutput
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()
    const firstBracket = jsonString.indexOf('[')
    const lastBracket = jsonString.lastIndexOf(']')
    if (firstBracket !== -1 && lastBracket !== -1) {
      jsonString = jsonString.substring(firstBracket, lastBracket + 1)
    }

    try {
      const parsed = JSON.parse(jsonString)
      const variants: CopyVariant[] = Array.isArray(parsed) ? parsed : [parsed]
      return { variants, rawOutput }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e))
      throw new Error(`Failed to parse final plan JSON: ${err.message}`)
    }
  }

  /**
   * Simple ad copy generation (Compatibility helper).
   */
  async generateAdCopy(
    campaignName: string,
    platforms: string[],
    tone: string,
    modelId?: string
  ): Promise<string> {
    const prompt = `Generate 3 ad copy variations for ${campaignName} on ${platforms.join(', ')} with a ${tone} tone. Return JSON array with keys: variant, headline, hook, body, cta.`
    return await falService.generateCopy(prompt, modelId || 'google/gemini-2.0-flash-001')
  }

  /**
   * The "AI Casting Director" logic for VTON and campaign imagery.
   */
  async getGarmentAnalysis(description: string): Promise<string> {
    const prompt = getGarmentAnalysisPrompt(description)
    return await falService.generateCopy(prompt, 'google/gemini-3-pro')
  }

  /**
   * Virtual Try-On (VTON) "AI Casting Director"
   * Analyzes uploaded garment images (ensemble) and generates scene variations.
   * Accepts an explicit model type from the user to guarantee correct gender/age casting.
   */
  async generateVirtualTryOnIdeas(
    garmentImageUrls: string | string[],
    vibeDescription: string,
    variationCount: number = 2,
    modelId: string = 'google/gemini-3.1-pro-preview',
    modelType?: {
      label: string
      gender: string
      ageMin: number
      ageMax: number
      promptFragment: string
    },
    targetAspectRatio: string = '1:1'
  ): Promise<VtonIdeationResponse> {
    const urls = Array.isArray(garmentImageUrls) ? garmentImageUrls : [garmentImageUrls]
    const imageCount = urls.length
    const isEnsemble = imageCount > 1

    const modelConstraint = modelType
      ? `\n\nNON-NEGOTIABLE MODEL CASTING CONSTRAINT (from user selection):
Gender: ${modelType.gender.toUpperCase()}
Age Range: ${modelType.ageMin}–${modelType.ageMax} years old
Base Description: ${modelType.promptFragment}
You MUST use this exact gender and age range. Do NOT override. Enrich with hair, skin tone, and expression details only.`
      : ''

    const modelTypeInfo = modelType
      ? `The user has explicitly selected: ${modelType.label} (${modelType.gender}, age ${modelType.ageMin}-${modelType.ageMax}). Use this. Do NOT guess differently.`
      : `Size: Mini/small plastic hanger = CHILDREN's garment (age 2-10). NEVER cast an adult for children's clothing.
Gender: Ruffles/lace/bows/floral/pastels/dress = GIRL. Cargo/structured/dark/athletic = BOY.
Small hanger + feminine cues = young GIRL (age 3-6). Non-negotiable.`

    const systemPrompt = getVtonIdeationPrompt({
      isEnsemble,
      imageCount,
      vibeDescription,
      variationCount,
      targetAspectRatio,
      modelConstraint,
      modelTypeInfo
    })

    const userMsg = `${isEnsemble ? `${imageCount} garment images are provided forming a complete outfit ensemble.` : 'Garment image is provided.'}
${modelType ? `User-selected model type: ${modelType.label} (${modelType.gender}, age ${modelType.ageMin}-${modelType.ageMax}). DO NOT change gender or age.` : ''}
Selected vibe: ${vibeDescription}
Number of scene prompts required: ${variationCount}
Output valid JSON only.`

    // Build multimodal content array with all images
    const userContent: unknown[] = [{ type: 'text', text: userMsg }]
    for (const url of urls) {
      userContent.push({ type: 'image_url', image_url: { url } })
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ]

    const response = await window.api.fal.chatCompletion(messages, modelId)
    if (response.error) throw new Error(response.error)

    let jsonStr = response
      .data!.replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    try {
      return JSON.parse(jsonStr) as VtonIdeationResponse
    } catch {
      if (jsonStr[jsonStr.length - 1] !== '}') {
        jsonStr = jsonStr.replace(/,\s*$/, '') + ']}'
      }
      try {
        return JSON.parse(jsonStr) as VtonIdeationResponse
      } catch {
        throw new Error('Failed to parse VTON JSON.')
      }
    }
  }
}

export const anthropicService = new AnthropicService()
