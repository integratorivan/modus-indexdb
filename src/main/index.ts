import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc'
import { createMainWindow } from './window'

let mainWindow: BrowserWindow | null = null

/**
 * Создаёт главное окно и отслеживает его закрытие, чтобы поддерживать single-instance UX.
 */
const createApplicationWindow = (): void => {
  mainWindow = createMainWindow()
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  createApplicationWindow()

  app.on('activate', () => {
    if (!mainWindow) {
      createApplicationWindow()
    } else {
      mainWindow.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
