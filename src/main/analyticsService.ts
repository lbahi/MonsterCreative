import { PostHog } from 'posthog-node'
import crypto from 'crypto'
import { dbService } from './database'

const posthogEnv = import.meta.env as { VITE_POSTHOG_KEY?: string }
const apiKey = posthogEnv.VITE_POSTHOG_KEY || ''
const client = new PostHog(apiKey, {
  host: 'https://us.i.posthog.com'
})

const sessionId = crypto.randomUUID()
const sessionStartTime = Date.now()
let sessionHasEngaged = false

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
  // NULL means column was added after row existed → treat as enabled (default ON)
  const isEnabled = settings?.analytics_enabled !== 0 && settings?.analytics_enabled !== false
  
  if (!isEnabled) {
    return
  }

  if (eventName !== 'app_launched' && eventName !== 'screen_viewed' && eventName !== 'app_closed') {
    sessionHasEngaged = true
  }

  const distinctId = getOrCreateDistinctId()
  
  // Clean properties to ensure no fal.ai API keys, file paths, or prompt texts are sent
  let cleanProperties: Record<string, any> = { session_id: sessionId }
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
    cleanProperties = { ...cleanProperties, ...safeProps }
  }

  client.capture({
    distinctId,
    event: eventName,
    properties: cleanProperties
  })
}

export function endSession(): void {
  const sessionDuration = (Date.now() - sessionStartTime) / 1000
  captureEvent('app_closed', {
    session_duration_seconds: sessionDuration,
    engaged_session: sessionHasEngaged
  })
  client.shutdown()
}
