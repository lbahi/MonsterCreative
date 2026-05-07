import keytar from 'keytar'

const SERVICE_NAME = 'MonsterCreative'
const FAL_KEY_NAME = 'fal_api_key'
const LICENSE_KEY_NAME = 'license_key'
const INSTANCE_ID_NAME = 'license_instance_id'

export class KeystoreService {
  // --- Fal API Key ---
  async setFalKey(key: string): Promise<void> {
    await keytar.setPassword(SERVICE_NAME, FAL_KEY_NAME, key)
  }

  async getFalKey(): Promise<string | null> {
    return await keytar.getPassword(SERVICE_NAME, FAL_KEY_NAME)
  }

  async deleteFalKey(): Promise<boolean> {
    return await keytar.deletePassword(SERVICE_NAME, FAL_KEY_NAME)
  }

  // --- License Key ---
  async setLicenseKey(key: string): Promise<void> {
    await keytar.setPassword(SERVICE_NAME, LICENSE_KEY_NAME, key)
  }

  async getLicenseKey(): Promise<string | null> {
    return await keytar.getPassword(SERVICE_NAME, LICENSE_KEY_NAME)
  }

  async deleteLicenseKey(): Promise<boolean> {
    return await keytar.deletePassword(SERVICE_NAME, LICENSE_KEY_NAME)
  }

  // --- License Instance ID ---
  async setInstanceId(id: string): Promise<void> {
    await keytar.setPassword(SERVICE_NAME, INSTANCE_ID_NAME, id)
  }

  async getInstanceId(): Promise<string | null> {
    return await keytar.getPassword(SERVICE_NAME, INSTANCE_ID_NAME)
  }

  async deleteInstanceId(): Promise<boolean> {
    return await keytar.deletePassword(SERVICE_NAME, INSTANCE_ID_NAME)
  }
}

export const keystoreService = new KeystoreService()
