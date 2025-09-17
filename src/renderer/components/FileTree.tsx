import { reatomComponent } from '@reatom/react'
import { ReactNode } from 'react'
import { fileListAtom } from '../entities/file'
import { FileNode } from './Node'

export const FileTree = reatomComponent((): ReactNode => {
  const fileList = fileListAtom()

  console.log(fileList)

  if (!fileList) return null
  return (
    <div style={{ width: 100 }}>
      {fileList.map((fileAtom) => (
        <FileNode key={fileAtom.id} {...fileAtom} />
      ))}
    </div>
  )
}, 'FileTree')
