import { reatomComponent } from '@reatom/react'
import { fileListAtom } from '@renderer/entities/file'
import { ReactNode } from 'react'
import { FileNode } from './Node'

export const FileTree = reatomComponent((): ReactNode => {
  const fileList = fileListAtom()

  console.log(fileList)

  if (!fileList) return null
  return (
    <div style={{ width: 100 }}>
      {fileList.map((fileAtom) => (
        <FileNode fileAtom={fileAtom} />
      ))}
    </div>
  )
}, 'FileTree')
