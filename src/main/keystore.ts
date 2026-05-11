import keytar from 'keytar'
import log from 'electron-log'

const SERVICE_NAME = 'MonsterCreative'
const FAL_KEY_NAME = 'fal_api_key'
const LICENSE_KEY_NAME = 'license_key'
const INSTANCE_ID_NAME = 'license_instance_id'

export class KeystoreService {
  // --- Fal API Key ---
  async setFalKey(key: string): Promise<void> {
    try {
      await keytar.setPassword(SERVICE_NAME, FAL_KEY_NAME, key)
      log.info('Fal API key saved successfully')
    } catch (err) {
      log.error('keytar setPassword (fal) failed:', err)
      throw err
    }
  }

  async getFalKey(): Promise<string | null> {
    try {
      const key = await keytar.getPassword(SERVICE_NAME, FAL_KEY_NAME)
      log.info('Fal API key read:', key ? 'found' : 'not found')
      return key
    } catch (err) {
      log.error('keytar getPassword (fal) failed:', err)
      return null
    }
  }

  async deleteFalKey(): Promise<boolean> {
    try {
      const result = await keytar.deletePassword(SERVICE_NAME, FAL_KEY_NAME)
      log.info('Fal API key deleted:', result)
      return result
    } catch (err) {
      log.error('keytar deletePassword (fal) failed:', err)
      return false
    }
  }

  // --- License Key ---
  async setLicenseKey(key: string): Promise<void> {
    try {
      await keytar.setPassword(SERVICE_NAME, LICENSE_KEY_NAME, key)
      log.info('License key saved successfully')
    } catch (err) {
      log.error('keytar setPassword (license) failed:', err)
      throw err
    }
  }

  async getLicenseKey(): Promise<string | null> {
    try {
      const key = await keytar.getPassword(SERVICE_NAME, LICENSE_KEY_NAME)
      log.info('License key read:', key ? 'found' : 'not found')
      return key
    } catch (err) {
      log.error('keytar getPassword (license) failed:', err)
      return null
    }
  }

  async deleteLicenseKey(): Promise<boolean> {
    try {
      const result = await keytar.deletePassword(SERVICE_NAME, LICENSE_KEY_NAME)
      log.info('License key deleted:', result)
      return result
    } catch (err) {
      log.error('keytar deletePassword (license) failed:', err)
      return false
    }
  }

  // --- License Instance ID ---
  async setInstanceId(id: string): Promise<void> {
    try {
      await keytar.setPassword(SERVICE_NAME, INSTANCE_ID_NAME, id)
      log.info('Instance ID saved successfully')
    } catch (err) {
      log.error('keytar setPassword (instance) failed:', err)
      throw err
    }
  }

  async getInstanceId(): Promise<string | null> {
    try {
      const id = await keytar.getPassword(SERVICE_NAME, INSTANCE_ID_NAME)
      log.info('Instance ID read:', id ? 'found' : 'not found')
      return id
    } catch (err) {
      log.error('keytar getPassword (instance) failed:', err)
      return null
    }
  }

  async deleteInstanceId(): Promise<boolean> {
    try {
      const result = await keytar.deletePassword(SERVICE_NAME, INSTANCE_ID_NAME)
      log.info('Instance ID deleted:', result)
      return result
    } catch (err) {
      log.error('keytar deletePassword (instance) failed:', err)
      return false
    }
  }

  // --- Generic Data (Gumroad) ---
  async setLicenseData(account: string, value: string): Promise<void> {
    try {
      await keytar.setPassword(SERVICE_NAME, account, value)
      log.info(`Gumroad data saved: ${account}`)
    } catch (err) {
      log.error(`keytar setPassword (${account}) failed:`, err)
      throw err
    }
  }

  async getLicenseData(account: string): Promise<string | null> {
    try {
      return await keytar.getPassword(SERVICE_NAME, account)
    } catch (err) {
      log.error(`keytar getPassword (${account}) failed:`, err)
      return null
    }
  }

  async deleteLicenseData(account: string): Promise<boolean> {
    try {
      const result = await keytar.deletePassword(SERVICE_NAME, account)
      log.info(`Gumroad data deleted: ${account}`)
      return result
    } catch (err) {
      log.error(`keytar deletePassword (${account}) failed:`, err)
      return false
    }
  }
}

export const keystoreService = new KeystoreService()
