import type { StoragePort } from '$core/storage/storagePort'
import { createStorage, type StorageConfig } from './storageFactory'

const envMode = (process.env.STORAGE_MODE ?? 'fs') as 'fs' | 'http'

const config: StorageConfig =
  envMode === 'http'
    ? { type: 'http', baseUrl: process.env.STORAGE_BASE_URL ?? 'http://localhost:3000' }
    : { type: 'fs' }

/**
 * Готовый экземпляр хранилища, который можно переиспользовать во всём приложении.
 */
export const storage: StoragePort = createStorage(config)

export { createStorage }
export type { StoragePort }
