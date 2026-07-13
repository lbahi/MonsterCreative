import { PostHog } from 'posthog-node'
import crypto from 'crypto'
import { dbService } from './database'
import { estimateFalCost } from '../shared/pricing'

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

/**
 * Attaches properties to the PostHog Person profile.
 * These appear as person-level properties and can be used as
 * breakdown/filter dimensions on every insight in PostHog.
 */
export function setPersonProperties(properties: Record<string, unknown>): void {
  const settings = dbService.getSettings()
  const isEnabled = settings?.analytics_enabled !== 0 && settings?.analytics_enabled !== false
  if (!isEnabled) return

  const distinctId = getOrCreateDistinctId()
  client.capture({
    distinctId,
    event: '$set',
    properties: { $set: properties }
  })
}

/**
 * Categorises a raw error into a short, safe string label.
 * Never passes error messages, stack traces, or prompt content.
 */
export function getErrorType(err: unknown): string {
  const msg = String((err as any)?.message ?? err).toLowerCase()
  if (msg.includes('429') || msg.includes('rate') || msg.includes('limit')) return 'rate_limit'
  if (msg.includes('timeout') || msg.includes('timed out')) return 'timeout'
  if (msg.includes('401') || msg.includes('403') || msg.includes('auth') || msg.includes('key')) return 'auth_error'
  if (msg.includes('400') || msg.includes('param') || msg.includes('invalid')) return 'invalid_params'
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('connect')) return 'network_error'
  return 'unknown_error'
}

/**
 * Fire a fal_api_call event for every generation call.
 * Cost is estimated via the shared pricing table — same numbers shown on DashboardScreen / ApiCostsScreen.
 */
export function trackFalApiCall(params: {
  modelId: string
  endpointCategory: string
  durationMs: number
  status: 'success' | 'error'
  errorType?: string
  estimatedCostUsd: number
}): void {
  captureEvent('fal_api_call', {
    model_id: params.modelId,
    endpoint_category: params.endpointCategory,
    duration_ms: params.durationMs,
    status: params.status,
    error_type: params.errorType,
    estimated_cost_usd: params.estimatedCostUsd
  })
}

// Re-export so call sites don't need to import shared/pricing separately
export { estimateFalCost }

