import log from 'electron-log'
import keytar from 'keytar'
import os from 'os'
import { app } from 'electron'
import crypto from 'crypto'
import { FREEMIUS_CONFIG, IS_SANDBOX } from '../config/freemius.config'

const SERVICE_NAME = 'MonsterCreative'
const APP_URL = 'https://monstercreative.lbahi.digital'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ActivateResult {
  success: boolean
  alreadyActive?: boolean
  error?: string
  email?: string
  planName?: string
  installId?: string
  activationsUsed?: number
  activationsAllowed?: number
}

export interface ValidateResult {
  valid: boolean
  reason?: string
}

// ── Helper: safe fetch (always reads text first, never crashes on HTML) ────────

async function safeFetch(url: string, options: RequestInit): Promise<{ status: number; data: any; raw: string }> {
  const res = await fetch(url, options)
  const raw = await res.text()

  log.info('[Freemius] Response status:', res.status)
  log.info('[Freemius] Response body:', raw.substring(0, 300))

  if (raw.trimStart().startsWith('<')) {
    log.error('[Freemius] Server returned HTML — wrong endpoint or server-side error')
    throw new Error(`API returned HTML page (HTTP ${res.status}). Check logs.`)
  }

  const data = raw.length > 0 ? JSON.parse(raw) : {}
  return { status: res.status, data, raw }
}

// ── Helper: get or generate stable device UID ─────────────────────────────────

async function getOrCreateDeviceUid(): Promise<string> {
  const existing = await keytar.getPassword(SERVICE_NAME, 'device-uid')
  if (existing && existing.length === 32) {
    log.info('[Freemius] Using existing device UID')
    return existing
  }
  const uid = crypto.randomBytes(16).toString('hex') // exactly 32 hex chars
  await keytar.setPassword(SERVICE_NAME, 'device-uid', uid)
  log.info('[Freemius] Generated new device UID:', uid)
  return uid
}

// ── Service class ─────────────────────────────────────────────────────────────

export class FreemiusService {

  // ── Activate ────────────────────────────────────────────────────────────────

  async activate(licenseKey: string): Promise<ActivateResult> {
    try {
      const uid = await getOrCreateDeviceUid()

      const url = `${FREEMIUS_CONFIG.API_BASE}/products/${FREEMIUS_CONFIG.PRODUCT_ID}/licenses/activate.json`
      log.info('[Freemius] Activation URL:', url)

      const body = {
        uid,
        license_key: licenseKey,
        title: `${os.hostname()} — Windows ${os.release()}`,
        version: app.getVersion(),
        url: APP_URL,
        allow_unreleased_plan_activation: true
      }

      log.info('[Freemius] Request body (key masked):', JSON.stringify({ ...body, license_key: '***' }))

      const { status, data } = await safeFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
        // No Authorization header — this endpoint is public
      , body: JSON.stringify(body) })

      // ── Error handling ────────────────────────────────────────
      if (data.error) {
        const code: string = data.error.code ?? ''
        const msg: string = data.error.message ?? ''

        log.error('[Freemius] Activation error code:', code, '—', msg)

        switch (code) {
          case 'invalid_license_key':
            return { success: false, error: 'Invalid license key. Please check and try again.' }

          case 'license_expired':
            return { success: false, error: 'This license has expired. Please contact support.' }

          case 'license_utilized':
            return {
              success: false,
              error: `Activation limit reached (${FREEMIUS_CONFIG.MAX_ACTIVATIONS} devices). To transfer your license go to Settings → Transfer License.`
            }

          case 'license_activated':
            // Device is already activated — treat as success
            log.info('[Freemius] Device already activated — accepting as valid')
            return { success: true, alreadyActive: true }

          default:
            return { success: false, error: msg || `Activation failed (${code}).` }
        }
      }

      // ── Success ───────────────────────────────────────────────
      if (status === 200 && data.install_id) {
        await keytar.setPassword(SERVICE_NAME, 'license-key', licenseKey)
        await keytar.setPassword(SERVICE_NAME, 'device-uid', uid)
        await keytar.setPassword(SERVICE_NAME, 'install-id', String(data.install_id))
        await keytar.setPassword(SERVICE_NAME, 'install-api-token', data.install_api_token ?? '')
        await keytar.setPassword(SERVICE_NAME, 'install-secret-key', data.install_secret_key ?? '')
        await keytar.setPassword(SERVICE_NAME, 'user-id', String(data.user_id ?? ''))
        await keytar.setPassword(SERVICE_NAME, 'license-plan', data.license_plan_name ?? '')
        await keytar.setPassword(SERVICE_NAME, 'last-validated', String(Date.now()))
        await keytar.setPassword(SERVICE_NAME, 'app-version', app.getVersion())

        // Save email and quota if present in the Freemius response
        if (data.user?.email) {
          await keytar.setPassword(SERVICE_NAME, 'purchaser-email', data.user.email)
        }
        if (data.license?.quota !== undefined) {
          await keytar.setPassword(
            SERVICE_NAME,
            'license-quota',
            data.license.quota === null ? 'Unlimited' : String(data.license.quota)
          )
        }

        log.info(`[Freemius] Activation successful: install_id=${data.install_id}, plan=${data.license_plan_name}`)
        log.info('[Freemius] keytar save successful for all fields')

        return {
          success: true,
          planName: data.license_plan_name,
          installId: String(data.install_id)
        }
      }

