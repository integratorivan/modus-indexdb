import { ReactNode, useEffect } from 'react'
import { initWorkspaceAction } from '../entities/workspace'
import { initFilesAction, initFileSystemWatcherAction } from '../entities/file'
import { reatomComponent } from '@reatom/react'

interface IntegrationProviderProps {
  children: ReactNode
}

/**
 * Провайдер для инициализации всех системных интеграций и подписок
 * Отвечает за:
 * - Инициализацию workspace системы
 * - Настройку file system watcher
 * - Подписку на файлы из IndexedDB
 */

export const IntegrationProvider = reatomComponent(
  ({ children }: IntegrationProviderProps): ReactNode => {
    useEffect(() => {
      // 1. Инициализируем workspace систему
      console.log('- Initializing workspace system')
      initWorkspaceAction()

      // 2. Инициализируем file system watcher (реагирует на изменения workspace)
      console.log('- Setting up file system watcher')
      initFileSystemWatcherAction()

      // 3. Инициализируем подписку на файлы из IndexedDB
      console.log('- Setting up IndexedDB file subscription')
      initFilesAction()

      console.log('System integrations initialized successfully')
    }, [])

    return <>{children}</>
  },
  'IntegrationProvider'
)
