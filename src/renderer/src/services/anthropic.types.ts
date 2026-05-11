import { CopyVariant } from './fal.service'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | unknown[]
}

export interface ConsultationResponse {
  question: string
  contextSummary: string // "What we know so far"
  isFinished: boolean
}

export interface VtonIdeationResponse {
  garment_category: string
  modelPrompt: string
  sceneVariations: string[]
}

export interface ProductAnalysis {
  product: string
  material: string
  category: string
  features: string[]
  // AI-determined strategy (populated in one-shot mode)
  targetAudience?: string
  priceTier?: string
  recommendedPlatforms?: string[]
}

export interface OneShotResult {
  analysis: ProductAnalysis
  variants: CopyVariant[]
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
