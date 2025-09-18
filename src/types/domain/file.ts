export interface FileSystemItem {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId?: string
  updatedAt: number
  path: string
  content: string
}
