import React from 'react'
import { FileCard } from './FileCard'

interface DocumentCardProps {
  fileUrl: string
  fileName: string
  fileSize?: number
  onPreview?: () => void
  messageId?: string
}

export function DocumentCard({ fileUrl, fileName, fileSize, onPreview, messageId }: DocumentCardProps) {
  return (
    <div className="w-full max-w-[240px] sm:max-w-[280px] select-none">
      <FileCard
        fileUrl={fileUrl}
        fileName={fileName}
        fileSize={fileSize}
        onPreview={onPreview}
        messageId={messageId}
        className="border-0 p-0 hover:bg-transparent bg-transparent shadow-none gap-2"
      />
    </div>
  )
}

export default DocumentCard
