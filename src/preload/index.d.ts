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
        getUsage: (timeframe?: string, start?: string, end?: string) => Promise<any>
        getBilling: () => Promise<any>
        validateKey: (key: string) => Promise<{ valid: boolean; credits?: number; currency?: string; error?: string }>
        getPricing: (ids: string[]) => Promise<any>
        getAnalytics: (ids: string[], start?: string, end?: string) => Promise<any>
        generateCopy: (promptOrMessages: any, modelId: string) => Promise<{ data?: string; error?: string }>
        analyzeImageVision: (imageUrl: string, prompt: string, systemPrompt: string, modelId: string) => Promise<{ data?: string; error?: string }>
        chatCompletion: (messages: any[], modelId: string) => Promise<{ data?: string; error?: string }>
      },
      external: {
        open: (url: string) => Promise<void>
      }
    }
  }
}
