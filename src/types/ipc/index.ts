import type { FileSystemItem } from '@src/types/domain/file'
export type { FileSystemItem }

export type WorkspaceSelectResponse = {
  canceled: boolean
  path?: string
}

export type WorkspaceIndexResponse = {
  success: boolean
  items: FileSystemItem[]
  count: number
  error?: string
}

export type IpcRequestMap = {
  'workspace:select': { req: undefined; res: WorkspaceSelectResponse }
  'workspace:index': { req: string; res: WorkspaceIndexResponse }
}

export type IpcEventMap = {
  'fs:event': unknown
}
