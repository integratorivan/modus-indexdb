import { ipcRenderer } from 'electron'
import type { IpcEventMap } from '@src/types/ipc'

export type FsEventHandler = (payload: IpcEventMap['fs:event']) => void

/**
 * Подписывает обработчик на события файловой системы из main-процесса.
 */
export const onFsEvent = (handler: FsEventHandler): void => {
  ipcRenderer.on('fs:event', (_event, payload) => handler(payload))
}
