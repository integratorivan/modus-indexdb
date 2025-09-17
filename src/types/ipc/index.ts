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

type IpcChannel<Request = void, Response = void> = {
  req: Request
  res: Response
}

export type IpcRequestMap = {
  'workspace:select': IpcChannel<void, WorkspaceSelectResponse>
  'workspace:index': IpcChannel<string, WorkspaceIndexResponse>
}

export type IpcEventMap = {
  'fs:event': unknown
}
