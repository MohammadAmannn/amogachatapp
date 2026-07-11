export interface Attachment {
  messageType: 'image' | 'video' | 'document' | 'audio'
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  duration?: number
  thumbnail?: string
}
