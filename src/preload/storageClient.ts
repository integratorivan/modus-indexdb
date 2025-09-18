import type { StorageStat } from '$core/storage/storagePort'
import type { StorageListResponse, StorageRenameResponse } from '$types/ipc'
import { invokeIpc } from './ipcClient'
import type { IpcRequestMap } from '$types/ipc'

const readText = async (path: string): Promise<string> => {
  const response = (await invokeIpc(
    'storage:readText',
    { path }
  )) as IpcRequestMap['storage:readText']['res']
  return response.content
}

const list = async (path: string): Promise<string[]> => {
  const response = (await invokeIpc('storage:list', { path })) as StorageListResponse
  return response.entries
}

const rename = async (path: string, newName: string): Promise<string> => {
  const response = (await invokeIpc('storage:rename', {
    path,
    newName
  })) as StorageRenameResponse
  return response.newPath
}

const stat = (path: string): Promise<StorageStat> => invokeIpc('storage:stat', { path }) as Promise<StorageStat>

export const storageClient = {
  readText,
  list,
  rename,
  stat
}
