import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { promises as fs, Stats } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Интерфейс для файла/папки
interface FileSystemItem {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId?: string
  updatedAt: number
  content: string
}

// Функция для рекурсивного сканирования файловой системы
async function scanFileSystem(
  directoryPath: string,
  parentId?: string,
  maxDepth = 10,
  currentDepth = 0
): Promise<FileSystemItem[]> {
  if (currentDepth >= maxDepth) {
    console.warn(`Max depth reached for directory: ${directoryPath}`)
    return []
  }

  const items: FileSystemItem[] = []

  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true })

    for (const entry of entries) {
      // Пропускаем скрытые файлы и системные папки
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue
      }

      const fullPath = join(directoryPath, entry.name)
      const stats = await fs.stat(fullPath)
      const id = `${parentId || 'root'}_${entry.name}_${stats.mtime.getTime()}`

      const item: FileSystemItem = {
        id,
        name: entry.name,
        type: entry.isDirectory() ? 'folder' : 'file',
        parentId,
        updatedAt: stats.mtime.getTime(),
        content: '' // Контент файлов не загружаем на этапе индексации
      }

      items.push(item)

      // Если это папка, рекурсивно сканируем её содержимое
      if (entry.isDirectory()) {
        const subItems = await scanFileSystem(fullPath, id, maxDepth, currentDepth + 1)
        items.push(...subItems)
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${directoryPath}:`, error)
  }

  return items
}

// Функция для индексации workspace
async function indexWorkspace(workspacePath: string): Promise<FileSystemItem[]> {
  console.log(`Starting indexation of workspace: ${workspacePath}`)
  const startTime = Date.now()

  try {
    const items = await scanFileSystem(workspacePath)
    const endTime = Date.now()

    console.log(`Indexation completed in ${endTime - startTime}ms. Found ${items.length} items.`)
    return items
  } catch (error) {
    console.error('Error during workspace indexation:', error)
    throw error
  }
}

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
      sandbox: false
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

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Обработчик выбора workspace
  ipcMain.handle('workspace:select', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select workspace folder'
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true }
    }

    return { canceled: false, path: result.filePaths[0] }
  })

  // Обработчик индексации workspace
  ipcMain.handle('workspace:index', async (_event, workspacePath: string) => {
    try {
      const items = await indexWorkspace(workspacePath)
      return { success: true, items, count: items.length }
    } catch (error) {
      console.error('Workspace indexation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        items: [],
        count: 0
      }
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
