import { action, atom } from '@reatom/core'
import { modusClient } from '$entities/storage/modusClient'

export const currentWorkspaceAtom = atom<string | null>(null, 'currentWorkspaceAtom')

export const setWorkspaceAction = action((path: string) => {
  void modusClient.getWorkspace().saveActive(path)
}, 'setWorkspaceAction')

export const initWorkspaceAction = action(() =>
  modusClient.getSubscriptions().workspaceActive((path) => {
    currentWorkspaceAtom.set(path?.path || null)
  })
)

export const requestWorkspaceSelectionAction = action(async () => {
  try {
    const result = await modusClient.selectWorkspaceDirectory()

    if (!result || result.canceled || !result.path) {
      return
    }

    await modusClient.getWorkspace().saveActive(result.path)
    setWorkspaceAction(result.path)
  } catch (error) {
    console.error('Failed to select workspace directory', error)
  }
}, 'requestWorkspaceSelectionAction')
