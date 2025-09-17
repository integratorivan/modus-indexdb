import type { WorkspaceIndexResponse, WorkspaceSelectResponse } from '@src/types/ipc'
import { invokeIpc } from './ipcClient'

export interface RendererApi {
  selectWorkspaceDirectory(): Promise<WorkspaceSelectResponse>
  indexWorkspace(workspacePath: string): Promise<WorkspaceIndexResponse>
}

/**
 * Создаёт клиентские методы, работающие через типизированный IPC.
 */
export const createRendererApi = (): RendererApi => ({
  selectWorkspaceDirectory: () => invokeIpc('workspace:select'),
  indexWorkspace: (workspacePath: string) => invokeIpc('workspace:index', workspacePath)
})
