import { ReactNode } from 'react'
import { FileTree } from './components/FileTree'
import { currentWorkspaceAtom, requestWorkspaceSelectionAction } from './entities/workspace'
import { fileListAtom } from './entities/file'
import { reatomComponent } from '@reatom/react'

const App = reatomComponent((): ReactNode => {
  const currentWorkspace = currentWorkspaceAtom()
  const fileList = fileListAtom()

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
