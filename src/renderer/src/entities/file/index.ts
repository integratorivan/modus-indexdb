import { action, atom } from '@reatom/core'
import { BaseFile } from './types'
import { currentWorkspaceAtom } from '../workspace'

// Атом для хранения списка файлов
export const fileListAtom = atom<BaseFile[]>([], 'fileListAtom')

export const initFilesAction = action(() =>
  window.modus.subscriptions.filesAll((files) => {
    // Устанавливаем файлы в атом без контента (только индексация)
    const filesWithoutContent = files.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type as 'file' | 'folder', // Приводим к нужному типу
      updatedAt: file.updatedAt,
      parentId: file.parentId,
      content: '' // Контент не нужен на этапе индексации
    }))
    fileListAtom.set(filesWithoutContent)
  })
)

// Действие для индексации workspace
export const indexWorkspaceAction = action(async (workspacePath: string) => {
  try {
    console.log(`Starting workspace indexation: ${workspacePath}`)

    // Очищаем существующие файлы
    await window.modus.files.clear()

    // Запускаем индексацию через main процесс
    const result = await window.modus.indexWorkspace(workspacePath)

    if (!result.success) {
      console.error('Workspace indexation failed:', result.error)
      throw new Error(result.error || 'Indexation failed')
    }

    // Сохраняем найденные файлы в IndexedDB
    console.log(`Saving ${result.count} files to IndexedDB...`)
    for (const item of result.items) {
      await window.modus.files.save({
        id: item.id,
        name: item.name,
        type: item.type,
        updatedAt: item.updatedAt,
        parentId: item.parentId,
        content: item.content
      })
    }

    console.log(`Workspace indexation completed! ${result.count} files indexed.`)
    return { success: true, count: result.count }
  } catch (error) {
    console.error('Error during workspace indexation:', error)
    throw error
  }
}, 'indexWorkspaceAction')

export const initFileSystemWatcherAction = action(() => {
  console.log('Initializing file system watcher...')

  // Подписываемся на изменения currentWorkspaceAtom
  currentWorkspaceAtom.subscribe((workspacePath) => {
    if (workspacePath) {
      console.log('Workspace changed, starting file system indexation:', workspacePath)

      // Запускаем индексацию для нового workspace
      indexWorkspaceAction(workspacePath).catch((error) => {
        console.error('Failed to index workspace:', error)
      })
    } else {
      console.log('Workspace cleared, clearing file list')
      // Очищаем список файлов если workspace не выбран
      fileListAtom.set([])
    }
  })
}, 'initFileSystemWatcherAction')
