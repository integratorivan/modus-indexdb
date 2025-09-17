import { dialog, ipcMain, IpcMainInvokeEvent } from 'electron'
import { indexWorkspace } from './filesystem'
import type { IpcRequestMap, WorkspaceIndexResponse } from '@src/types/ipc'

type RequestArg<K extends keyof IpcRequestMap> = IpcRequestMap[K]['req'] extends void
  ? undefined
  : IpcRequestMap[K]['req']

type IpcInvokeHandler<K extends keyof IpcRequestMap> = (
  event: IpcMainInvokeEvent,
  request: RequestArg<K>
) => Promise<IpcRequestMap[K]['res']> | IpcRequestMap[K]['res']

/**
 * Регистрирует типизированный IPC-обработчик в main-процессе.
 */
const registerInvokeHandler = <K extends keyof IpcRequestMap>(
  channel: K,
  handler: IpcInvokeHandler<K>
): void => {
  ipcMain.handle(channel, (event, request) => handler(event, request))
}

/**
 * Обрабатывает запрос выбора рабочей директории.
 */
const handleWorkspaceSelect: IpcInvokeHandler<'workspace:select'> = async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select workspace folder'
  })

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true }
  }

  return { canceled: false, path: result.filePaths[0] }
}

/**
 * Выполняет индексацию файловой системы в рамках выбранного workspace.
 */
const handleWorkspaceIndex: IpcInvokeHandler<'workspace:index'> = async (
  _event,
  workspacePath
): Promise<WorkspaceIndexResponse> => {
  try {
    if (!workspacePath) {
      return {
        success: false,
        items: [],
        count: 0,
        error: 'Workspace path is not provided'
      }
    }

    const items = await indexWorkspace(workspacePath)

    return { success: true, items, count: items.length }
  } catch (error) {
    console.error('Workspace indexation failed:', error)
    return {
      success: false,
      items: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Инициализирует все IPC-каналы main-процесса.
 */
export const registerIpcHandlers = (): void => {
  registerInvokeHandler('workspace:select', handleWorkspaceSelect)
  registerInvokeHandler('workspace:index', handleWorkspaceIndex)
}
