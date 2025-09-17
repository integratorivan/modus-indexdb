import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { filesRepo, workspaceRepo, subscriptions } from './db'
import type {
  IpcRequestMap,
  WorkspaceIndexResponse,
  WorkspaceSelectResponse
} from '@src/types/ipc'

const invoke = <K extends keyof IpcRequestMap>(
  channel: K,
  request: IpcRequestMap[K]['req']
): Promise<IpcRequestMap[K]['res']> =>
  ipcRenderer.invoke(channel, request) as Promise<IpcRequestMap[K]['res']>

const api = {
  selectWorkspaceDirectory: (): Promise<WorkspaceSelectResponse> =>
    invoke('workspace:select', undefined),
  indexWorkspace: (workspacePath: string): Promise<WorkspaceIndexResponse> =>
    invoke('workspace:index', workspacePath)
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
