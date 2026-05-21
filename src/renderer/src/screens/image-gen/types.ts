export type ActiveImageGenMode = 'generate' | 'vton' | 'social' | 'resize' | 'landing' | 'ai-shots'

export type NanoBananaThinkingLevel = 'minimal' | 'high'

export type ModeOption = {
  id: ActiveImageGenMode
  path: string
  label: string
  description: string
  color: string
  icon: any
  comingSoon?: boolean
}
