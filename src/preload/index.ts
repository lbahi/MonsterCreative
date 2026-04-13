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
    saveCopyVariant: (v) => ipcRenderer.invoke('db:saveCopyVariant', v)
  },
  keystore: {
    setFalKey: (key) => ipcRenderer.invoke('key:setFalKey', key),
    getFalKey: () => ipcRenderer.invoke('key:getFalKey'),
    deleteFalKey: () => ipcRenderer.invoke('key:deleteFalKey')
  },
  fal: {
    getUsage: (timeframe?: string, start?: string, end?: string) => ipcRenderer.invoke('fal:getUsage', timeframe, start, end),
    getBilling: () => ipcRenderer.invoke('fal:getBilling'),
    validateKey: (key: string) => ipcRenderer.invoke('fal:validateKey', key),
    getPricing: (ids: string[]) => ipcRenderer.invoke('fal:getPricing', ids),
    getAnalytics: (ids: string[], start?: string, end?: string) => ipcRenderer.invoke('fal:getAnalytics', ids, start, end),
    uploadImage: (base64: string, fileName: string, contentType: string) => ipcRenderer.invoke('fal:uploadImage', base64, fileName, contentType),
  },
  external: {
    open: (url: string) => ipcRenderer.invoke('util:openExternal', url)
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
