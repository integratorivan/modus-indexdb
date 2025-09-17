export type BaseFile = {
  id: string
  name: string
  type: 'file' | 'folder'
  updatedAt: number
  parentId?: string
  content: string
}
