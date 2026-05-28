import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      database: {
        getSettings: () => Promise<any>
        updateSettings: (settings: any) => Promise<any>
        getAllCampaigns: () => Promise<any[]>
        createCampaign: (name: string, platforms: string[]) => Promise<number>
        saveImage: (img: any) => Promise<number>
        saveCopyVariant: (v: any) => Promise<number>
        getAdProject: (id: string) => Promise<any>
        getAllAdProjects: () => Promise<any[]>
        saveAdProject: (project: any) => Promise<void>
        // Legacy support for old API
        saveAdMakerSession: (session: any) => Promise<number | string>
        getAdMakerSession: (id: number | string) => Promise<any>
        getAllAdMakerSessions: () => Promise<any[]>
      }
      keystore: {
        setFalKey: (key: string) => Promise<void>
        getFalKey: () => Promise<string | null>
        deleteFalKey: () => Promise<boolean>
      }
      fal: {
        getUsage: (timeframe?: string, start?: string, end?: string) => Promise<any>
        getBilling: () => Promise<any>
        validateKey: (
          key: string
        ) => Promise<{ valid: boolean; credits?: number; currency?: string; error?: string }>
        getPricing: (ids: string[]) => Promise<any>
        getAnalytics: (ids: string[], start?: string, end?: string) => Promise<any>
        generateCopy: (
          promptOrMessages: any,
          modelId: string
        ) => Promise<{ data?: string; error?: string }>
        analyzeImageVision: (
          imageUrl: string,
          prompt: string,
          systemPrompt: string,
          modelId: string
        ) => Promise<{ data?: string; error?: string }>
        chatCompletion: (
          messages: any[],
          modelId: string
        ) => Promise<{ data?: string; error?: string }>
        uploadImageFromDataUrl: (dataUrl: string) => Promise<{ url?: string; error?: string }>
        nanoBananaEdit: (params: any) => Promise<{ images?: Array<{ url: string }>; error?: string }>;
        gptImage2Edit: (params: {
          prompt: string
          image_urls: string[]
          image_size?: string
          quality?: string
          num_images?: number
          output_format?: string
        }) => Promise<{ images?: Array<{ url: string }>; error?: string }>;
        reframeImage: (params: {
          image_url: string
          aspect_ratio: string
          output_format?: string
        }) => Promise<any>;
        kontextEdit: (params: {
          image_url: string
          prompt: string
          aspect_ratio?: string
          width?: number
          height?: number
          output_format?: string
          num_images?: number
        }) => Promise<any>;
        generateVideo: (params: any) => Promise<{ images?: Array<{ url: string }>; image?: { url: string }; url?: string; error?: string }>;
      }
      video: {
        generate: (request: any) => Promise<any>
      }
      external: {
        open: (url: string) => Promise<void>
      }
      utils: {
        downloadFile: (params: { url: string; filename: string }) => Promise<{ success: boolean; path?: string; cancelled?: boolean; error?: string }>
      }
      social: {
        saveAdImage: (params: { imageUrl: string; filename: string }) => Promise<{ success: boolean; path?: string; localUrl?: string; error?: string }>
        openOutputFolder: () => Promise<void>
      }
      audio: {
        generateSpeech: (params: any) => Promise<any>
        speechToSpeech: (params: any) => Promise<any>
        cloneVoice: (params: any) => Promise<any>
        generateClonedSpeech: (params: any) => Promise<any>
        saveCustomVoice: (params: any) => Promise<any>
        getAllCustomVoices: () => Promise<any>
        deleteCustomVoice: (id: number) => Promise<any>
        playAudio: (filePath: string) => Promise<any>
        saveAudio: (filePath: string, destPath: string) => Promise<any>
        generateMusic: (prompt: string, durationMs?: number) => Promise<any>
      }
      license: {
        activate: (
          key: string
        ) => Promise<{ success: boolean; alreadyActive?: boolean; error?: string; planName?: string; installId?: string }>
        validate: () => Promise<{ valid: boolean; reason?: string }>
        deactivate: () => Promise<void>
        getCheckoutUrl: () => Promise<string>
        getDetails: () => Promise<{ email?: string; key?: string; quota?: string; plan?: string; lastValidated?: string }>
      }
    }
  }
}
