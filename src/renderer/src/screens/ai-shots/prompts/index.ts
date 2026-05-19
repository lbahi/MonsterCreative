import { GENERAL_BASE_PROMPT } from './general'

export type ProductType = 'fashion' | 'general'

export type ShotStyle = 'studio' | 'lifestyle' | 'macro' | 'flatlay' | 'packaging' | 'cinematic' | 'auto' | 'mixed'

/**
 * Prompt Assembler for AI Shots.
 * Interpolates active shot style and count into the unified general baseline rules.
 */
export function assembleSystemPrompt(
  productType: ProductType,
  shotStyle: ShotStyle,
  numberOfImages: number
): string {
  if (productType === 'fashion') {
    return ''
    // Fashion uses Virtual Try-On logic directly
  }

  const base = GENERAL_BASE_PROMPT

  return base
    .replace(/{NUMBER}/g, String(numberOfImages))
    .replace(/{SHOT_STYLE}/g, shotStyle)
}
