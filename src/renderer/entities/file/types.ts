export type BaseFile = {
  id: string
  name: string
  type: 'file' | 'folder'
  updatedAt: number
  parentId?: string
  path: string
  content: string
}
