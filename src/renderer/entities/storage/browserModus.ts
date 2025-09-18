import type { FileSystemItem } from '$types/domain/file'
import type { ModusApi } from '$preload/modus'
import type { WorkspaceSelectResponse } from '$types/ipc'
import { BrowserHttpStorage } from '$web/storage/browserHttpStorage'

const WORKSPACE_KEY = 'active'

interface WorkspaceRecord {
  key: string
  path: string
  updatedAt: number
}

type FilesSubscriber = (rows: FileSystemItem[]) => void

type WorkspaceSubscriber = (row: WorkspaceRecord | undefined) => void

const httpStorage = new BrowserHttpStorage(import.meta.env.VITE_STORAGE_BASE_URL ?? '')

const fileCache = new Map<string, FileSystemItem>()
let workspaceRecord: WorkspaceRecord | undefined = undefined

const filesSubscribers = new Set<FilesSubscriber>()
const workspaceSubscribers = new Set<WorkspaceSubscriber>()

const notifyFiles = (): void => {
  const snapshot = Array.from(fileCache.values()).sort((a, b) => b.updatedAt - a.updatedAt)
  filesSubscribers.forEach((cb) => cb(snapshot))
}

const notifyWorkspace = (): void => {
  workspaceSubscribers.forEach((cb) => cb(workspaceRecord))
}

const filesRepo = {
  async getAll(): Promise<FileSystemItem[]> {
    return Array.from(fileCache.values())
  },
  async getById(id: string): Promise<FileSystemItem | undefined> {
    return fileCache.get(id)
  },
  async save(file: FileSystemItem): Promise<string> {
    fileCache.set(file.id, file)
    notifyFiles()
    return file.id
  },
  async saveMany(files: FileSystemItem[]): Promise<void> {
    files.forEach((file) => fileCache.set(file.id, file))
    notifyFiles()
  },
  async remove(id: string): Promise<void> {
    fileCache.delete(id)
    notifyFiles()
  },
  async clear(): Promise<void> {
    fileCache.clear()
    notifyFiles()
  },
  async getFiles(): Promise<FileSystemItem[]> {
    return Array.from(fileCache.values()).map((file) => ({
      ...file,
      content: ''
    }))
  }
} as unknown as ModusApi['files']

const storageFacade = {
  getFile: async (id: string) => filesRepo.getById(id),
  getAll: async () => filesRepo.getAll(),
  clear: async () => filesRepo.clear(),
  save: async (file: FileSystemItem) => filesRepo.save(file),
  saveMany: async (files: FileSystemItem[]) => filesRepo.saveMany(files),
  async syncWorkspace(workspacePath: string): Promise<number> {
    console.warn('[modus:fallback] syncWorkspace is not implemented for browser mode.', workspacePath)
    await filesRepo.clear()
    return fileCache.size
  },
  async ensureFileContent(file: FileSystemItem): Promise<FileSystemItem> {
    const cached = fileCache.get(file.id)
    if (cached?.content) {
      return cached
    }

    try {
      const content = await httpStorage.readText(file.path)
      const updated: FileSystemItem = { ...file, content }
      fileCache.set(updated.id, updated)
      notifyFiles()
      return updated
    } catch (error) {
      console.warn('[modus:fallback] Failed to fetch file content', { file, error })
      return file
    }
  }
} as unknown as ModusApi['storage']

const workspaceRepo = {
  async getActive(): Promise<WorkspaceRecord | undefined> {
    if (workspaceRecord) {
      return workspaceRecord
    }

    const stored = window.localStorage.getItem('modus.workspace.active')
    if (stored) {
      workspaceRecord = {
        key: WORKSPACE_KEY,
        path: stored,
        updatedAt: Date.now()
      }
    }

    return workspaceRecord
  },
  async saveActive(path: string): Promise<string> {
    workspaceRecord = {
      key: WORKSPACE_KEY,
      path,
      updatedAt: Date.now()
    }

    window.localStorage.setItem('modus.workspace.active', path)
    notifyWorkspace()
    return path
  },
  async clear(): Promise<void> {
    workspaceRecord = undefined
    window.localStorage.removeItem('modus.workspace.active')
    notifyWorkspace()
  }
} as unknown as ModusApi['workspace']

const subscriptions: ModusApi['subscriptions'] = {
  filesAll(cb) {
    filesSubscribers.add(cb)
    cb(Array.from(fileCache.values()))

    return () => {
      filesSubscribers.delete(cb)
    }
  },
  filesByParent(parentId, cb) {
    const handler: FilesSubscriber = (rows) => {
      cb(parentId ? rows.filter((row) => row.parentId === parentId) : rows)
    }

    filesSubscribers.add(handler)
    handler(Array.from(fileCache.values()))

    return () => {
      filesSubscribers.delete(handler)
    }
  },
  workspaceActive(cb) {
    workspaceSubscribers.add(cb)
    void workspaceRepo.getActive().then(cb)

    return () => {
      workspaceSubscribers.delete(cb)
    }
  }
}

const onFsEvent: ModusApi['onFsEvent'] = () => {
  console.warn('[modus:fallback] File system events are not supported in browser mode.')
}

const selectWorkspaceDirectory = async (): Promise<WorkspaceSelectResponse> => {
  console.warn('[modus:fallback] Workspace selection is not available in browser mode.')
  return { canceled: true }
}

export const createBrowserModus = (): ModusApi => ({
  storage: storageFacade,
  files: filesRepo,
  workspace: workspaceRepo,
  subscriptions,
  onFsEvent,
  selectWorkspaceDirectory
})
