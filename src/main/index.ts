import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { dbService } from './database'
import { keystoreService } from './keystore'
import { licenseService } from './services/license.service'
import { 
  BillingService, 
  TextService, 
  ImageService, 
  VideoService, 
  AudioService 
} from './services/fal'
import fs from 'fs'
import path from 'path'

const billingService = new BillingService()
const textService = new TextService()
const imageService = new ImageService()
const videoService = new VideoService()
const audioService = new AudioService()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'MonsterCreative',
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#07070F',
      symbolColor: '#FFFFFF',
      height: 32
    },
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  if (!is.dev) {
    // IMPORTANT: For a private repo, electron-updater needs a token to read releases.
    // DANGER: We are embedding a token. You should generate a "Fine-Grained" Personal Access Token
    // that ONLY has "Read" access to "Contents" and "Metadata" of this repository.
    // Do NOT use your full-access classic token here in production for security!
    autoUpdater.requestHeaders = {
      "Authorization": "token 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"
    }
    autoUpdater.checkForUpdatesAndNotify()
  }

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update:available')
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update:downloaded')
  })

  ipcMain.handle('update:install', () => {
    autoUpdater.quitAndInstall()
  })
}

// Support for YouTube embeds and silencing dxcompiler.dll warnings
app.disableHardwareAcceleration()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC Handlers: Database
  ipcMain.handle('db:getSettings', () => dbService.getSettings())
  ipcMain.handle('db:updateSettings', (_, settings) => dbService.updateSettings(settings))
  ipcMain.handle('db:getAllCampaigns', () => dbService.getAllCampaigns())
  ipcMain.handle('db:createCampaign', (_, name, platforms) => dbService.createCampaign(name, platforms))
  ipcMain.handle('db:saveImage', (_, img) => dbService.saveImage(img))
  ipcMain.handle('db:saveCopyVariant', (_, v) => dbService.saveCopyVariant(v))
  // ipcMain.handle('db:saveVideo', (_, vid) => dbService.saveVideo(vid))

  // IPC Handlers: Keystore
  ipcMain.handle('key:setFalKey', (_, key) => keystoreService.setFalKey(key))
  ipcMain.handle('key:getFalKey', () => keystoreService.getFalKey())
  ipcMain.handle('key:deleteFalKey', () => keystoreService.deleteFalKey())

  // IPC Handlers: License / Auth
  ipcMain.handle('auth:activateLicense', async (_, key: string) => {
    try {
      const result = await licenseService.activateLicense(key)
      return result
    } catch (error: any) {
      return { activated: false, error: error.message || 'Network error. Please check your connection.' }
    }
  })

  ipcMain.handle('auth:validateLicense', async () => {
    try {
      const result = await licenseService.validateLicense()
      return result
    } catch (error: any) {
      return { valid: false, error: error.message || 'Network error during license validation.' }
    }
  })

  ipcMain.handle('auth:getStartupState', async () => {
    try {
      const info = await licenseService.getStoredLicenseInfo()
      if (!info.hasKey) {
        return { licensed: false, error: 'No license key found.' }
      }
      const result = await licenseService.validateLicense()
      return { licensed: result.valid, error: result.error }
    } catch {
      return { licensed: false, error: 'Could not validate license. Please check your connection.' }
    }
  })

  ipcMain.handle('auth:getLicenseStatus', async () => {
    try {
      return await licenseService.getStoredLicenseInfo()
    } catch {
      return { hasKey: false }
    }
  })

  // IPC Handlers: Fal
  ipcMain.handle('fal:generateCopy', (_, promptOrMessages, modelId) => textService.generateCopy(promptOrMessages, modelId))
  ipcMain.handle('fal:analyzeImageVision', (_, imageUrl, prompt, systemPrompt, modelId) => textService.analyzeImageVision(imageUrl, prompt, systemPrompt, modelId))
  ipcMain.handle('fal:chatCompletion', (_, messages, modelId) => textService.chatCompletion(messages, modelId))
  ipcMain.handle('fal:getUsage', (_, timeframe, start, end) => billingService.getUsage(timeframe, start, end))
  ipcMain.handle('fal:getBilling', () => billingService.getBilling())
  ipcMain.handle('fal:validateKey', (_, key) => billingService.validateKey(key))
  ipcMain.handle('fal:getPricing', (_, ids) => billingService.getPricing(ids))
  ipcMain.handle('fal:getAnalytics', (_, ids, start, end) => billingService.getAnalytics(ids, start, end))
  ipcMain.handle('fal:uploadImageFromDataUrl', (_, dataUrl) => imageService.uploadImageFromDataUrl(dataUrl))
  ipcMain.handle('fal:nanoBananaEdit', (_, params) => imageService.nanoBananaEdit(params))
  ipcMain.handle('fal:reframeImage', (_, params) => imageService.reframeImage(params))
  ipcMain.handle('fal:kontextEdit', (_, params) => imageService.kontextEdit(params))
  ipcMain.handle('fal:generateVideo', (_, params) => videoService.generateVideo(params))

  ipcMain.handle('video:generate', async (_event, request: any) => {
    try {
      const result = await videoService.generateVideo(request)

      // Persist to database
      await dbService.saveGeneratedVideo({
        prompt: request.prompt,
        model: request.modelId || 'fal-ai/pixverse/v6/image-to-video',
        resolution: request.resolution,
        duration: request.duration,
        url: result.url,
        fileName: result.fileName,
        fileSize: result.fileSize,
        createdAt: new Date().toISOString()
      })

      return { success: true, data: result }
    } catch (error: any) {
      console.error('[IPC video:generate] Error:', error)
      return { success: false, error: error.message }
    }
  })


  // IPC Handlers: Utils
  ipcMain.handle('util:openExternal', async (_, url) => {
    await shell.openExternal(url)
  })

  // IPC Handlers: Social Ads — save generated image to renderer public folder
  ipcMain.handle('social:saveAdImage', async (_, { imageUrl, filename }: { imageUrl: string; filename: string }) => {
    try {
      // In production, save next to the renderer html; in dev, save to public folder
      const rendererDir = is.dev
        ? path.join(__dirname, '../../src/renderer/public/OutputSocialAds')
        : path.join(__dirname, '../renderer/OutputSocialAds')

      if (!fs.existsSync(rendererDir)) fs.mkdirSync(rendererDir, { recursive: true })

      const safeName = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      const destPath = path.join(rendererDir, safeName)

      const resp = await fetch(imageUrl)
      if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`)
      const buffer = Buffer.from(await resp.arrayBuffer())
      fs.writeFileSync(destPath, buffer)

      return { success: true, path: destPath, localUrl: `./OutputSocialAds/${safeName}` }
    } catch (error: any) {
      console.error('[social:saveAdImage]', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('social:openOutputFolder', async () => {
    const rendererDir = is.dev
      ? path.join(__dirname, '../../src/renderer/public/OutputSocialAds')
      : path.join(__dirname, '../renderer/OutputSocialAds')
    if (!fs.existsSync(rendererDir)) fs.mkdirSync(rendererDir, { recursive: true })
    await shell.openPath(rendererDir)
  })

  ipcMain.handle('util:downloadFile', async (_, { url, filename }) => {
    const { dialog } = require('electron')
    const { writeFile } = require('fs/promises')

    
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: filename,
      filters: [{ name: 'Videos', extensions: ['mp4'] }]
    })

    if (!filePath) return { success: false, cancelled: true }

    try {
      const resp = await fetch(url)
      const buffer = Buffer.from(await resp.arrayBuffer())
      await writeFile(filePath, buffer)
      return { success: true, path: filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // IPC Handlers: Audio
  ipcMain.handle('audio:generateSpeech', async (_, params) => {
    try {
      const result = await audioService.generateSpeech(params)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('audio:speechToSpeech', async (_, params) => {
    try {
      const result = await audioService.speechToSpeech(params)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('audio:cloneVoice', async (_, params) => {
    try {
      const result = await audioService.cloneVoice(params)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('audio:generateClonedSpeech', async (_, params) => {
    try {
      const result = await audioService.generateClonedSpeech(params)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Save speaker embedding to disk + register in DB
  ipcMain.handle('audio:saveCustomVoice', async (_, params: { name: string; embeddingUrl: string; samplePath?: string }) => {
    try {
      const voicesDir = path.join(app.getPath('userData'), 'custom-voices')
      if (!fs.existsSync(voicesDir)) fs.mkdirSync(voicesDir, { recursive: true })

      // Download the .safetensors embedding file from Fal CDN
      const safeName = params.name.replace(/[^a-zA-Z0-9_-]/g, '_')
      const embeddingPath = path.join(voicesDir, `${safeName}_${Date.now()}.safetensors`)
      const resp = await fetch(params.embeddingUrl)
      if (!resp.ok) throw new Error('Failed to download embedding from Fal CDN')
      const buffer = Buffer.from(await resp.arrayBuffer())
      fs.writeFileSync(embeddingPath, buffer)

      // Persist metadata to SQLite
      const id = dbService.saveCustomVoice({
        name: params.name,
        embeddingPath,
        samplePath: params.samplePath
      })

      return { success: true, data: { id, embeddingPath } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('audio:getAllCustomVoices', async () => {
    try {
      const voices = dbService.getAllCustomVoices()
      return { success: true, data: voices }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('audio:deleteCustomVoice', async (_, id: number) => {
    try {
      // Also remove the embedding file from disk
      const voices = dbService.getAllCustomVoices() as any[]
      const voice = voices.find(v => v.id === id)
      if (voice?.embedding_path && fs.existsSync(voice.embedding_path)) {
        fs.unlinkSync(voice.embedding_path)
      }
      dbService.deleteCustomVoice(id)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('audio:playAudio', async (_, filePath) => {
    try {
      await shell.openPath(filePath)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('audio:saveAudio', async (_, filePath, destPath) => {
    const { copyFile } = require('fs/promises')
    try {
      await copyFile(filePath, destPath)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
