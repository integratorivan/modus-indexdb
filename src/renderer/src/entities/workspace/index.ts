import { action, atom } from '@reatom/core'

export const currentWorkspaceAtom = atom<string | null>(null, 'currentWorkspaceAtom')

export const setWorkspaceAction = action((path: string) => {
  window.modus.workspace.saveActive(path)
}, 'setWorkspaceAction')

export const initWorkspaceAction = action(() =>
  window.modus.subscriptions.workspaceActive((path) => {
    currentWorkspaceAtom.set(path?.path || null)
  })
)

export const requestWorkspaceSelectionAction = action(async () => {
  try {
    const result = await window.modus.selectWorkspaceDirectory()

    if (!result || result.canceled || !result.path) {
      return
    }

    await window.modus.workspace.saveActive(result.path)
    setWorkspaceAction(result.path)
  } catch (error) {
    console.error('Failed to select workspace directory', error)
  }
}, 'requestWorkspaceSelectionAction')
