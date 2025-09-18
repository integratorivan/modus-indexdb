import type { FileSystemItem } from '$types/domain/file'
import { storage } from '$main/storage'
import { join } from 'path'

const MAX_SCAN_DEPTH = 10

const IGNORED_DIRECTORIES = new Set(['node_modules'])

const isIgnorableEntry = (entryName: string): boolean =>
  entryName.startsWith('.') || IGNORED_DIRECTORIES.has(entryName)

/**
 * Рекурсивно обходит файловую систему и возвращает плоский список файлов и папок.
 */
export const scanFileSystem = async (
  directoryPath: string,
  parentId?: string,
  maxDepth = MAX_SCAN_DEPTH,
  currentDepth = 0
): Promise<FileSystemItem[]> => {
  if (currentDepth >= maxDepth) {
    console.warn(`Max depth reached for directory: ${directoryPath}`)
    return []
  }

  const items: FileSystemItem[] = []

  try {
    const entries = await storage.list(directoryPath)

    for (const entryName of entries) {
      if (isIgnorableEntry(entryName)) continue

      const fullPath = join(directoryPath, entryName)
      const stats = await storage.stat(fullPath)
      const id = fullPath

      const item: FileSystemItem = {
        id,
        name: entryName,
        type: stats.isDirectory ? 'folder' : 'file',
        parentId,
        updatedAt: stats.mtime,
        path: fullPath,
        content: ''
      }

      items.push(item)

      if (stats.isDirectory) {
        const subItems = await scanFileSystem(fullPath, fullPath, maxDepth, currentDepth + 1)
        items.push(...subItems)
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${directoryPath}:`, error)
  }

  return items
}

/**
 * Индексирует выбранный workspace, измеряя время выполнения и возвращая найденные элементы.
 */
export const indexWorkspace = async (workspacePath: string): Promise<FileSystemItem[]> => {
  const startTime = Date.now()

  try {
    const items = await scanFileSystem(workspacePath)
    const endTime = Date.now()

    console.log(`Indexation completed in ${endTime - startTime}ms. Found ${items.length} items.`)
    return items
  } catch (error) {
    console.error('Error during workspace indexation:', error)
    throw error
  }
}
