import type { FileSystemItem } from '$types/domain/file'
import type { StorageStat } from '$core/storage/storagePort'
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

export type StorageReadTextResponse = {
  content: string
}

export type StorageListResponse = {
  entries: string[]
}

export type StorageRenameResponse = {
  newPath: string
}

export type IpcRequestMap = {
  'workspace:select': IpcChannel<void, WorkspaceSelectResponse>
  'workspace:index': IpcChannel<string, WorkspaceIndexResponse>
  'storage:readText': IpcChannel<{ path: string }, StorageReadTextResponse>
  'storage:list': IpcChannel<{ path: string }, StorageListResponse>
  'storage:rename': IpcChannel<{ path: string; newName: string }, StorageRenameResponse>
  'storage:stat': IpcChannel<{ path: string }, StorageStat>
}

export type IpcEventMap = {
  'fs:event': unknown
}
