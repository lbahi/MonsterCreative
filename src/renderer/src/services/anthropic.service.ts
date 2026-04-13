import { falService, CopyVariant } from './fal.service'

/**
 * AnthropicService - TypeScript Port
 * Orchestrates high-level LLM prompts using the fal.ai openrouter/router endpoint.
 * Ported from C# AnthropicService.cs with identical prompt structure.
 */

/** Maps the ANALYSIS_MODELS dropdown IDs to OpenRouter model IDs */
const MODEL_ID_MAP: Record<string, string> = {
  'gemini-3-pro': 'google/gemini-3-pro',
  'kimi-k2.5-thinking': 'moonshotai/kimi-k2.5-thinking',
  'claude-opus-4-20250514-thinking-16k': 'anthropic/claude-opus-4-20250514'
}

export interface AdCopyRequest {
  productName: string
  valueProp: string
  targetAudience: string
  platform: string
  desiredAction: string
  tone: string
  selectedVariantTypes: string[]
  llmModelId: string
}

export interface ContentStrategyRequest {
  // From survey
  productAnalysis: {
    product: string
    material: string
    category: string
    features: string[]
  }
  selectedAudiences: string[]
  selectedAngles: string[]
  campaignDuration: string
  selectedPlatforms: string[]
  priceTier: string
  exactPrice: string
  needsLandingPage: boolean
  needsVideo: boolean
  selectedVideoTypes: string[]
  brandVoice: string
  analysisModelId: string
}

export interface ContentStrategyResult {
  variants: CopyVariant[]
  rawOutput: string
}

export class AnthropicService {
  /**
   * Resolves the user-facing model dropdown ID to the OpenRouter model ID.
   */
  private resolveModelId(dropdownId: string): string {
    return MODEL_ID_MAP[dropdownId] || `openai/${dropdownId}`
  }

  /**
   * Analyzes a product image using a vision-capable LLM.
   */
  async analyzeProductImage(imageUrl: string, prompt: string): Promise<string> {
    // We use Gemini 3 Pro (vision capable) for analysis
    const modelId = 'google/gemini-3-pro';
    
    // For vision, we use the messages format which the fal.ai openrouter/router endpoint 
    // supports if we pass it through. However, since our current fal.service.ts 
    // generateCopy expects a string prompt, we'll embed the URL in the prompt 
    // or update falService to support multimodal. 
    // Actually, let's just use the URL in the prompt for simplicity, as most 
    // vision models detect the URL.
    const fullPrompt = `${prompt}\n\nImage for analysis: ${imageUrl}`;
    return await falService.generateCopy(fullPrompt, modelId);
  }

  /**
   * Builds the full ad copy generation prompt.
   * Uses the specialized "MonsterCreative AI" expert strategist persona.
   */
  private buildPrompt(request: ContentStrategyRequest): string {
    const analysis = request.productAnalysis;
    const audiences = request.selectedAudiences.join(', ');
    const angles = request.selectedAngles.join(', ');
    const platforms = request.selectedPlatforms.join(', ');
    const videoTypes = request.selectedVideoTypes.join(', ');
    const price = request.exactPrice || request.priceTier;
    const priceContext = request.exactPrice ? `$${request.exactPrice}` : request.priceTier;

    // Define content deliverables dynamically
    let deliverables = `- ${request.selectedAngles.length} Ad Copy Variants for ${platforms} following these angles: ${angles}`;
    if (request.needsLandingPage) {
      deliverables += `\n- Full Landing Page Copy (Hero, Body, Benefits, FAQ, SEO)`;
    }
    if (request.needsVideo) {
      deliverables += `\n- Video Script Hooks and Concepts for: ${videoTypes}`;
    }

    return `You are MonsterCreative AI, an expert content strategist specializing in product launches.
Output ONLY a JSON array of objects. No preamble. No markdown.

PRODUCT CONTEXT:
- Product: ${analysis.product}
- Category: ${analysis.category}
- Materials: ${analysis.material}
- Key Features: ${analysis.features.join(', ')}
- Price Point: ${priceContext} (${request.priceTier})
- Target Audience: ${audiences}

STRATEGY PARAMETERS:
- Messaging Frameworks: ${angles}
- Platforms: ${platforms}
- Timeline: ${request.campaignDuration}-day campaign
- Tone: ${request.brandVoice}
- Video Content: ${request.needsVideo ? `Yes, types: ${videoTypes}` : 'No'}

CONTENT DELIVERABLES:
${deliverables}

CRITICAL RULES:
1. Every headline must hook within 3 seconds
2. Use price strategically based on tier (${request.priceTier})
3. Match character limits per platform (FB: 125 chars primary text, TikTok: 100 chars)
4. Include platform-specific elements (FB: emoji sparingly, TikTok: trending sounds reference)
5. Video hooks must create pattern interrupt in first 2 seconds
6. All CTAs must be action-oriented and specific
7. Maintain ${request.brandVoice} tone throughout
8. For Pain-Killer angle: start with problem, agitate, solve
9. For Dream-State angle: paint vivid future state
10. Vary hook types: question, statement, shock, curiosity

Required JSON structure (One object per selected angle):
[
  {
    "variantType": "angle_id",
    "headline1": "string",
    "headline2": "string",
    "headline3": "string",
    "hook": "string",
    "bodyCopy": "string",
    "cta": "string",
    "triggersUsed": "string",
    "landingPagePart": "string (optional, include if landing page requested)",
    "videoScripts": "string (optional, include if video requested)"
  }
]

RULES:
- Output ONLY the JSON array.
- Generate one variant per selected angle: ${angles}.
- "landingPagePart" and "videoScripts" should be embedded inside the variant objects, or appended to the first variant.`;
  }

