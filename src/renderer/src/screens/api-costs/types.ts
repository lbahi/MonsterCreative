export interface Transaction {
  id: string
  model: string
  operation: string
  type: 'Video' | 'Text' | 'Image'
  inputs: string
  outputs: string
  cost: number
  time: string
  timestamp: number
  platform: 'OpenAI' | 'fal.ai'
}

export interface ChartDataPoint {
  date: string
  spend: number
  timestamp: number
}

export interface ModelBreakdownItem {
  model: string
  cost: number
  quantity: number
}
