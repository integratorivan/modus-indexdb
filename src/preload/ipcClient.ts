import { ipcRenderer } from 'electron'
import type { IpcRequestMap } from '$types/ipc'

/**
 * Вычисляет форму аргументов `ipcRenderer.invoke` в зависимости от наличия запроса.
 */
export type InvokeArgs<K extends keyof IpcRequestMap> = IpcRequestMap[K]['req'] extends void
  ? []
  : [IpcRequestMap[K]['req']]

/**
 * Типизированная обёртка над `ipcRenderer.invoke`, возвращающая корректный ответ.
 */
export const invokeIpc = <K extends keyof IpcRequestMap>(
  channel: K,
  ...args: InvokeArgs<K>
): Promise<IpcRequestMap[K]['res']> =>
  ipcRenderer.invoke(channel, ...(args as unknown[])) as Promise<IpcRequestMap[K]['res']>