  /**
   * Full Content Strategy generation — the main entry point.
   * Gathers all survey data, builds the prompt, calls the LLM, returns parsed variants.
   */
  async generateContentStrategy(request: ContentStrategyRequest): Promise<ContentStrategyResult> {
    const prompt = this.buildPrompt(request)
    const modelId = this.resolveModelId(request.analysisModelId)

    console.log('[AnthropicService] Using model:', modelId)
    console.log('[AnthropicService] Prompt length:', prompt.length, 'chars')

    const rawOutput = await falService.generateCopy(prompt, modelId)

    // Monster Search: extract JSON array from response
    let jsonString = rawOutput
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const firstBracket = jsonString.indexOf('[')
    const lastBracket = jsonString.lastIndexOf(']')

    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonString = jsonString.substring(firstBracket, lastBracket + 1)
    }

    try {
      const parsed = JSON.parse(jsonString)
      const variants: CopyVariant[] = Array.isArray(parsed) ? parsed : [parsed]
      return { variants, rawOutput }
    } catch (e: any) {
      console.error('[AnthropicService] JSON parse failed:', e.message)
      console.error('[AnthropicService] Raw output:', rawOutput)
      throw new Error(`Failed to parse LLM response. The model returned invalid JSON. Please try again or switch models.`)
    }
  }

  /**
   * Simple ad copy generation (legacy interface, kept for compatibility).
   */
  async generateAdCopy(campaignName: string, platforms: string[], tone: string, modelId?: string): Promise<string> {
    const prompt = `
      Act as a Senior Direct-Response Copywriter.
      Campaign: ${campaignName}
      Target Platforms: ${platforms.join(', ')}
      Desired Tone: ${tone}

      Task: Generate 3 variations of high-converting ad copy.
      Each variation must include:
      1. Headline (Max 40 chars)
      2. Hook (First line of body)
      3. Primary Body Copy
      4. CTA (Strong and clear)

      Format your response as a valid JSON array of objects with the following keys:
      "variant", "headline", "hook", "body", "cta"
      Return ONLY the JSON.
    `
    return await falService.generateCopy(prompt, modelId || 'google/gemini-3-pro')
  }

  /**
   * The "AI Casting Director" logic for VTON and campaign imagery.
   */
  async getGarmentAnalysis(description: string): Promise<string> {
    const prompt = `
      Analyze this garment: "${description}"
      Determine:
      1. Gender (Male/Female/Unisex) - BE EXTREMELY ACCURATE BASED ON CUT/STYLE.
      2. Primary Color/Pattern.
      3. Occasion (Casual/Formal/Sport).

      Return a descriptive prompt fragment for an AI model choice.`

    return await falService.generateCopy(prompt, 'google/gemini-3-pro')
  }
}

export const anthropicService = new AnthropicService()
