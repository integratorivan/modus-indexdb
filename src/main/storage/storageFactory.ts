import { FsStorage } from './adapters/fsStorage'
import { HttpApiStorage } from './adapters/httpApiStorage'
import type { StoragePort } from '$core/storage/storagePort'

export type StorageConfig =
  | { type: 'fs' }
  | { type: 'http'; baseUrl: string }

/**
 * Создаёт конкретное хранилище на основе конфигурации.
 */
export const createStorage = (config: StorageConfig): StoragePort => {
  switch (config.type) {
    case 'fs':
      return new FsStorage()
    case 'http':
      return new HttpApiStorage(config.baseUrl)
    default:
      throw new Error(`Unknown storage type: ${(config as { type: string }).type}`)
  }
}
