export interface StorageStat {
  isDirectory: boolean
  mtime: number
}

export interface StoragePort {
  readText(path: string): Promise<string>
  list(dirPath: string): Promise<string[]>
  rename(path: string, newName: string): Promise<string>
  stat(path: string): Promise<StorageStat>
}
