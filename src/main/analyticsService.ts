import { PostHog } from 'posthog-node'
import crypto from 'crypto'
import { dbService } from './database'

const posthogEnv = import.meta.env as { VITE_POSTHOG_KEY?: string }
const apiKey = posthogEnv.VITE_POSTHOG_KEY || ''
const client = new PostHog(apiKey, {
  host: 'https://us.i.posthog.com'
})

export function getOrCreateDistinctId(): string {
  const settings = dbService.getSettings()
  if (settings && settings.distinct_id) {
    return settings.distinct_id
  }
  
  const newId = crypto.randomUUID()
  dbService.saveDistinctId(newId)
  return newId
}

export function captureEvent(eventName: string, properties?: object): void {
  const settings = dbService.getSettings()
  const isEnabled = settings?.analytics_enabled !== 0 && settings?.analytics_enabled !== false
  
  if (!isEnabled) {
    return
  }

  const distinctId = getOrCreateDistinctId()
  
  // Clean properties to ensure no fal.ai API keys, file paths, or prompt texts are sent
  let cleanProperties = {}
  if (properties) {
    const keysToDrop = [
      'key', 'api_key', 'fal', 'prompt', 'script', 'path', 'url', 'dir', 'file', 'secret'
    ]
    
    const safeProps = { ...properties } as Record<string, any>
    for (const key of Object.keys(safeProps)) {
      const lowerKey = key.toLowerCase()
      if (keysToDrop.some(k => lowerKey.includes(k))) {
        delete safeProps[key]
      }
    }
    cleanProperties = safeProps
  }

  client.capture({
    distinctId,
    event: eventName,
    properties: cleanProperties
  })
}

export function shutdownAnalytics(): void {
  client.shutdown()
}
