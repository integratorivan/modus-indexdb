import { action, atom } from '@reatom/core'
import { BaseFile } from './types'

// Атом для хранения списка файлов
export const fileListAtom = atom<BaseFile[]>([], 'fileListAtom')

// Действие для инициализации подписки на файлы
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
