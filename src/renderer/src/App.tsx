import { ReactNode, useMemo } from 'react'
import { FileTree } from './components/FileTree'
import {
  currentWorkspaceAtom,
  initWorkspaceAction,
  requestWorkspaceSelectionAction
} from './entities/workspace'
import { fileListAtom, initFilesAction, indexWorkspaceAction } from './entities/file'
import { reatomComponent } from '@reatom/react'

const App = reatomComponent((): ReactNode => {
  // Инициализируем подписки workspace и files
  useMemo(() => initWorkspaceAction(), [])
  useMemo(() => initFilesAction(), [])

  const currentWorkspace = currentWorkspaceAtom()
  const fileList = fileListAtom()

  // Функция для ручной переиндексации
  const handleReindex = async (): Promise<void> => {
    if (!currentWorkspace) {
      console.warn('No workspace selected for reindexing')
      return
    }

    try {
      console.log('Starting manual workspace reindexation...')
      await indexWorkspaceAction(currentWorkspace)
      console.log('Manual reindexation completed successfully')
    } catch (error) {
      console.error('Manual reindexation failed:', error)
    }
  }

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
        
        {/* Кнопка для ручной переиндексации */}
        <button
          onClick={handleReindex}
          style={{
            marginTop: 8,
            fontSize: 12,
            padding: '4px 8px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Reindex Workspace
        </button>
        
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
