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

    // Запускаем индексацию workspace после выбора
    console.log('Starting automatic workspace indexation...')
    try {
      // Импортируем indexWorkspaceAction динамически, чтобы избежать циклических зависимостей
      const { indexWorkspaceAction } = await import('../file')
      await indexWorkspaceAction(result.path)
      console.log('Workspace indexation completed successfully')
    } catch (indexError) {
      console.error('Workspace indexation failed:', indexError)
      // Не прерываем выбор workspace если индексация не удалась
    }
  } catch (error) {
    console.error('Failed to select workspace directory', error)
  }
}, 'requestWorkspaceSelectionAction')
