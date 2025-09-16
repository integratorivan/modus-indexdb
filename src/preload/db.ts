import Dexie, { Table, liveQuery } from 'dexie'

type FileRecord = {
  id: string
  name: string
  type: string
  updatedAt: number
  parentId?: string
  content: string
}

type WorkspaceRecord = {
  key: string
  path: string
  updatedAt: number
}

class AppDB extends Dexie {
  files!: Table<FileRecord, string>
  workspace!: Table<WorkspaceRecord, string>
  constructor() {
    super('modus')
    this.version(1).stores({
      files: 'id, parentId, type, updatedAt',
      workspace: '&key'
    })
  }
}

export const db = new AppDB()

const WORKSPACE_KEY = 'active'

// Минимальный репозиторий
export const filesRepo = {
  getAll: () => db.files.toArray(),
  getById: (id: string) => db.files.get(id),
  save: (f: FileRecord) => db.files.put(f),
  remove: (id: string) => db.files.delete(id),
  clear: () => db.files.clear(),
  // Функция для получения только названий файлов (без контента)
  getFiles: async () => {
    const files = await db.files.toArray()
    // Возвращаем файлы без контента для индексации
    return files.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      updatedAt: file.updatedAt,
      parentId: file.parentId,
      content: '' // Контент не нужен на этапе индексации
    }))
  }
}

export const workspaceRepo = {
  getActive: () => db.workspace.get(WORKSPACE_KEY),
  saveActive: (path: string) => {
    console.log({ path }, 123)
    return db.workspace.put({
      key: WORKSPACE_KEY,
      path,
      updatedAt: Date.now()
    })
  },
  clear: () => db.workspace.delete(WORKSPACE_KEY)
}

export const subscriptions = {
  /**
   * Подписка на все файлы, отсортированные по updatedAt (по убыванию).
   * Вернёт функцию, которую нужно вызвать в cleanup, чтобы отписаться.
   */
  filesAll(cb: (rows: FileRecord[]) => void) {
    const sub = liveQuery(() => db.files.orderBy('updatedAt').reverse().toArray()).subscribe({
      next: cb,
      error: console.error
    })

    return () => sub.unsubscribe()
  },
  /**
   * Подписка на файлы по parentId. Если parentId не передан, следим за всеми файлами.
   * Вернёт функцию, которую нужно вызвать в cleanup, чтобы отписаться.
   */
  filesByParent(parentId: string | undefined, cb: (rows: FileRecord[]) => void) {
    const sub = liveQuery(() =>
      parentId ? db.files.where({ parentId }).toArray() : db.files.filter(() => true).toArray()
    ).subscribe({ next: cb, error: console.error })

    return () => sub.unsubscribe()
  },
  /**
   * Подписка на активный workspace. Колбэк получит актуальную запись или undefined.
   * Вернёт функцию, которую нужно вызвать в cleanup, чтобы отписаться.
   */
  workspaceActive(cb: (row: WorkspaceRecord | undefined) => void) {
    const sub = liveQuery(() => db.workspace.get(WORKSPACE_KEY)).subscribe({
      next: cb,
      error: console.error
    })

    return () => sub.unsubscribe()
  }
}
