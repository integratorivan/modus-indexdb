import type { StoragePort, StorageStat } from '$core/storage/storagePort'

/**
 * Реализация хранилища поверх HTTP API.
 */
export class HttpApiStorage implements StoragePort {
  constructor(private readonly baseUrl: string) {}

  async readText(path: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/${path}`)
    if (!response.ok) {
      throw new Error(`Failed to read ${path}: ${response.status}`)
    }
    return response.text()
  }

  async list(dirPath: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/${dirPath}`)
    if (!response.ok) {
      throw new Error(`Failed to list ${dirPath}: ${response.status}`)
    }
    return (await response.json()) as string[]
  }

  async rename(path: string, newName: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName })
    })

    if (!response.ok) {
      throw new Error(`Failed to rename ${path}: ${response.status}`)
    }

    const data = await response.json()
    return data?.newPath ?? data
  }

  async stat(path: string): Promise<StorageStat> {
    const response = await fetch(`${this.baseUrl}/${path}?metadata=true`)
    if (!response.ok) {
      throw new Error(`Failed to stat ${path}: ${response.status}`)
    }
    const data = (await response.json()) as StorageStat
    return data
  }
}
