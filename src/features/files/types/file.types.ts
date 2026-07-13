export interface SharedFileMetadata {
  id: string
  bucket: string
  storagePath: string
  fileName: string
  fileSize?: number
  mimeType?: string
  conversationId: string
  ownerId: string
  createdAt: string
}
