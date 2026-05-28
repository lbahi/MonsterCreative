export interface FalUsageResponse {
  next_cursor: string | null
  has_more: boolean
  time_series?: Array<{
    bucket: string
    results: Array<{
      endpoint_id: string
      unit: string
      quantity: number
      unit_price: number
      cost: number
      currency: string
      auth_method?: string
    }>
  }>
  summary?: Array<{
    endpoint_id: string
    unit: string
    quantity: number
    unit_price: number
    cost: number
    currency: string
    auth_method?: string
  }>
}

export interface ValidationResult {
  valid: boolean
  credits?: number
  currency?: string
  error?: string
}

export interface VideoGenerationRequest {
  modelId: string
  prompt: string
  imageUrl: string
  referenceImageUrl?: string
  endImageUrl?: string
  aspectRatio?: string
  resolution: string
  duration: number
  audio: boolean
  negativePrompt?: string
  seed?: number
}

export interface VideoGenerationResult {
  url: string
  fileName: string
  fileSize: number
}

export interface AudioGenerationRequest {
  text: string
  voiceId: string
  stability?: number
  similarity_boost?: number
  speed?: number
  model?: string
}

export interface AudioResult {
  url: string
  duration?: number
}
