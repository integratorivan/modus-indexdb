import type { FileSystemItem } from '$types/domain/file'
import { filesRepo } from './db'
import { invokeIpc } from './ipcClient'
import { storageClient } from './storageClient'

/**
 * Отвечает за синхронизацию IndexedDB и внешнего хранилища.
 */
export const storageFacade = {
  getFile: (id: string) => filesRepo.getById(id),
  getAll: () => filesRepo.getAll(),
  clear: () => filesRepo.clear(),
  save: (file: FileSystemItem) => filesRepo.save(file),
  saveMany: (files: FileSystemItem[]) => filesRepo.saveMany(files),
  async syncWorkspace(workspacePath: string): Promise<number> {
    const result = await invokeIpc('workspace:index', workspacePath)

    if (!result.success) {
      throw new Error(result.error ?? 'Workspace index failed')
    }

    await filesRepo.clear()
    if (result.items.length > 0) {
      await filesRepo.saveMany(result.items)
    }

    return result.count
  },
  async ensureFileContent(file: FileSystemItem): Promise<FileSystemItem> {
    const cached = await filesRepo.getById(file.id)
    if (cached?.content) {
      return cached
    }

    const base = cached ?? file
    const content = await storageClient.readText(base.path)
    const updated: FileSystemItem = { ...base, content }
    await filesRepo.save(updated)
    return updated
  }
}
