import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      database: {
        getSettings: () => Promise<any>
        updateSettings: (settings: any) => Promise<any>
        getAllCampaigns: () => Promise<any[]>
        createCampaign: (name: string, platforms: string) => Promise<number>
        saveImage: (img: any) => Promise<number>
        saveCopyVariant: (v: any) => Promise<number>
      }
      keystore: {
        setFalKey: (key: string) => Promise<void>
        getFalKey: () => Promise<string | null>
        deleteFalKey: () => Promise<boolean>
      }
      fal: {
        getUsage: (timeframe?: string) => Promise<any>
        getBilling: () => Promise<any>
      }
    }
  }
}
