import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { filesRepo, workspaceRepo, subscriptions } from './db'
import { FileSystemItem } from '@src/types/domain/file'

const api = {
  selectWorkspaceDirectory: (): Promise<{ canceled: boolean; path?: string }> =>
    ipcRenderer.invoke('workspace:select'),
  indexWorkspace: (
    workspacePath: string
  ): Promise<{
    success: boolean
    items: Array<FileSystemItem>
    count: number
    error?: string
  }> => ipcRenderer.invoke('workspace:index', workspacePath)
}

const modusAPI = {
  files: filesRepo,
  workspace: workspaceRepo,
  subscriptions,
  selectWorkspaceDirectory: api.selectWorkspaceDirectory,
  indexWorkspace: api.indexWorkspace,
  // любые события из main (например, от chokidar)
  onFsEvent: (cb: (p: unknown) => void) => {
    ipcRenderer.on('fs:event', (_e, p) => cb(p))
  }
}

type ModusAPI = typeof modusAPI

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('modus', modusAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  const targetWindow = window as typeof window & {
    electron: typeof electronAPI
    api: typeof api
    modus: ModusAPI
  }

  targetWindow.electron = electronAPI
  targetWindow.api = api
  targetWindow.modus = modusAPI
}