      log.error('[Freemius] Unexpected activation response:', { status, data })
      return { success: false, error: `Unexpected API response (HTTP ${status}).` }

    } catch (error: any) {
      log.error('[Freemius] Activation exception:', { message: error.message, stack: error.stack })
      return { success: false, error: error.message || 'Unknown error during activation.' }
    }
  }

  // ── Validate ─────────────────────────────────────────────────────────────────

  async validate(): Promise<ValidateResult> {
    try {
      const installId = await keytar.getPassword(SERVICE_NAME, 'install-id')
      const installApiToken = await keytar.getPassword(SERVICE_NAME, 'install-api-token')
      const lastValidatedStr = await keytar.getPassword(SERVICE_NAME, 'last-validated')

      if (!installId || !installApiToken) {
        return { valid: false, reason: 'not_activated' }
      }

      // Skip API call if revalidated recently
      const lastValidated = lastValidatedStr ? Number(lastValidatedStr) : 0
      const daysSince = (Date.now() - lastValidated) / 86400000
      if (daysSince < FREEMIUS_CONFIG.REVALIDATION_DAYS) {
        log.info(`[Freemius] Skipping revalidation (${daysSince.toFixed(1)} days since last check)`)
        return { valid: true }
      }

      const url = `${FREEMIUS_CONFIG.API_BASE}/products/${FREEMIUS_CONFIG.PRODUCT_ID}/installs/${installId}.json`
      log.info('[Freemius] Validating install:', url)

      const { data } = await safeFetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${installApiToken}` }
      })

      if (data.error) {
        log.error('[Freemius] Validation failed — clearing license:', data.error)
        await this.clearLicense()
        return { valid: false, reason: data.error.code ?? 'revoked' }
      }

      if (data.id) {
        await keytar.setPassword(SERVICE_NAME, 'last-validated', String(Date.now()))
        
        // Save email and quota if present in the Freemius response
        if (data.user?.email) {
          await keytar.setPassword(SERVICE_NAME, 'purchaser-email', data.user.email)
        }
        if (data.license?.quota !== undefined) {
          await keytar.setPassword(
            SERVICE_NAME,
            'license-quota',
            data.license.quota === null ? 'Unlimited' : String(data.license.quota)
          )
        }

        log.info('[Freemius] Validation successful, install active')
        return { valid: true }
      }

      return { valid: true }

    } catch (err: any) {
      log.error('[Freemius] Validation error (assuming valid):', err.message)
      return { valid: true } // Network down → assume valid, retry later
    }
  }

  // ── Deactivate (Transfer License) ────────────────────────────────────────────

  async deactivate(): Promise<void> {
    try {
      const installId = await keytar.getPassword(SERVICE_NAME, 'install-id')
      const installApiToken = await keytar.getPassword(SERVICE_NAME, 'install-api-token')
      const licenseKey = await keytar.getPassword(SERVICE_NAME, 'license-key')

      if (installId && installApiToken) {
        const url = `${FREEMIUS_CONFIG.API_BASE}/products/${FREEMIUS_CONFIG.PRODUCT_ID}/installs/${installId}.json?license_key=${encodeURIComponent(licenseKey ?? '')}`
        log.info('[Freemius] Deactivating install:', url)

        await safeFetch(url, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${installApiToken}` }
        })

        log.info('[Freemius] Deactivation API call completed')
      }
    } catch (err: any) {
      log.error('[Freemius] Deactivation API call failed (continuing with local clear):', err.message)
    } finally {
      await this.clearLicense()
    }
  }

  // ── Checkout URL ──────────────────────────────────────────────────────────────

  async getCheckoutUrl(): Promise<string> {
    const baseUrl = `${FREEMIUS_CONFIG.CHECKOUT_BASE}/app/${FREEMIUS_CONFIG.PRODUCT_ID}/plan/${FREEMIUS_CONFIG.PLAN_ID}/`

    if (IS_SANDBOX) {
      const timestamp = Math.floor(Date.now() / 1000)
      const sandboxToken = crypto
        .createHash('md5')
        .update(`${timestamp}${FREEMIUS_CONFIG.PRODUCT_ID}${FREEMIUS_CONFIG.SECRET_KEY}${FREEMIUS_CONFIG.PUBLIC_KEY}checkout`)
        .digest('hex')

      return `${baseUrl}?sandbox=${sandboxToken}&s_ctx_ts=${timestamp}`
    }

    return baseUrl
  }

  // ── Get Details (for Settings → License tab) ──────────────────────────────────

  async getDetails() {
    const email = await keytar.getPassword(SERVICE_NAME, 'purchaser-email')
    const key = await keytar.getPassword(SERVICE_NAME, 'license-key')
    const quota = await keytar.getPassword(SERVICE_NAME, 'license-quota')
    const plan = await keytar.getPassword(SERVICE_NAME, 'license-plan')
    const lastValidated = await keytar.getPassword(SERVICE_NAME, 'last-validated')
    return { email, key, quota, plan, lastValidated }
  }

  // ── Clear license (keeps device-uid) ─────────────────────────────────────────

  private async clearLicense() {
    const keys = [
      'license-key',
      'install-id',
      'install-api-token',
      'install-secret-key',
      'user-id',
      'license-plan',
      'last-validated',
      'purchaser-email',
      'license-quota',
      'app-version'
      // NOTE: 'device-uid' is intentionally NOT cleared — persists across transfers
    ]
    for (const k of keys) {
      await keytar.deletePassword(SERVICE_NAME, k)
    }
    log.info('[Freemius] Local license data cleared (device-uid preserved)')
  }
}

export const freemiusService = new FreemiusService()
