import { Atom } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { BaseFile } from '@renderer/entities/file/types'
import { ReactNode } from 'react'

export const FileNode = reatomComponent((fileAtom: Atom<BaseFile>): ReactNode => {
  console.log(fileAtom())

  const file = fileAtom()
  return <div>{file.name}</div>
}, 'FileNode')
