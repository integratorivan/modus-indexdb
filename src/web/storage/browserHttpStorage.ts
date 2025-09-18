import type { StoragePort, StorageStat } from '$core/storage/storagePort'

/**
 * Заготовка адаптера для браузерного окружения. Реализация появится, когда будет готов API.
 */
export class BrowserHttpStorage implements StoragePort {
  constructor(private readonly baseUrl: string) {}

  async readText(path: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/${path}`)
    if (!response.ok) throw new Error(`Failed to read ${path}`)
    return response.text()
  }

  async list(dirPath: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/${dirPath}`)
    if (!response.ok) throw new Error(`Failed to list ${dirPath}`)
    return (await response.json()) as string[]
  }

  async rename(path: string, newName: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName })
    })
    if (!response.ok) throw new Error(`Failed to rename ${path}`)
    const data = await response.json()
    return data?.newPath ?? data
  }

  async stat(path: string): Promise<StorageStat> {
    const response = await fetch(`${this.baseUrl}/${path}?metadata=true`)
    if (!response.ok) throw new Error(`Failed to stat ${path}`)
    return (await response.json()) as StorageStat
  }
}
