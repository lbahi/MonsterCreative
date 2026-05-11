import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  database: {
    getSettings: () => ipcRenderer.invoke('db:getSettings'),
    updateSettings: (settings) => ipcRenderer.invoke('db:updateSettings', settings),
    getAllCampaigns: () => ipcRenderer.invoke('db:getAllCampaigns'),
    createCampaign: (name, platforms) => ipcRenderer.invoke('db:createCampaign', name, platforms),
    saveImage: (img) => ipcRenderer.invoke('db:saveImage', img),
    saveCopyVariant: (v: any) => ipcRenderer.invoke('db:saveCopyVariant', v),
    saveVideo: (vid: any) => ipcRenderer.invoke('db:saveVideo', vid),
  },
  keystore: {
    setFalKey: (key: string) => ipcRenderer.invoke('key:setFalKey', key),
    getFalKey: () => ipcRenderer.invoke('key:getFalKey'),
    deleteFalKey: () => ipcRenderer.invoke('key:deleteFalKey'),
  },
  fal: {
    generateCopy: (promptOrMessages: any, modelId?: string) => ipcRenderer.invoke('fal:generateCopy', promptOrMessages, modelId),
    analyzeImageVision: (imageUrl: string, prompt: string, systemPrompt: string, modelId?: string) => ipcRenderer.invoke('fal:analyzeImageVision', imageUrl, prompt, systemPrompt, modelId),
    chatCompletion: (messages: any[], modelId?: string) => ipcRenderer.invoke('fal:chatCompletion', messages, modelId),
    getUsage: (timeframe: any, start: any, end: any) => ipcRenderer.invoke('fal:getUsage', timeframe, start, end),
    getBilling: () => ipcRenderer.invoke('fal:getBilling'),
    validateKey: (key: string) => ipcRenderer.invoke('fal:validateKey', key),
    getPricing: (ids: string[]) => ipcRenderer.invoke('fal:getPricing', ids),
    getAnalytics: (ids: string[], start: any, end: any) => ipcRenderer.invoke('fal:getAnalytics', ids, start, end),
    uploadImageFromDataUrl: (dataUrl: string) => ipcRenderer.invoke('fal:uploadImageFromDataUrl', dataUrl),
    nanoBananaEdit: (params: any) => ipcRenderer.invoke('fal:nanoBananaEdit', params),
    reframeImage: (params: any) => ipcRenderer.invoke('fal:reframeImage', params),
    kontextEdit: (params: any) => ipcRenderer.invoke('fal:kontextEdit', params),
    generateVideo: (params: any) => ipcRenderer.invoke('fal:generateVideo', params),
  },
  video: {
    generate: (request: any) => ipcRenderer.invoke('video:generate', request)
  },
  external: {
    open: (url: string) => ipcRenderer.invoke('util:openExternal', url)
  },
  utils: {
    downloadFile: (params: { url: string, filename: string }) => ipcRenderer.invoke('util:downloadFile', params),
  },
  social: {
    saveAdImage: (params: { imageUrl: string; filename: string }) => ipcRenderer.invoke('social:saveAdImage', params),
    openOutputFolder: () => ipcRenderer.invoke('social:openOutputFolder'),
  },
  audio: {
    generateSpeech: (params: any) => ipcRenderer.invoke('audio:generateSpeech', params),
    speechToSpeech: (params: any) => ipcRenderer.invoke('audio:speechToSpeech', params),
    cloneVoice: (params: any) => ipcRenderer.invoke('audio:cloneVoice', params),
    generateClonedSpeech: (params: any) => ipcRenderer.invoke('audio:generateClonedSpeech', params),
    saveCustomVoice: (params: any) => ipcRenderer.invoke('audio:saveCustomVoice', params),
    getAllCustomVoices: () => ipcRenderer.invoke('audio:getAllCustomVoices'),
    deleteCustomVoice: (id: number) => ipcRenderer.invoke('audio:deleteCustomVoice', id),
    playAudio: (filePath: string) => ipcRenderer.invoke('audio:playAudio', filePath),
    saveAudio: (filePath: string, destPath: string) => ipcRenderer.invoke('audio:saveAudio', filePath, destPath),
  },
  license: {
    activate: (key: string) => ipcRenderer.invoke('license:activate', key),
    validate: () => ipcRenderer.invoke('license:validate'),
    deactivate: () => ipcRenderer.invoke('license:deactivate'),
  },
  update: {
    onAvailable: (cb: any) => ipcRenderer.on('update:available', cb),
    onDownloaded: (cb: any) => ipcRenderer.on('update:downloaded', cb),
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
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
