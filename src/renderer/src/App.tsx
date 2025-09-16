import { ReactNode, useMemo } from 'react'
import { FileTree } from './components/FileTree'
import {
  currentWorkspaceAtom,
  initWorkspaceAction,
  requestWorkspaceSelectionAction
} from './entities/workspace'
import { fileListAtom, initFilesAction } from './entities/file'
import { reatomComponent } from '@reatom/react'

const App = reatomComponent((): ReactNode => {
  // Инициализируем подписки workspace и files
  useMemo(() => initWorkspaceAction(), [])
  useMemo(() => initFilesAction(), [])

  const currentWorkspace = currentWorkspaceAtom()
  const fileList = fileListAtom()

  if (!currentWorkspace) {
    return <p>Workspace not selected</p>
  }

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ minWidth: '200px' }}>
        <button onClick={() => void requestWorkspaceSelectionAction()}>
          {currentWorkspace ? 'Change workspace' : 'Select workspace'}
        </button>
        <p style={{ fontSize: 12, marginTop: 8 }}>
          {currentWorkspace ? `Workspace: ${currentWorkspace}` : 'Workspace not selected'}
        </p>
        <p style={{ fontSize: 12, marginTop: 8 }}>Files indexed: {fileList.length}</p>
        {/* Пример отображения списка файлов */}
        <div style={{ marginTop: 16, maxHeight: '200px', overflow: 'auto' }}>
          {fileList.map((file) => (
            <div key={file.id} style={{ fontSize: 10, padding: '2px 0' }}>
              {file.type === 'folder' ? '📁' : '📄'} {file.name}
            </div>
          ))}
        </div>
      </div>
      <FileTree />
      <h1>Test</h1>
    </div>
  )
}, 'App')

export default App
