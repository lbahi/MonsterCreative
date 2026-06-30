import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  database: {
    getSettings: () => ipcRenderer.invoke('db:getSettings'),
    updateSettings: (settings: unknown) => ipcRenderer.invoke('db:updateSettings', settings),
    getAllCampaigns: () => ipcRenderer.invoke('db:getAllCampaigns'),
    createCampaign: (name: string, platforms: string[]) =>
      ipcRenderer.invoke('db:createCampaign', name, platforms),
    saveImage: (img: unknown) => ipcRenderer.invoke('db:saveImage', img),
    saveCopyVariant: (v: unknown) => ipcRenderer.invoke('db:saveCopyVariant', v),
    saveVideo: (vid: unknown) => ipcRenderer.invoke('db:saveVideo', vid),
    getAdProject: (id: string) => ipcRenderer.invoke('db:getAdProject', id),
    getAllAdProjects: () => ipcRenderer.invoke('db:getAllAdProjects'),
    saveAdProject: (project: unknown) => ipcRenderer.invoke('db:saveAdProject', project),
    // Legacy methods mapped to new API
    saveAdMakerSession: (session: unknown) => ipcRenderer.invoke('db:saveAdProject', session),
    getAdMakerSession: (id: number | string) => ipcRenderer.invoke('db:getAdProject', String(id)),
    getAllAdMakerSessions: () => ipcRenderer.invoke('db:getAllAdProjects'),
    getAllGeneratedImages: () => ipcRenderer.invoke('db:getAllGeneratedImages'),
    getAllGeneratedVideos: () => ipcRenderer.invoke('db:getAllGeneratedVideos'),
    getAllCopyVariants: () => ipcRenderer.invoke('db:getAllCopyVariants'),
    deleteGeneratedImage: (id: number) => ipcRenderer.invoke('db:deleteGeneratedImage', id),
    deleteGeneratedVideo: (id: number) => ipcRenderer.invoke('db:deleteGeneratedVideo', id),
    deleteCopyVariant: (id: number) => ipcRenderer.invoke('db:deleteCopyVariant', id),
    toggleFavorite: (type: string, id: number | string, isFavorite: boolean) => ipcRenderer.invoke('db:toggleFavorite', type, id, isFavorite),
    updateTags: (type: string, id: number | string, tags: string) => ipcRenderer.invoke('db:updateTags', type, id, tags)
  },
  keystore: {
    setFalKey: (key: string) => ipcRenderer.invoke('key:setFalKey', key),
    getFalKey: () => ipcRenderer.invoke('key:getFalKey'),
    deleteFalKey: () => ipcRenderer.invoke('key:deleteFalKey')
  },
  fal: {
    generateCopy: (promptOrMessages: unknown, modelId?: string) =>
      ipcRenderer.invoke('fal:generateCopy', promptOrMessages, modelId),
    analyzeImageVision: (
      imageUrl: string,
      prompt: string,
      systemPrompt: string,
      modelId?: string
    ) => ipcRenderer.invoke('fal:analyzeImageVision', imageUrl, prompt, systemPrompt, modelId),
    chatCompletion: (messages: unknown[], modelId?: string) =>
      ipcRenderer.invoke('fal:chatCompletion', messages, modelId),
    getUsage: (timeframe: unknown, start: unknown, end: unknown) =>
      ipcRenderer.invoke('fal:getUsage', timeframe, start, end),
    getBilling: () => ipcRenderer.invoke('fal:getBilling'),
    validateKey: (key: string) => ipcRenderer.invoke('fal:validateKey', key),
    getPricing: (ids: string[]) => ipcRenderer.invoke('fal:getPricing', ids),
    getAnalytics: (ids: string[], start: unknown, end: unknown) =>
      ipcRenderer.invoke('fal:getAnalytics', ids, start, end),
    uploadImageFromDataUrl: (dataUrl: string) =>
      ipcRenderer.invoke('fal:uploadImageFromDataUrl', dataUrl),
    nanoBananaEdit: (params: unknown) => ipcRenderer.invoke('fal:nanoBananaEdit', params),
    gptImage2Edit: (params: unknown) => ipcRenderer.invoke('fal:gptImage2Edit', params),
    reframeImage: (params: unknown) => ipcRenderer.invoke('fal:reframeImage', params),
    kontextEdit: (params: unknown) => ipcRenderer.invoke('fal:kontextEdit', params),
    generateVideo: (params: unknown) => ipcRenderer.invoke('fal:generateVideo', params)
  },
  video: {
    generate: (request: unknown) => ipcRenderer.invoke('video:generate', request)
  },
  external: {
    open: (url: string) => ipcRenderer.invoke('util:openExternal', url)
  },
  utils: {
    downloadFile: (params: { url: string; filename: string }) =>
      ipcRenderer.invoke('util:downloadFile', params)
  },
  social: {
    saveAdImage: (params: { imageUrl: string; filename: string }) =>
      ipcRenderer.invoke('social:saveAdImage', params),
    openOutputFolder: () => ipcRenderer.invoke('social:openOutputFolder')
  },
  audio: {
    generateSpeech: (params: unknown) => ipcRenderer.invoke('audio:generateSpeech', params),
    speechToSpeech: (params: unknown) => ipcRenderer.invoke('audio:speechToSpeech', params),
    cloneVoice: (params: unknown) => ipcRenderer.invoke('audio:cloneVoice', params),
    generateClonedSpeech: (params: unknown) =>
      ipcRenderer.invoke('audio:generateClonedSpeech', params),
    saveCustomVoice: (params: unknown) => ipcRenderer.invoke('audio:saveCustomVoice', params),
    getAllCustomVoices: () => ipcRenderer.invoke('audio:getAllCustomVoices'),
    deleteCustomVoice: (id: number) => ipcRenderer.invoke('audio:deleteCustomVoice', id),
    playAudio: (filePath: string) => ipcRenderer.invoke('audio:playAudio', filePath),
    saveAudio: (filePath: string, destPath: string) =>
      ipcRenderer.invoke('audio:saveAudio', filePath, destPath),
    generateMusic: (prompt: string, durationMs?: number) =>
      ipcRenderer.invoke('audio:generateMusic', prompt, durationMs)
  },
  license: {
    activate: (key: string) => ipcRenderer.invoke('license:activate', key),
    validate: () => ipcRenderer.invoke('license:validate'),
    deactivate: () => ipcRenderer.invoke('license:deactivate'),
    getCheckoutUrl: () => ipcRenderer.invoke('license:getCheckoutUrl'),
    getDetails: () => ipcRenderer.invoke('license:getDetails')
  },
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    onAvailable: (cb: (event: any, ...args: any[]) => void) =>
      ipcRenderer.on('update:available', cb),
    onDownloaded: (cb: (event: any, ...args: any[]) => void) =>
      ipcRenderer.on('update:downloaded', cb),
    install: () => ipcRenderer.invoke('update:install')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose preload APIs: Initialization error')
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
