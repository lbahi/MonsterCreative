import { falService } from './fal.service'

/**
 * AnthropicService - TypeScript Port
 * Orchestrates high-level LLM prompts using the fal.ai any-llm endpoint.
 */
export class AnthropicService {
  /**
   * Identical prompt orchestration for Ad Copy generation.
   */
  async generateAdCopy(campaignName: string, platforms: string[], tone: string): Promise<string> {
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
    // Per findings, we use openrouter/router via falService
    return await falService.generateCopy(prompt)
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
      
    return await falService.generateCopy(prompt)
  }
}

export const anthropicService = new AnthropicService()
