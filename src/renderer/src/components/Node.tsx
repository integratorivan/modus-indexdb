import { reatomComponent } from '@reatom/react'
import { BaseFile } from '@renderer/entities/file/types'
import { ReactNode } from 'react'

export const FileNode = reatomComponent((fileAtom: BaseFile): ReactNode => {
  return <div>{fileAtom.name}</div>
}, 'FileNode')
