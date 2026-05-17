import log from 'electron-log'
import keytar from 'keytar'
import os from 'os'
import { app } from 'electron'
import crypto from 'crypto'
import { FREEMIUS_CONFIG, IS_SANDBOX } from '../config/freemius.config'

const SERVICE_NAME = 'MonsterCreative'

export interface ActivateResult {
  success: boolean
  error?: string
  email?: string
  activationsUsed?: number
  activationsAllowed?: number
}

export interface ValidateResult {
  valid: boolean
  reason?: string
}

export class FreemiusService {
  private buildAuthHeader(): string {
    const authString = `${FREEMIUS_CONFIG.PUBLIC_KEY}:${FREEMIUS_CONFIG.SECRET_KEY}`
    return `Basic ${Buffer.from(authString).toString('base64')}`
  }

  private buildInstallAuthHeader(installApiToken: string): string {
    return `Bearer ${installApiToken}`
  }

  async activate(licenseKey: string): Promise<ActivateResult> {
    try {
      const url = `${FREEMIUS_CONFIG.API_BASE}/products/${FREEMIUS_CONFIG.PRODUCT_ID}/licenses/${licenseKey}/installs.json`
      
      const body = {
        uid: `${os.hostname()}-${os.platform()}`,
        title: `${os.hostname()} - Windows ${os.release()}`,
        version: app.getVersion(),
        platform_version: os.release(),
        programming_language_version: process.versions.node,
        country_code: 'DZ',
        language: 'en'
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.buildAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (res.status === 404) {
        return {
          success: false,
          error: 'Invalid license key. Please check your key and try again.'
        }
      }

      if (res.status === 401) {
        return {
          success: false,
          error: 'License key authentication failed. Please contact support.'
        }
      }

      const data = await res.json()

      if (res.status === 400 || (data.message && (data.message.includes('limit') || data.message.includes('exceeded')))) {
        return {
          success: false,
          error: `Activation limit reached (${FREEMIUS_CONFIG.MAX_ACTIVATIONS} devices). To transfer your license, go to Settings -> Transfer License.`
        }
      }

      if (res.status === 200) {
        await keytar.setPassword(SERVICE_NAME, 'license-key', licenseKey)
        await keytar.setPassword(SERVICE_NAME, 'install-id', String(data.id))
        await keytar.setPassword(SERVICE_NAME, 'install-api-token', data.api_token)
        await keytar.setPassword(SERVICE_NAME, 'purchaser-email', data.user.email)
        await keytar.setPassword(SERVICE_NAME, 'license-quota', String(data.license.quota))
        await keytar.setPassword(SERVICE_NAME, 'last-validated', String(Date.now()))
        await keytar.setPassword(SERVICE_NAME, 'app-version', app.getVersion())

        log.info(`Freemius activation successful: install_id=${data.id}`)
        log.info('keytar save successful for all fields')

        // Fire and forget install properties update
        setTimeout(() => {
          this.updateInstallProperties()
        }, 2000)

        return {
          success: true,
          email: data.user.email,
          activationsUsed: data.license.activated,
          activationsAllowed: data.license.quota
        }
      }

      return {
        success: false,
        error: 'An unknown error occurred during activation.'
      }

    } catch (err: any) {
      log.error('Freemius activation error:', err)
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  async validate(): Promise<ValidateResult> {
    try {
      const licenseKey = await keytar.getPassword(SERVICE_NAME, 'license-key')
      const installId = await keytar.getPassword(SERVICE_NAME, 'install-id')
      const installApiToken = await keytar.getPassword(SERVICE_NAME, 'install-api-token')
      const lastValidatedStr = await keytar.getPassword(SERVICE_NAME, 'last-validated')

      if (!licenseKey || !installId || !installApiToken) {
        return { valid: false, reason: 'not_activated' }
      }

      const lastValidated = lastValidatedStr ? Number(lastValidatedStr) : 0
      const daysSinceValidation = (Date.now() - lastValidated) / 86400000

      if (daysSinceValidation < FREEMIUS_CONFIG.REVALIDATION_DAYS) {
        return { valid: true }
      }

      const url = `${FREEMIUS_CONFIG.API_BASE}/products/${FREEMIUS_CONFIG.PRODUCT_ID}/installs/${installId}.json`
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.buildInstallAuthHeader(installApiToken)
        }
      })

      if (res.status === 401 || res.status === 403) {
        await this.clearLicense()
        return { valid: false, reason: 'revoked' }
      }

      if (res.status === 404) {
        await this.clearLicense()
        return { valid: false, reason: 'not_found' }
      }

      if (res.status === 200) {
        const data = await res.json()
        if (data.license?.is_cancelled || data.license?.is_expired || data.license?.is_whitelabeled) {
          await this.clearLicense()
          return { valid: false, reason: 'expired_or_cancelled' }
        }

        await keytar.setPassword(SERVICE_NAME, 'last-validated', String(Date.now()))
        return { valid: true }
      }

      return { valid: true }
    } catch (err: any) {
      log.error('Freemius validation error:', err)
      return { valid: true } // Network down -> assume valid
    }
  }

  private async updateInstallProperties(): Promise<void> {
    try {
      const installId = await keytar.getPassword(SERVICE_NAME, 'install-id')
      const installApiToken = await keytar.getPassword(SERVICE_NAME, 'install-api-token')

      if (!installId || !installApiToken) return

      const url = `${FREEMIUS_CONFIG.API_BASE}/installs/${installId}.json`
      const body = {
        version: app.getVersion(),
        title: `${os.hostname()} - Windows ${os.release()}`,
        platform_version: os.release(),
        programming_language_version: process.versions.node
      }

      await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': this.buildInstallAuthHeader(installApiToken),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
    } catch (err) {
      log.error('updateInstallProperties error:', err)
    }
  }

  async deactivate(): Promise<void> {
    try {
      const installId = await keytar.getPassword(SERVICE_NAME, 'install-id')
      const installApiToken = await keytar.getPassword(SERVICE_NAME, 'install-api-token')

      if (installId && installApiToken) {
        const url = `${FREEMIUS_CONFIG.API_BASE}/products/${FREEMIUS_CONFIG.PRODUCT_ID}/installs/${installId}.json`
        await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': this.buildInstallAuthHeader(installApiToken)
          }
        })
      }
    } catch (err) {
      log.error('Freemius deactivation API call failed:', err)
    } finally {
      await this.clearLicense()
    }
  }

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

  async getDetails() {
    const email = await keytar.getPassword(SERVICE_NAME, 'purchaser-email')
    const key = await keytar.getPassword(SERVICE_NAME, 'license-key')
    const quota = await keytar.getPassword(SERVICE_NAME, 'license-quota')
    const lastValidated = await keytar.getPassword(SERVICE_NAME, 'last-validated')
    return { email, key, quota, lastValidated }
  }

  private async clearLicense() {
    await keytar.deletePassword(SERVICE_NAME, 'license-key')
    await keytar.deletePassword(SERVICE_NAME, 'install-id')
    await keytar.deletePassword(SERVICE_NAME, 'install-api-token')
    await keytar.deletePassword(SERVICE_NAME, 'last-validated')
    await keytar.deletePassword(SERVICE_NAME, 'purchaser-email')
    await keytar.deletePassword(SERVICE_NAME, 'license-quota')
    await keytar.deletePassword(SERVICE_NAME, 'app-version')
  }
}

export const freemiusService = new FreemiusService()
