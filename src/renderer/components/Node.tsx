import { reatomComponent } from '@reatom/react'
import { FileSystemItem } from '@src/types/domain/file'
import { ReactNode } from 'react'

export const FileNode = reatomComponent((fileAtom: FileSystemItem): ReactNode => {
  return <div>{fileAtom.name}</div>
}, 'FileNode')
