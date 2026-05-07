import os from 'os'
import { keystoreService } from '../keystore'

const LS_API_BASE = 'https://api.lemonsqueezy.com/v1/licenses'

export interface LicenseActivationResult {
  activated: boolean
  error: string | null
  license_key?: {
    id: number
    status: string
    key: string
    activation_limit: number
    activation_usage: number
    created_at: string
    expires_at: string | null
  }
  instance?: {
    id: string
    name: string
    created_at: string
  }
  meta?: {
    store_id: number
    order_id: number
    order_item_id: number
    product_id: number
    product_name: string
    variant_id: number
    variant_name: string
    customer_id: number
    customer_name: string
    customer_email: string
  }
}

export interface LicenseValidationResult {
  valid: boolean
  error: string | null
  license_key?: {
    id: number
    status: string
    key: string
    activation_limit: number
    activation_usage: number
    created_at: string
    expires_at: string | null
  }
  instance?: {
    id: string
    name: string
    created_at: string
  } | null
  meta?: {
    store_id: number
    order_id: number
    order_item_id: number
    product_id: number
    product_name: string
    variant_id: number
    variant_name: string
    customer_id: number
    customer_name: string
    customer_email: string
  }
}

export class LicenseService {
  /**
   * Activates a license key with Lemon Squeezy.
   * On success, stores the license key and instance ID in the OS keychain.
   */
  async activateLicense(licenseKey: string): Promise<LicenseActivationResult> {
    const instanceName = os.hostname()

    const body = new URLSearchParams({
      license_key: licenseKey,
      instance_name: instanceName
    })

    const res = await fetch(`${LS_API_BASE}/activate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    const data = (await res.json()) as LicenseActivationResult

    if (data.activated && data.instance?.id) {
      // Persist to OS keychain
      await keystoreService.setLicenseKey(licenseKey)
      await keystoreService.setInstanceId(data.instance.id)
    }

    return data
  }

  /**
   * Validates the stored license key + instance ID against Lemon Squeezy.
   * Returns { valid: false } if no stored key exists.
   */
  async validateLicense(): Promise<LicenseValidationResult> {
    const licenseKey = await keystoreService.getLicenseKey()
    const instanceId = await keystoreService.getInstanceId()

    if (!licenseKey) {
      return { valid: false, error: 'No license key found.' }
    }

    const params: Record<string, string> = { license_key: licenseKey }
    if (instanceId) {
      params.instance_id = instanceId
    }

    const body = new URLSearchParams(params)

    const res = await fetch(`${LS_API_BASE}/validate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    const data = (await res.json()) as LicenseValidationResult

    // Check for expired or disabled status even if LS returns valid: true
    if (data.license_key?.status === 'expired' || data.license_key?.status === 'disabled') {
      return {
        ...data,
        valid: false,
        error: data.license_key.status === 'expired'
          ? 'Your license has expired.'
          : 'Your license has been disabled.'
      }
    }

    return data
  }

  /**
   * Returns the stored license status without making an API call.
   */
  async getStoredLicenseInfo(): Promise<{ hasKey: boolean; key?: string; instanceId?: string }> {
    const key = await keystoreService.getLicenseKey()
    const instanceId = await keystoreService.getInstanceId()
    return {
      hasKey: !!key,
      key: key || undefined,
      instanceId: instanceId || undefined
    }
  }
}

export const licenseService = new LicenseService()
