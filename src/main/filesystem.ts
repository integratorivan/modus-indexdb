import { join } from 'path'
import { promises as fs } from 'fs'
import type { FileSystemItem } from '@src/types/domain/file'

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
    const entries = await fs.readdir(directoryPath, { withFileTypes: true })

    for (const entry of entries) {
      if (isIgnorableEntry(entry.name)) continue

      const fullPath = join(directoryPath, entry.name)
      const stats = await fs.stat(fullPath)
      const id = `${parentId || 'root'}_${entry.name}_${stats.mtime.getTime()}`

      const item: FileSystemItem = {
        id,
        name: entry.name,
        type: entry.isDirectory() ? 'folder' : 'file',
        parentId,
        updatedAt: stats.mtime.getTime(),
        content: ''
      }

      items.push(item)

      if (entry.isDirectory()) {
        const subItems = await scanFileSystem(fullPath, id, maxDepth, currentDepth + 1)
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
  console.log(`Starting indexation of workspace: ${workspacePath}`)
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
