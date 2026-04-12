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
    getUsage: (timeframe?: string) => ipcRenderer.invoke('fal:getUsage', timeframe),
    getBilling: () => ipcRenderer.invoke('fal:getBilling')
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
