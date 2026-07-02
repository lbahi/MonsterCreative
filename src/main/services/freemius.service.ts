import log from 'electron-log'
import keytar from 'keytar'
import os from 'os'
import { app } from 'electron'
import crypto from 'crypto'
import { FREEMIUS_CONFIG, IS_SANDBOX } from '../config/freemius.config'

const SERVICE_NAME = 'MonsterCreative'
const APP_URL = 'https://monstercreative.lbahi.digital'
const API_BASE_ROOT = FREEMIUS_CONFIG.API_BASE.replace(/\/v1$/, '')


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

// ── Helpers: FS Request Signing & Info Retrieval ──────────────────────────────

function generateFsSignature(
  secretKey: string,
  method: string,
  path: string,
  dateStr: string
): string {
  const contentMd5 = ''
  const contentType = ''
  const stringToSign = `${method}\n${contentMd5}\n${contentType}\n${dateStr}\n${path}`

  const hmac = crypto.createHmac('sha256', secretKey)
  hmac.update(stringToSign)
  const hashHex = hmac.digest('hex')

  return Buffer.from(hashHex)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function fetchUserEmailAndQuota(
  userId: string,
  userPublicKey: string,
  userSecretKey: string,
  licenseKey: string
): Promise<{ email?: string; quota?: string }> {
  try {
    const dateStr = new Date().toUTCString()

    // 1. Fetch user details for email
    const userPath = `/v1/users/${userId}.json`
    const userSig = generateFsSignature(userSecretKey, 'GET', userPath, dateStr)
    const userUrl = `${API_BASE_ROOT}${userPath}`

    log.info(`[Freemius] Fetching user email from: ${userUrl}`)
    const userRes = await fetch(userUrl, {
      method: 'GET',
      headers: {
        'Authorization': `FS ${userId}:${userPublicKey}:${userSig}`,
        'Date': dateStr
      }
    })

    let email: string | undefined
    if (userRes.status === 200) {
      const userData = await userRes.json()
      email = userData.email
      log.info(`[Freemius] Successfully retrieved email: ${email}`)
    } else {
      log.error(`[Freemius] Failed to fetch user details, status: ${userRes.status}`)
    }

    // 2. Fetch license details for quota
    const licensesPath = `/v1/users/${userId}/plugins/${FREEMIUS_CONFIG.PRODUCT_ID}/licenses.json`
    const licensesSig = generateFsSignature(userSecretKey, 'GET', licensesPath, dateStr)
    const licensesUrl = `${API_BASE_ROOT}${licensesPath}`

    log.info(`[Freemius] Fetching user licenses from: ${licensesUrl}`)
    const licensesRes = await fetch(licensesUrl, {
      method: 'GET',
      headers: {
        'Authorization': `FS ${userId}:${userPublicKey}:${licensesSig}`,
        'Date': dateStr
      }
    })

    let quota: string | undefined
    if (licensesRes.status === 200) {
      const licensesData = await licensesRes.json()
      const licenses = licensesData.licenses || []
      const activeLicense = licenses.find((l: any) => l.secret_key === licenseKey)
      if (activeLicense) {
        quota = activeLicense.quota === null ? 'Unlimited' : String(activeLicense.quota)
        log.info(`[Freemius] Successfully retrieved quota: ${quota}`)
      } else {
        log.warn('[Freemius] Active license key not found in user licenses list')
      }
    } else {
      log.error(`[Freemius] Failed to fetch licenses, status: ${licensesRes.status}`)
    }

    return { email, quota }
  } catch (err: any) {
    log.error('[Freemius] Error fetching user email/quota:', err.message)
    return {}
  }
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
        await keytar.setPassword(SERVICE_NAME, 'install-api-token', data.install_api_token ?? data.install_secret_key ?? '')
        await keytar.setPassword(SERVICE_NAME, 'install-secret-key', data.install_secret_key ?? '')
        await keytar.setPassword(SERVICE_NAME, 'user-id', String(data.user_id ?? ''))
        await keytar.setPassword(SERVICE_NAME, 'user-secret-key', String(data.user_secret_key ?? ''))
        await keytar.setPassword(SERVICE_NAME, 'user-public-key', String(data.user_public_key ?? ''))
        await keytar.setPassword(SERVICE_NAME, 'license-plan', data.license_plan_name ?? '')
        await keytar.setPassword(SERVICE_NAME, 'last-validated', String(Date.now()))
        await keytar.setPassword(SERVICE_NAME, 'app-version', app.getVersion())

        // Fetch email and quota using the user's signed API keys
        if (data.user_id && data.user_public_key && data.user_secret_key) {
          const { email, quota } = await fetchUserEmailAndQuota(
            String(data.user_id),
            data.user_public_key,
            data.user_secret_key,
            licenseKey
          )
          if (email) {
            await keytar.setPassword(SERVICE_NAME, 'purchaser-email', email)
          }
          if (quota) {
            await keytar.setPassword(SERVICE_NAME, 'license-quota', quota)
          }
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
      let installId = await keytar.getPassword(SERVICE_NAME, 'install-id')
      let lastValidatedStr = await keytar.getPassword(SERVICE_NAME, 'last-validated')

      let userId = await keytar.getPassword(SERVICE_NAME, 'user-id')
      let userPublicKey = await keytar.getPassword(SERVICE_NAME, 'user-public-key')
      let userSecretKey = await keytar.getPassword(SERVICE_NAME, 'user-secret-key')
      let licenseKey = await keytar.getPassword(SERVICE_NAME, 'license-key')

      if (!installId || !userId || !userPublicKey || !userSecretKey || !licenseKey) {
        // Fallback: If not activated with Freemius keys, check if a legacy license_key exists
        const legacyLicenseKey = await keytar.getPassword(SERVICE_NAME, 'license_key')
        if (legacyLicenseKey) {
          log.info('[Freemius] Found legacy license_key, attempting auto-activation...')
          const activation = await this.activate(legacyLicenseKey)
          if (activation.success) {
            installId = await keytar.getPassword(SERVICE_NAME, 'install-id')
            lastValidatedStr = await keytar.getPassword(SERVICE_NAME, 'last-validated')
            userId = await keytar.getPassword(SERVICE_NAME, 'user-id')
            userPublicKey = await keytar.getPassword(SERVICE_NAME, 'user-public-key')
            userSecretKey = await keytar.getPassword(SERVICE_NAME, 'user-secret-key')
            licenseKey = await keytar.getPassword(SERVICE_NAME, 'license-key')
          } else {
            return { valid: false, reason: 'not_activated' }
          }
        } else {
          return { valid: false, reason: 'not_activated' }
        }
      }

      // Skip API call if revalidated recently
      const lastValidated = lastValidatedStr ? Number(lastValidatedStr) : 0
      const daysSince = (Date.now() - lastValidated) / 86400000
      if (daysSince < FREEMIUS_CONFIG.REVALIDATION_DAYS) {
        log.info(`[Freemius] Skipping revalidation (${daysSince.toFixed(1)} days since last check)`)

        // Self-healing: If activated but email or quota is missing, fetch them in the background
        const email = await keytar.getPassword(SERVICE_NAME, 'purchaser-email')
        const quota = await keytar.getPassword(SERVICE_NAME, 'license-quota')
        if (!email || !quota) {
          log.info('[Freemius] Skipping full validation but email/quota is missing. Triggering background fetch...')
          fetchUserEmailAndQuota(userId!, userPublicKey!, userSecretKey!, licenseKey!).then(async (fetched) => {
            if (fetched.email) await keytar.setPassword(SERVICE_NAME, 'purchaser-email', fetched.email)
            if (fetched.quota) await keytar.setPassword(SERVICE_NAME, 'license-quota', fetched.quota)
            log.info('[Freemius] Self-healing background fetch completed successfully')
          }).catch(err => {
            log.error('[Freemius] Background self-healing fetch failed:', err.message)
          })
        }

        return { valid: true }
      }

      const dateStr = new Date().toUTCString()
      const path = `/v1/users/${userId}/plugins/${FREEMIUS_CONFIG.PRODUCT_ID}/licenses.json`
      const sig = generateFsSignature(userSecretKey!, 'GET', path, dateStr)
      const url = `${API_BASE_ROOT}${path}`

      log.info('[Freemius] Validating licenses via user endpoint:', url)
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `FS ${userId}:${userPublicKey}:${sig}`,
          'Date': dateStr
        }
      })

      if (res.status !== 200) {
        log.error(`[Freemius] Validation failed with status: ${res.status} — clearing license`)
        await this.clearLicense()
        return { valid: false, reason: 'revoked' }
      }

      const licensesData = await res.json()
      const licenses = licensesData.licenses || []
      const activeLicense = licenses.find((l: any) => l.secret_key === licenseKey)

      if (!activeLicense) {
        log.error('[Freemius] Validation failed: license key not found in user licenses — clearing license')
        await this.clearLicense()
        return { valid: false, reason: 'revoked' }
      }

      // Update validation metadata
      await keytar.setPassword(SERVICE_NAME, 'last-validated', String(Date.now()))

      const quotaStr = activeLicense.quota === null ? 'Unlimited' : String(activeLicense.quota)
      await keytar.setPassword(SERVICE_NAME, 'license-quota', quotaStr)

      // Also proactively update email if available
      const userPath = `/v1/users/${userId}.json`
      const userSig = generateFsSignature(userSecretKey!, 'GET', userPath, dateStr)
      const userUrl = `${API_BASE_ROOT}${userPath}`
      const userRes = await fetch(userUrl, {
        method: 'GET',
        headers: {
          'Authorization': `FS ${userId}:${userPublicKey}:${userSig}`,
          'Date': dateStr
        }
      })
      if (userRes.status === 200) {
        const userData = await userRes.json()
        if (userData.email) {
          await keytar.setPassword(SERVICE_NAME, 'purchaser-email', userData.email)
        }
      }

      log.info('[Freemius] Validation successful, install active')
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
      const licenseKey = await keytar.getPassword(SERVICE_NAME, 'license-key')
      const uid = await getOrCreateDeviceUid()

      if (installId && licenseKey) {
        const url = `${FREEMIUS_CONFIG.API_BASE}/products/${FREEMIUS_CONFIG.PRODUCT_ID}/licenses/deactivate.json`
        log.info('[Freemius] Deactivating license:', url)

        const body = {
          uid,
          install_id: Number(installId),
          license_key: licenseKey
        }

        log.info('[Freemius] Request body (key masked):', JSON.stringify({ ...body, license_key: '***' }))

        await safeFetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })

        log.info('[Freemius] Deactivation API call completed')
      } else {
        log.warn('[Freemius] Missing install ID or license key, skipping API deactivation call but proceeding to clear locally')
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
    let email = await keytar.getPassword(SERVICE_NAME, 'purchaser-email')
    const key = await keytar.getPassword(SERVICE_NAME, 'license-key')
    let quota = await keytar.getPassword(SERVICE_NAME, 'license-quota')
    const plan = await keytar.getPassword(SERVICE_NAME, 'license-plan')
    const lastValidated = await keytar.getPassword(SERVICE_NAME, 'last-validated')

    // Self-healing check: If the app is activated but email or quota is missing, fetch them inline/background
    if (key && (!email || !quota)) {
      log.info('[Freemius] Self-healing check: Activated but email or quota is missing. Fetching now...')
      const userId = await keytar.getPassword(SERVICE_NAME, 'user-id')
      const userPublicKey = await keytar.getPassword(SERVICE_NAME, 'user-public-key')
      const userSecretKey = await keytar.getPassword(SERVICE_NAME, 'user-secret-key')
      if (userId && userPublicKey && userSecretKey) {
        const fetched = await fetchUserEmailAndQuota(userId, userPublicKey, userSecretKey, key)
        if (fetched.email) {
          await keytar.setPassword(SERVICE_NAME, 'purchaser-email', fetched.email)
          email = fetched.email
        }
        if (fetched.quota) {
          await keytar.setPassword(SERVICE_NAME, 'license-quota', fetched.quota)
          quota = fetched.quota
        }
      }
    }

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
      'user-secret-key',
      'user-public-key',
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
