import log from 'electron-log'
import { keystoreService } from '../keystore'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GUMROAD_PRODUCT_ID = 'E68N0D3GnrI9-UgafMCUXg=='
const GUMROAD_API_URL = 'https://api.gumroad.com/v2/licenses/verify'
const REVALIDATION_DAYS = 7

export interface ActivateResult {
  success: boolean
  error?: string
  purchaserEmail?: string
}

export interface ValidateResult {
  valid: boolean
  error?: string
}

interface GumroadResponse {
  success: boolean
  message?: string
  uses: number
  purchase?: {
    refunded?: boolean
    chargebacked?: boolean
    test?: boolean
    email?: string
    variants?: string
  }
}

export class LicenseService {
  /**
   * Called when user enters their key for the first time.
   */
  async activate(key: string): Promise<ActivateResult> {
    try {
      const body = new URLSearchParams({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: key,
        increment_uses_count: 'true'
      })

      const res = await fetch(GUMROAD_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      })
      const data = (await res.json()) as GumroadResponse

      // CASE 1 — data.success is false
      if (!data.success) {
        return {
          success: false,
          error: data.message
            ? `Gumroad Error: ${data.message}`
            : 'Invalid license key.\nPlease check your key and try again.'
        }
      }

      // CASE 2 — data.purchase.refunded is true
      if (data.purchase?.refunded) {
        return {
          success: false,
          error: 'This license key has been refunded\nand is no longer valid.'
        }
      }

      // CASE 3 — data.purchase.chargebacked is true
      if (data.purchase?.chargebacked) {
        return { success: false, error: 'This license key is not valid.' }
      }

      // CASE 4 — data.purchase.test is true
      if (data.purchase?.test) {
        log.info('Test key detected - allowing for test purposes')
      }

      // Determine max activations based on variant
      const variant = data.purchase?.variants || ''
      const maxActivations = variant === 'Agency' ? 5 : 2

      // CASE 5 — data.uses > maxActivations
      if (data.uses > maxActivations) {
        // Decrement uses immediately
        await fetch(GUMROAD_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            product_id: GUMROAD_PRODUCT_ID,
            license_key: key,
            increment_uses_count: 'false'
          }).toString()
        })
        return {
          success: false,
          error: `Activation limit reached (${maxActivations} devices).\nTo transfer your license, contact support.`
        }
      }

      // CASE 6 — Activation successful
      await keystoreService.setLicenseData('license-key', key)
      await keystoreService.setLicenseData('license-uses', String(data.uses))
      await keystoreService.setLicenseData('last-validated', String(Date.now()))
      await keystoreService.setLicenseData('purchaser-email', data.purchase?.email || '')

      return { success: true, purchaserEmail: data.purchase?.email }
    } catch (err: unknown) {
      log.error('Gumroad activation error:', err)
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  /**
   * Called on every app launch.
   */
  async validate(): Promise<ValidateResult> {
    try {
      // STEP 1: Read from keytar 'license-key'
      const key = await keystoreService.getLicenseData('license-key')
      if (!key) {
        return { valid: false, error: 'No license key found.' }
      }

      // STEP 2: Read 'last-validated' from keytar
      const lastValidatedStr = await keystoreService.getLicenseData('last-validated')
      const lastValidated = lastValidatedStr ? parseInt(lastValidatedStr, 10) : 0
      const daysPassed = (Date.now() - lastValidated) / (1000 * 60 * 60 * 24)

      if (daysPassed < REVALIDATION_DAYS) {
        return { valid: true }
      }

      // STEP 3: If 7 days have passed, call Gumroad
      const body = new URLSearchParams({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: key,
        increment_uses_count: 'false'
      })

      const res = await fetch(GUMROAD_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      })
      const data = (await res.json()) as GumroadResponse

      if (!data.success) {
        await this.clearLicense()
        return { valid: false, error: 'License verification failed.' }
      }

      if (data.purchase?.refunded || data.purchase?.chargebacked) {
        await this.clearLicense()
        return { valid: false, error: 'Your license was refunded or charged back.' }
      }

      // Success
      await keystoreService.setLicenseData('last-validated', String(Date.now()))
      return { valid: true }
    } catch (err) {
      log.error('Gumroad validation error:', err)
      // If network is down, assume valid if it was previously activated
      return { valid: true }
    }
  }

  /**
   * Called when user clicks "Transfer License"
   */
  async deactivate(): Promise<void> {
    await this.clearLicense()
  }

  private async clearLicense() {
    await keystoreService.deleteLicenseData('license-key')
    await keystoreService.deleteLicenseData('license-uses')
    await keystoreService.deleteLicenseData('last-validated')
    await keystoreService.deleteLicenseData('purchaser-email')
  }
}

export const licenseService = new LicenseService()
