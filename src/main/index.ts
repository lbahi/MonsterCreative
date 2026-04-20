import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { dbService } from './database'
import { keystoreService } from './keystore'
import { falService } from './falService'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
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
  ipcMain.handle('db:saveVideo', (_, vid) => dbService.saveVideo(vid))

  // IPC Handlers: Keystore
  ipcMain.handle('key:setFalKey', (_, key) => keystoreService.setFalKey(key))
  ipcMain.handle('key:getFalKey', () => keystoreService.getFalKey())
  ipcMain.handle('key:deleteFalKey', () => keystoreService.deleteFalKey())

  // IPC Handlers: Fal
  ipcMain.handle('fal:generateCopy', (_, promptOrMessages, modelId) => falService.generateCopy(promptOrMessages, modelId))
  ipcMain.handle('fal:analyzeImageVision', (_, imageUrl, prompt, systemPrompt, modelId) => falService.analyzeImageVision(imageUrl, prompt, systemPrompt, modelId))
  ipcMain.handle('fal:chatCompletion', (_, messages, modelId) => falService.chatCompletion(messages, modelId))
  ipcMain.handle('fal:getUsage', (_, timeframe, start, end) => falService.getUsage(timeframe, start, end))
  ipcMain.handle('fal:getBilling', () => falService.getBilling())
  ipcMain.handle('fal:validateKey', (_, key) => falService.validateKey(key))
  ipcMain.handle('fal:getPricing', (_, ids) => falService.getPricing(ids))
  ipcMain.handle('fal:getAnalytics', (_, ids, start, end) => falService.getAnalytics(ids, start, end))
  ipcMain.handle('fal:uploadImageFromDataUrl', (_, dataUrl) => falService.uploadImageFromDataUrl(dataUrl))
  ipcMain.handle('fal:nanoBananaEdit', (_, params) => falService.nanoBananaEdit(params))
  ipcMain.handle('fal:reframeImage', (_, params) => falService.reframeImage(params))
  ipcMain.handle('fal:kontextEdit', (_, params) => falService.kontextEdit(params))
  ipcMain.handle('fal:generateVideo', (_, params) => falService.generateVideo(params))

  ipcMain.handle('video:generate', async (_event, request: any) => {
    try {
      const result = await falService.generateVideo(request)

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

  ipcMain.handle('util:downloadFile', async (_, { url, filename }) => {
    const { dialog } = require('electron')
    const { writeFile } = require('fs/promises')
    const { join } = require('path')
    
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
