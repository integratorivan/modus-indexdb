import type { WorkspaceSelectResponse } from '$types/ipc'
import { invokeIpc } from './ipcClient'

export interface RendererSystemApi {
  selectWorkspaceDirectory(): Promise<WorkspaceSelectResponse>
}

/**
 * Создаёт клиентские методы, работающие через типизированный IPC.
 */
export const createRendererSystemApi = (): RendererSystemApi => ({
  selectWorkspaceDirectory: () => invokeIpc('workspace:select')
})
