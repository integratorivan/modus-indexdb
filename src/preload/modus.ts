import { filesRepo, workspaceRepo, subscriptions } from './db'
import { onFsEvent } from './fsEvents'
import type { RendererApi } from './api'

export interface ModusApi extends RendererApi {
  files: typeof filesRepo
  workspace: typeof workspaceRepo
  subscriptions: typeof subscriptions
  onFsEvent: typeof onFsEvent
}

/**
 * Формирует объединённый API, доступный в renderer через `window.modus`.
 */
export const createModusApi = (rendererApi: RendererApi): ModusApi => ({
  files: filesRepo,
  workspace: workspaceRepo,
  subscriptions,
  onFsEvent,
  selectWorkspaceDirectory: rendererApi.selectWorkspaceDirectory,
  indexWorkspace: rendererApi.indexWorkspace
})
