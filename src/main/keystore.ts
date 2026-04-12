import keytar from 'keytar'

const SERVICE_NAME = 'MonsterCreative'
const FAL_KEY_NAME = 'fal_api_key'

export class KeystoreService {
  async setFalKey(key: string): Promise<void> {
    await keytar.setPassword(SERVICE_NAME, FAL_KEY_NAME, key)
  }

  async getFalKey(): Promise<string | null> {
    return await keytar.getPassword(SERVICE_NAME, FAL_KEY_NAME)
  }

  async deleteFalKey(): Promise<boolean> {
    return await keytar.deletePassword(SERVICE_NAME, FAL_KEY_NAME)
  }
}

export const keystoreService = new KeystoreService()
