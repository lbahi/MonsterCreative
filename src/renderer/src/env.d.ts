/// <reference types="vite/client" />

interface Window {
  api: {
    database: {
      getSettings: () => Promise<Record<string, unknown>>
      updateSettings: (settings: Record<string, unknown>) => Promise<void>
      getAllCampaigns: () => Promise<unknown[]>
      createCampaign: (name: string, platforms: string[]) => Promise<void>
      saveImage: (img: unknown) => Promise<void>
      saveCopyVariant: (v: unknown) => Promise<void>
      saveVideo: (vid: unknown) => Promise<void>
      getAdProject: (id: string) => Promise<any>
      getAllAdProjects: () => Promise<any[]>
      saveAdProject: (project: unknown) => Promise<void>
      getAllGeneratedImages: () => Promise<unknown[]>
      getAllGeneratedVideos: () => Promise<unknown[]>
      getAllCopyVariants: () => Promise<unknown[]>
      deleteGeneratedImage: (id: number) => Promise<void>
      deleteGeneratedVideo: (id: number) => Promise<void>
      deleteCopyVariant: (id: number) => Promise<void>
      deleteAdProject: (id: string) => Promise<void>
      toggleFavorite: (type: string, id: number | string, isFavorite: boolean) => Promise<void>
      updateTags: (type: string, id: number | string, tags: string) => Promise<void>
    }
    keystore: {
      setFalKey: (key: string) => Promise<void>
      getFalKey: () => Promise<string | null>
      deleteFalKey: () => Promise<void>
    }
    fal: {
      generateCopy: (
        promptOrMessages: string | unknown[],
        modelId?: string
      ) => Promise<{ data?: string; error?: string }>
      analyzeImageVision: (
        imageUrl: string,
        prompt: string,
        systemPrompt: string,
        modelId?: string
      ) => Promise<{ data?: string; error?: string }>
      chatCompletion: (
        messages: unknown[],
        modelId?: string
      ) => Promise<{ data?: string; error?: string }>
      getUsage: (timeframe: string, start?: string, end?: string) => Promise<unknown>
      getBilling: () => Promise<unknown>
      validateKey: (
        key: string
      ) => Promise<{ valid: boolean; error?: string; credits?: number; currency?: string }>
      getPricing: (ids: string[]) => Promise<unknown>
      getAnalytics: (ids: string[], start?: string, end?: string) => Promise<unknown>
      uploadImageFromDataUrl: (dataUrl: string) => Promise<{ url?: string; error?: string }>
      nanoBananaEdit: (params: unknown) => Promise<unknown>
      reframeImage: (params: unknown) => Promise<unknown>
      kontextEdit: (params: unknown) => Promise<unknown>
      generateVideo: (params: unknown) => Promise<unknown>
    }
    license: {
      activate: (key: string) => Promise<{ success: boolean; alreadyActive?: boolean; error?: string; planName?: string; installId?: string }>
      validate: () => Promise<{ valid: boolean; reason?: string }>
      deactivate: () => Promise<void>
      getCheckoutUrl: () => Promise<string>
      getDetails: () => Promise<{ email?: string; key?: string; quota?: string; plan?: string; lastValidated?: string }>
    }
    video: {
      generate: (request: {
        modelId: string
        prompt: string
        imageUrl: string
        referenceImageUrl?: string
        endImageUrl?: string
        aspectRatio?: string
        resolution: string
        duration: number
        audio: boolean
        negativePrompt?: string
      }) => Promise<{
        success: boolean
        data?: { url: string; fileName: string; fileSize: number }
        error?: string
      }>
    }
    external: {
      open: (url: string) => Promise<void>
    }
    utils: {
      downloadFile: (params: {
        url: string
        filename: string
      }) => Promise<{ success: boolean; path?: string; cancelled?: boolean; error?: string }>
    }
    audio: {
      generateSpeech: (params: {
        text: string
        voiceId: string
        stability?: number
      }) => Promise<{ success: boolean; data?: { url: string }; error?: string }>
      speechToSpeech: (
        params: unknown
      ) => Promise<{ success: boolean; data?: { url: string }; error?: string }>
      cloneVoice: (params: {
        audioUrl: string
        referenceText?: string
      }) => Promise<{ success: boolean; data?: { speakerEmbeddingUrl: string }; error?: string }>
      generateClonedSpeech: (params: {
        text: string
        speakerEmbeddingUrl: string
      }) => Promise<{ success: boolean; data?: { url: string }; error?: string }>
      saveCustomVoice: (
        params: unknown
      ) => Promise<{ success: boolean; data?: unknown; error?: string }>
      getAllCustomVoices: () => Promise<{ success: boolean; data?: unknown[]; error?: string }>
      deleteCustomVoice: (id: number) => Promise<{ success: boolean; error?: string }>
      playAudio: (filePath: string) => Promise<{ success: boolean }>
      saveAudio: (filePath: string, destPath: string) => Promise<{ success: boolean }>
    }
    social: {
      saveAdImage: (params: {
        imageUrl: string
        filename: string
      }) => Promise<{ success: boolean; path?: string; localUrl?: string; error?: string }>
      openOutputFolder: () => Promise<void>
    }
    auth: {
      activateLicense: (key: string) => Promise<{
        activated: boolean
        error: string | null
        purchaserEmail?: string
      }>
      validateLicense: () => Promise<{ valid: boolean; error: string | null }>
      getStartupState: () => Promise<{ licensed: boolean; error?: string }>
      getLicenseStatus: () => Promise<{ hasKey: boolean; key?: string; instanceId?: string }>
    }
    update: {
      check: () => Promise<boolean>
      onAvailable: (cb: () => void) => void
      onDownloaded: (cb: () => void) => void
      install: () => Promise<void>
    }
    sentry: {
      crash: () => Promise<void>
    }
  }
}
