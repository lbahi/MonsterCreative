export interface DashboardMetric {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}

export interface ActivityItem {
  id: string
  action: string
  model: string
  time: string
  cost: number
  timestamp: number
  type: 'Video' | 'Image' | 'Text'
  img?: string
  title?: string
  platform?: string
}

export interface UsageResponse {
  summary?: Array<{ quantity: number; cost: number }>
  time_series?: Array<{ results: Array<{ quantity: number; cost: number }> }>
  error?: string
}

export interface BillingResponse {
  credits?: { current_balance: number }
  current_balance?: number
  balance?: number
  billing_restricted?: boolean
  error?: string
}
