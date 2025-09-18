import { filesRepo, workspaceRepo, subscriptions } from './db'
import { onFsEvent } from './fsEvents'
import type { RendererSystemApi } from './api'
import { storageFacade } from './storageFacade'

export interface ModusApi extends RendererSystemApi {
  storage: typeof storageFacade
  files: typeof filesRepo
  workspace: typeof workspaceRepo
  subscriptions: typeof subscriptions
  onFsEvent: typeof onFsEvent
}

/**
 * Формирует объединённый API, доступный в renderer через `window.modus`.
 */
export const createModusApi = (rendererApi: RendererSystemApi): ModusApi => ({
  storage: storageFacade,
  files: filesRepo,
  workspace: workspaceRepo,
  subscriptions,
  onFsEvent,
  selectWorkspaceDirectory: rendererApi.selectWorkspaceDirectory
})
