import { app, shell, BrowserWindow, ipcMain, dialog, session } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { dbService } from './database'
import { keystoreService } from './keystore'
import { freemiusService } from './services/freemius.service'
import {
  BillingService,
  TextService,
  ImageService,
  VideoService,
  AudioService,
  VideoGenerationRequest
} from './services/fal'
import fs from 'fs'
import { writeFile, copyFile } from 'fs/promises'
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
      webSecurity: false,
      webviewTag: true
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
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'lbahi',
      repo: 'MonsterCreative',
      private: false
    })

    autoUpdater.logger = log
    // @ts-ignore: Accessing transports for file level configuration
    autoUpdater.logger.transports.file.level = 'info'

    log.info('App version:', app.getVersion())
    log.info('Checking for updates...')

    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...')
    })

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info)
    })

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update NOT available:', info)
    })

    autoUpdater.on('error', (err) => {
      log.error('Updater error:', err)
    })

    autoUpdater.on('download-progress', (p) => {
      log.info('Download progress:', p.percent)
    })

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info)
    })

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

  ipcMain.handle('update:check', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      return result !== null
    } catch (err) {
      log.error('Manual update check failed:', err)
      return false
    }
  })
}

// Support for YouTube embeds and silencing dxcompiler.dll warnings
app.disableHardwareAcceleration()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.monstercreative.app')

  // Fix YouTube embed in production: configure both default and webview sessions
  const ytFilter = { urls: ['*://*.youtube.com/*', '*://*.youtube-nocookie.com/*'] }
  const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

  // Helper: apply YouTube header fixes to a session
  function configureYouTubeSession(ses: Electron.Session): void {
    ses.setUserAgent(CHROME_UA)
    // Spoof outgoing Referer/Origin only for document loads, not for media streams/AJAX
    ses.webRequest.onBeforeSendHeaders(ytFilter, (details, callback) => {
      if (details.resourceType === 'mainFrame' || details.resourceType === 'subFrame') {
        details.requestHeaders['Origin'] = 'https://monstercreative.lbahi.digital'
        details.requestHeaders['Referer'] = 'https://monstercreative.lbahi.digital/'
      }
      details.requestHeaders['User-Agent'] = CHROME_UA
      callback({ cancel: false, requestHeaders: details.requestHeaders })
    })
    // Strip restrictive response headers
    ses.webRequest.onHeadersReceived(ytFilter, (details, callback) => {
      const headers = { ...details.responseHeaders }
      delete headers['x-frame-options']
      delete headers['X-Frame-Options']
      if (headers['content-security-policy']) {
        headers['content-security-policy'] = headers['content-security-policy'].map(
          (csp) => csp.replace(/frame-ancestors[^;]*(;|$)/gi, '')
        )
      }
      if (headers['Content-Security-Policy']) {
        headers['Content-Security-Policy'] = headers['Content-Security-Policy'].map(
          (csp) => csp.replace(/frame-ancestors[^;]*(;|$)/gi, '')
        )
      }
      callback({ responseHeaders: headers })
    })
  }

  // Apply to default session (for iframes) and the 'youtube' partition (for webview)
  configureYouTubeSession(session.defaultSession)
  configureYouTubeSession(session.fromPartition('youtube'))

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
  ipcMain.handle('db:createCampaign', (_, name, platforms) =>
    dbService.createCampaign(name, platforms)
  )
  ipcMain.handle('db:saveImage', (_, img) => dbService.saveImage(img))
  ipcMain.handle('db:saveCopyVariant', (_, v) => dbService.saveCopyVariant(v))
  ipcMain.handle('db:getAdProject', (_, id) => dbService.getAdProject(id))
  ipcMain.handle('db:getAllAdProjects', () => dbService.getAllAdProjects())
  ipcMain.handle('db:saveAdProject', (_, project) => dbService.saveAdProject(project))
  ipcMain.handle('db:getAllGeneratedImages', () => dbService.getAllGeneratedImages())
  ipcMain.handle('db:getAllGeneratedVideos', () => dbService.getAllGeneratedVideos())
  ipcMain.handle('db:getAllCopyVariants', () => dbService.getAllCopyVariants())
  ipcMain.handle('db:deleteGeneratedImage', (_, id) => dbService.deleteGeneratedImage(id))
  ipcMain.handle('db:deleteGeneratedVideo', (_, id) => dbService.deleteGeneratedVideo(id))
  ipcMain.handle('db:deleteCopyVariant', (_, id) => dbService.deleteCopyVariant(id))
  ipcMain.handle('db:toggleFavorite', (_, type, id, isFavorite) => dbService.toggleFavorite(type, id, isFavorite))
  ipcMain.handle('db:updateTags', (_, type, id, tags) => dbService.updateTags(type, id, tags))

  // ipcMain.handle('db:saveVideo', (_, vid) => dbService.saveVideo(vid))


  // IPC Handlers: Keystore
  ipcMain.handle('key:setFalKey', (_, key) => keystoreService.setFalKey(key))
  ipcMain.handle('key:getFalKey', () => keystoreService.getFalKey())
  ipcMain.handle('key:deleteFalKey', () => keystoreService.deleteFalKey())

  // IPC Handlers: License
  ipcMain.handle('license:activate', async (_, key: string) => {
    return await freemiusService.activate(key)
  })

  ipcMain.handle('license:validate', async () => {
    return await freemiusService.validate()
  })

  ipcMain.handle('license:deactivate', async () => {
    return await freemiusService.deactivate()
  })

  ipcMain.handle('license:getCheckoutUrl', async () => {
    const url = await freemiusService.getCheckoutUrl()
    await shell.openExternal(url)
    return url
  })

  ipcMain.handle('license:getDetails', async () => {
    return await freemiusService.getDetails()
  })

  // IPC Handlers: Fal
  ipcMain.handle('fal:generateCopy', (_, promptOrMessages, modelId) =>
    textService.generateCopy(promptOrMessages, modelId)
  )
  ipcMain.handle('fal:analyzeImageVision', (_, imageUrl, prompt, systemPrompt, modelId) =>
    textService.analyzeImageVision(imageUrl, prompt, systemPrompt, modelId)
  )
  ipcMain.handle('fal:chatCompletion', (_, messages, modelId) =>
    textService.chatCompletion(messages, modelId)
  )
  ipcMain.handle('fal:getUsage', (_, timeframe, start, end) =>
    billingService.getUsage(timeframe, start, end)
  )
  ipcMain.handle('fal:getBilling', () => billingService.getBilling())
  ipcMain.handle('fal:validateKey', (_, key) => billingService.validateKey(key))
  ipcMain.handle('fal:getPricing', (_, ids) => billingService.getPricing(ids))
  ipcMain.handle('fal:getAnalytics', (_, ids, start, end) =>
    billingService.getAnalytics(ids, start, end)
  )
  ipcMain.handle('fal:uploadImageFromDataUrl', (_, dataUrl) =>
    imageService.uploadImageFromDataUrl(dataUrl)
  )
  ipcMain.handle('fal:nanoBananaEdit', (_, params) => imageService.nanoBananaEdit(params))
  ipcMain.handle('fal:gptImage2Edit', (_, params) => imageService.gptImage2Edit(params))
  ipcMain.handle('fal:reframeImage', (_, params) => imageService.reframeImage(params))
  ipcMain.handle('fal:kontextEdit', (_, params) => imageService.kontextEdit(params))
  ipcMain.handle('fal:generateVideo', (_, params) => videoService.generateVideo(params))

  ipcMain.handle('video:generate', async (_event, request: VideoGenerationRequest) => {
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
    } catch (error: unknown) {
      console.error('[IPC video:generate] Error:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  // IPC Handlers: Utils
  ipcMain.handle('util:openExternal', async (_, url) => {
    await shell.openExternal(url)
  })

  // IPC Handlers: Social Ads — save generated image to renderer public folder
  ipcMain.handle(
    'social:saveAdImage',
    async (_, { imageUrl, filename }: { imageUrl: string; filename: string }) => {
      try {
        // In production, save next to the renderer html; in dev, save to public folder
        const rendererDir = is.dev
          ? path.join(__dirname, '../../src/renderer/public/OutputSocialAds')
          : path.join(__dirname, '../renderer/OutputSocialAds')

        if (!fs.existsSync(rendererDir)) fs.mkdirSync(rendererDir, { recursive: true })

        const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_')
        const destPath = path.join(rendererDir, safeName)

        const resp = await fetch(imageUrl)
        if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`)
        const buffer = Buffer.from(await resp.arrayBuffer())
        fs.writeFileSync(destPath, buffer)

        return { success: true, path: destPath, localUrl: `./OutputSocialAds/${safeName}` }
      } catch (error: unknown) {
        console.error('[social:saveAdImage]', error)
        return { success: false, error: error instanceof Error ? error.message : String(error) }
      }
    }
  )

  ipcMain.handle('social:openOutputFolder', async () => {
    const rendererDir = is.dev
      ? path.join(__dirname, '../../src/renderer/public/OutputSocialAds')
      : path.join(__dirname, '../renderer/OutputSocialAds')
    if (!fs.existsSync(rendererDir)) fs.mkdirSync(rendererDir, { recursive: true })
    await shell.openPath(rendererDir)
  })

  ipcMain.handle('util:downloadFile', async (_, { url, filename }) => {
    const ext = filename.split('.').pop()?.toLowerCase() || 'png'
    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)

    const filters = isImage
      ? [{ name: 'Images', extensions: [ext, 'png', 'jpg', 'jpeg', 'webp'] }]
      : [{ name: 'Videos', extensions: ['mp4', 'webm', 'mov'] }]

    const { filePath } = await dialog.showSaveDialog({
      defaultPath: filename,
      filters
    })

    if (!filePath) return { success: false, cancelled: true }

    try {
      const resp = await fetch(url)
      const buffer = Buffer.from(await resp.arrayBuffer())
      await writeFile(filePath, buffer)
      return { success: true, path: filePath }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // IPC Handlers: Audio
  ipcMain.handle('audio:generateSpeech', async (_, params) => {
    try {
      const result = await audioService.generateSpeech(params)
      return { success: true, data: result }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('audio:speechToSpeech', async (_, params) => {
    try {
      const result = await audioService.speechToSpeech(params)
      return { success: true, data: result }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('audio:cloneVoice', async (_, params) => {
    try {
      const result = await audioService.cloneVoice(params)
      return { success: true, data: result }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('audio:generateClonedSpeech', async (_, params) => {
    try {
      const result = await audioService.generateClonedSpeech(params)
      return { success: true, data: result }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  // Save speaker embedding to disk + register in DB
  ipcMain.handle(
    'audio:saveCustomVoice',
    async (_, params: { name: string; embeddingUrl: string; samplePath?: string }) => {
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
      } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
      }
    }
  )

  ipcMain.handle('audio:getAllCustomVoices', async () => {
    try {
      const voices = dbService.getAllCustomVoices()
      return { success: true, data: voices }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('audio:deleteCustomVoice', async (_, id: number) => {
    try {
      // Also remove the embedding file from disk
      const voices = dbService.getAllCustomVoices() as Record<string, any>[]
      const voice = voices.find((v) => v.id === id)
      if (voice?.embedding_path && fs.existsSync(voice.embedding_path)) {
        fs.unlinkSync(voice.embedding_path)
      }
      dbService.deleteCustomVoice(id)
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('audio:playAudio', async (_, filePath) => {
    try {
      await shell.openPath(filePath)
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('audio:saveAudio', async (_, filePath, destPath) => {
    try {
      await copyFile(filePath, destPath)
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('audio:generateMusic', async (_, prompt, durationMs) => {
    try {
      const result = await audioService.generateMusic(prompt, durationMs)
      return { success: true, data: result }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
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
