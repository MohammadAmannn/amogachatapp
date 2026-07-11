import { ImageViewer } from './ImageViewer'
import { VideoPlayer } from './VideoPlayer'
import { DocumentCard } from './DocumentCard'
import { VoicePlayer } from './VoicePlayer'

interface AttachmentRendererProps {
  messageType: 'image' | 'video' | 'document' | 'audio' | 'text'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  duration?: number
  onViewDocument?: (url: string, name: string) => void
  messageId?: string
}

export function AttachmentRenderer({
  messageType,
  fileUrl,
  fileName,
  fileSize,
  duration,
  onViewDocument,
  messageId,
}: AttachmentRendererProps) {
  if (!fileUrl) return null

  switch (messageType) {
    case 'image':
      return <ImageViewer fileUrl={fileUrl} fileName={fileName} />
    case 'video':
      return <VideoPlayer fileUrl={fileUrl} fileName={fileName} />
    case 'audio':
      return <VoicePlayer fileUrl={fileUrl} duration={duration} />
    case 'document':
      return (
        <DocumentCard
          fileUrl={fileUrl}
          fileName={fileName || 'Attachment'}
          fileSize={fileSize}
          onPreview={onViewDocument ? () => onViewDocument(fileUrl, fileName || 'Attachment') : undefined}
          messageId={messageId}
        />
      )
    default:
      return null
  }
}
export default AttachmentRenderer
