import { action, atom } from '@reatom/core'
import { currentWorkspaceAtom } from '../workspace'
import type { FileSystemItem } from '$types/domain/file'
import { modusClient } from '$entities/storage/modusClient'

// Атом для хранения списка файлов
export const fileListAtom = atom<FileSystemItem[]>([], 'fileListAtom')

export const initFilesAction = action(() =>
  modusClient.getSubscriptions().filesAll((files) => {
    fileListAtom.set(files)
  })
)

export const syncWorkspaceAction = action(async (workspacePath: string) => {
  try {
    console.log(`Starting workspace synchronisation: ${workspacePath}`)
    const count = await modusClient.getStorage().syncWorkspace(workspacePath)
    console.log(`Workspace synchronised, ${count} items in cache`)
    return { success: true, count }
  } catch (error) {
    console.error('Error during workspace synchronisation:', error)
    throw error
  }
}, 'syncWorkspaceAction')

export const initFileSystemWatcherAction = action(() => {
  console.log('Initializing file system watcher...')

  currentWorkspaceAtom.subscribe((workspacePath) => {
    if (workspacePath) {
      console.log('Workspace changed, synchronising cache:', workspacePath)
      syncWorkspaceAction(workspacePath).catch((error) => {
        console.error('Failed to synchronise workspace:', error)
      })
    } else {
      console.log('Workspace cleared, resetting cache')
      fileListAtom.set([])
      void modusClient.getStorage().clear()
    }
  })
}, 'initFileSystemWatcherAction')
