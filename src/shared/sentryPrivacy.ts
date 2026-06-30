const FAL_API_KEY_PATTERN = /fal_[a-zA-Z0-9]{32,}/
const FAL_API_KEY_REDACT_PATTERN = /fal_[a-zA-Z0-9]{32,}/g
const AUTH_HEADER_PATTERN = /\b(?:Bearer|Key)\s+fal_[a-zA-Z0-9]{32,}/g
const URL_PATTERN = /\bhttps?:\/\/[^\s"'<>\\)]+/g
const DATA_URL_PATTERN = /\bdata:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+/g
const JSON_PROMPT_PATTERN = /("(?:prompt|negative_prompt|system_prompt)"\s*:\s*")([^"]{100})[^"]*(")/gi
const PROMPT_KEY_PATTERN = /prompt|message|content|text/i
const URL_KEY_PATTERN = /url|image|video|audio|embedding/i

export function containsFalApiKey(value: unknown): boolean {
  return FAL_API_KEY_PATTERN.test(safeStringify(value))
}

export function sanitizeSentryEvent<T>(event: T): T | null {
  if (containsFalApiKey(event)) {
    return null
  }

  return sanitizeValue(event) as T
}

export function sanitizeDiagnosticText(text: string, maxLength = 500): string {
  const sanitized = sanitizeString(text)
  return sanitized.length > maxLength ? `${sanitized.slice(0, maxLength)}...` : sanitized
}

export function summarizePrompt(value: unknown, maxLength = 100): string | undefined {
  const parts: string[] = []
  collectPromptParts(value, parts)

  const summary = sanitizeString(parts.join(' ').trim())
  if (!summary) return undefined
  return summary.length > maxLength ? summary.slice(0, maxLength) : summary
}

function sanitizeValue(value: unknown, key = '', seen = new WeakSet<object>()): unknown {
  if (typeof value === 'string') {
    const sanitized = sanitizeString(value)
    if (PROMPT_KEY_PATTERN.test(key) && sanitized.length > 100) {
      return sanitized.slice(0, 100)
    }
    return sanitized
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key, seen))
  }

  if (value && typeof value === 'object') {
    if (seen.has(value)) return '[Circular]'
    seen.add(value)

    const output: Record<string, unknown> = {}
    for (const [childKey, childValue] of Object.entries(value)) {
      if (URL_KEY_PATTERN.test(childKey)) {
        output[childKey] = '[redacted-url]'
      } else {
        output[childKey] = sanitizeValue(childValue, childKey, seen)
      }
    }
    return output
  }

  return value
}

function collectPromptParts(value: unknown, parts: string[], key = '', seen = new WeakSet<object>()): void {
  if (typeof value === 'string') {
    if (!URL_KEY_PATTERN.test(key)) {
      parts.push(value)
    }
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) collectPromptParts(item, parts, key, seen)
    return
  }

  if (value && typeof value === 'object') {
    if (seen.has(value)) return
    seen.add(value)

    for (const [childKey, childValue] of Object.entries(value)) {
      if (URL_KEY_PATTERN.test(childKey)) continue
      if (PROMPT_KEY_PATTERN.test(childKey) || typeof childValue !== 'object') {
        collectPromptParts(childValue, parts, childKey, seen)
      } else {
        collectPromptParts(childValue, parts, childKey, seen)
      }
    }
  }
}

function sanitizeString(value: string): string {
  return value
    .replace(AUTH_HEADER_PATTERN, '[redacted-api-key]')
    .replace(FAL_API_KEY_REDACT_PATTERN, '[redacted-api-key]')
    .replace(DATA_URL_PATTERN, '[redacted-data-url]')
    .replace(URL_PATTERN, '[redacted-url]')
    .replace(JSON_PROMPT_PATTERN, '$1$2...[truncated]$3')
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
