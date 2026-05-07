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
        uploadImageFromDataUrl: (dataUrl: string) => Promise<{ url?: string; error?: string }>
        nanoBananaEdit: (params: any) => Promise<any>
        reframeImage: (params: {
          image_url: string;
          aspect_ratio: string;
          output_format?: string;
        }) => Promise<any>
        kontextEdit: (params: {
          image_url: string;
          prompt: string;
          aspect_ratio?: string;
          width?: number;
          height?: number;
          output_format?: string;
          num_images?: number;
        }) => Promise<any>
      },
      external: {
        open: (url: string) => Promise<void>
      }
      auth: {
        activateLicense: (key: string) => Promise<{
          activated: boolean
          error: string | null
          license_key?: { id: number; status: string; key: string; activation_limit: number; activation_usage: number }
          instance?: { id: string; name: string }
          meta?: { product_name: string; customer_name: string; customer_email: string }
        }>
        validateLicense: () => Promise<{ valid: boolean; error: string | null }>
        getStartupState: () => Promise<{ licensed: boolean; error?: string }>
        getLicenseStatus: () => Promise<{ hasKey: boolean; key?: string; instanceId?: string }>
      }
    }
  }
}
