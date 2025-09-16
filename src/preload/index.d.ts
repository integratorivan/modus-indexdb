import { ElectronAPI } from '@electron-toolkit/preload'

type FileRecord = {
  id: string
  name: string
  type: string
  updatedAt: number
  parentId?: string
  content: string
}

type WorkspaceRecord = {
  key: string
  path: string
  updatedAt: number
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      selectWorkspaceDirectory(): Promise<{ canceled: boolean; path?: string }>
    }
    modus: {
      files: {
        getAll(): Promise<FileRecord[]>
        getById(id: string): Promise<FileRecord | undefined>
        save(f: FileRecord): Promise<string>
        remove(id: string): Promise<void>
        clear(): Promise<void>
      }
      workspace: {
        getActive(): Promise<WorkspaceRecord | undefined>
        saveActive(path: string): Promise<string>
        clear(): Promise<void>
      }
      subscriptions: {
        filesAll(cb: (rows: FileRecord[]) => void): () => void
        filesByParent(parentId: string | undefined, cb: (rows: FileRecord[]) => void): () => void
        workspaceActive(cb: (row: WorkspaceRecord | undefined) => void): () => void
      }
      selectWorkspaceDirectory(): Promise<{ canceled: boolean; path?: string }>
      indexWorkspace(workspacePath: string): Promise<{
        success: boolean
        items: Array<{
          id: string
          name: string
          type: 'file' | 'folder'
          parentId?: string
          updatedAt: number
          content: string
        }>
        count: number
        error?: string
      }>
      onFsEvent(cb: (p: unknown) => void): void
    }
  }
}
