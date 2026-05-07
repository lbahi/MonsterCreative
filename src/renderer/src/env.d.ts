/// <reference types="vite/client" />

interface Window {
  api: {
    database: {
      getSettings: () => Promise<any>;
      updateSettings: (settings: any) => Promise<void>;
      getAllCampaigns: () => Promise<any[]>;
      createCampaign: (name: string, platforms: string[]) => Promise<void>;
      saveImage: (img: any) => Promise<void>;
      saveCopyVariant: (v: any) => Promise<void>;
      saveVideo: (vid: any) => Promise<void>;
    };
    keystore: {
      setFalKey: (key: string) => Promise<void>;
      getFalKey: () => Promise<string | null>;
      deleteFalKey: () => Promise<void>;
    };
    fal: {
      generateCopy: (promptOrMessages: any, modelId?: string) => Promise<any>;
      analyzeImageVision: (imageUrl: string, prompt: string, systemPrompt: string, modelId?: string) => Promise<any>;
      chatCompletion: (messages: any[], modelId?: string) => Promise<any>;
      getUsage: (timeframe: any, start: any, end: any) => Promise<any>;
      getBilling: () => Promise<any>;
      validateKey: (key: string) => Promise<{ valid: boolean, error?: string, credits?: number, currency?: string }>;
      getPricing: (ids: string[]) => Promise<any>;
      getAnalytics: (ids: string[], start: any, end: any) => Promise<any>;
      uploadImageFromDataUrl: (dataUrl: string) => Promise<any>;
      nanoBananaEdit: (params: any) => Promise<any>;
      reframeImage: (params: any) => Promise<any>;
      kontextEdit: (params: any) => Promise<any>;
      generateVideo: (params: any) => Promise<any>;
    };
    video: {
      generate: (request: any) => Promise<{ success: boolean; data?: any; error?: string }>;
    };
    external: {
      open: (url: string) => Promise<void>;
    };
    utils: {
      downloadFile: (params: { url: string, filename: string }) => Promise<{ success: boolean; path?: string; cancelled?: boolean; error?: string }>;
    };
    audio: {
      generateSpeech: (params: any) => Promise<{ success: boolean; data?: any; error?: string }>;
      speechToSpeech: (params: any) => Promise<{ success: boolean; data?: any; error?: string }>;
      cloneVoice: (params: any) => Promise<{ success: boolean; data?: any; error?: string }>;
      generateClonedSpeech: (params: any) => Promise<{ success: boolean; data?: any; error?: string }>;
      saveCustomVoice: (params: any) => Promise<{ success: boolean; data?: any; error?: string }>;
      getAllCustomVoices: () => Promise<{ success: boolean; data?: any; error?: string }>;
      deleteCustomVoice: (id: number) => Promise<{ success: boolean; error?: string }>;
      playAudio: (filePath: string) => Promise<{ success: boolean }>;
      saveAudio: (filePath: string, destPath: string) => Promise<{ success: boolean }>;
    };
    social: {
      saveAdImage: (params: { imageUrl: string; filename: string }) => Promise<{ success: boolean; path?: string; localUrl?: string; error?: string }>;
      openOutputFolder: () => Promise<void>;
    };
    auth: {
      activateLicense: (key: string) => Promise<{ activated: boolean; error: string | null; license_key?: any; instance?: any; meta?: any }>;
      validateLicense: () => Promise<{ valid: boolean; error: string | null }>;
      getStartupState: () => Promise<{ licensed: boolean; error?: string }>;
      getLicenseStatus: () => Promise<{ hasKey: boolean; key?: string; instanceId?: string }>;
    };
    update: {
      onAvailable: (cb: any) => void;
      onDownloaded: (cb: any) => void;
      install: () => Promise<void>;
    };
  }
}
