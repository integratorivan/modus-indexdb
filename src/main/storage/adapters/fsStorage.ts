import { promises as fs } from 'fs'
import { dirname, join } from 'path'
import type { StoragePort, StorageStat } from '$core/storage/storagePort'

/**
 * Реализация файлового хранилища, работающего через Node.js FS API.
 */
export class FsStorage implements StoragePort {
  async readText(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8')
  }

  async list(dirPath: string): Promise<string[]> {
    return fs.readdir(dirPath)
  }

  async rename(entryPath: string, newName: string): Promise<string> {
    const newPath = join(dirname(entryPath), newName)
    await fs.rename(entryPath, newPath)
    return newPath
  }

  async stat(entryPath: string): Promise<StorageStat> {
    const stats = await fs.stat(entryPath)
    return {
      isDirectory: stats.isDirectory(),
      mtime: stats.mtime.getTime()
    }
  }
}
