import { ElectronAPI } from '@electron-toolkit/preload'
import { FileSystemItem } from '@src/types/domain/file'
import type { WorkspaceIndexResponse, WorkspaceSelectResponse } from '@src/types/ipc'

type WorkspaceRecord = {
  key: string
  path: string
  updatedAt: number
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      selectWorkspaceDirectory(): Promise<WorkspaceSelectResponse>
    }
    modus: {
      files: {
        getAll(): Promise<FileSystemItem[]>
        getById(id: string): Promise<FileSystemItem | undefined>
        save(f: FileSystemItem): Promise<string>
        remove(id: string): Promise<void>
        clear(): Promise<void>
      }
      workspace: {
        getActive(): Promise<WorkspaceRecord | undefined>
        saveActive(path: string): Promise<string>
        clear(): Promise<void>
      }
      subscriptions: {
        filesAll(cb: (rows: FileSystemItem[]) => void): () => void
        filesByParent(
          parentId: string | undefined,
          cb: (rows: FileSystemItem[]) => void
        ): () => void
        workspaceActive(cb: (row: WorkspaceRecord | undefined) => void): () => void
      }
      selectWorkspaceDirectory(): Promise<WorkspaceSelectResponse>
      indexWorkspace(workspacePath: string): Promise<WorkspaceIndexResponse>
      onFsEvent(cb: (p: unknown) => void): void
    }
  }
}
