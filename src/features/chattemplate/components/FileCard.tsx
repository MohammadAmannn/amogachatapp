import React, { useState } from 'react'
import { Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  getFileIconInfo, 
  getFileExtension, 
  useDownloadFile 
} from '@/components/DocumentViewer'
import { cn } from '@/lib/utils'
import { FileShareButton } from '@/components/document/FileShareButton'

export interface FileCardProps {
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt?: string
  onPreview?: () => void
  onDownload?: () => void
  allowPreview?: boolean
  allowDownload?: boolean
  file?: {
    file_url?: string
    file_name?: string
    file_size?: number
    created_at?: string
  }
  className?: string
  messageId?: string
}

export function FileCard({ 
  fileUrl, 
  fileName, 
  fileSize, 
  createdAt, 
  onPreview,
  onDownload,
  allowPreview = true,
  allowDownload = true,
  file,
  className,
  messageId
}: FileCardProps) {
  const { downloadFile, isDownloading } = useDownloadFile()

  const resolvedUrl = fileUrl || file?.file_url || ''
  const resolvedName = fileName || file?.file_name || 'Document'
  const resolvedSize = fileSize !== undefined ? fileSize : file?.file_size
  const resolvedCreatedAt = createdAt || file?.created_at

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const fileExt = getFileExtension(resolvedName, resolvedUrl)
  const iconInfo = getFileIconInfo(fileExt)
  const Icon = iconInfo.icon

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPreview) {
      onPreview()
    }
  }

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDownload) {
      onDownload()
    } else {
      downloadFile(resolvedUrl, resolvedName)
    }
  }

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-xl border border-border/80 bg-card hover:bg-muted/10 transition-all duration-200 w-full min-w-0 select-none",
      className
    )}>
      {/* File icon */}
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
        iconInfo.colorClass
      )}>
        <Icon className="h-4 w-4" />
      </div>

      {/* File info — takes remaining space, text truncated */}
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <span 
          className="text-xs font-bold text-foreground truncate" 
          title={resolvedName}
        >
          {resolvedName}
        </span>
        <span className="text-[10px] text-muted-foreground font-semibold leading-normal mt-0.5 truncate">
          {resolvedSize ? formatBytes(resolvedSize) : 'Unknown size'} 
          {resolvedCreatedAt ? ` • ${formatDate(resolvedCreatedAt)}` : ` • ${fileExt.toUpperCase()}`}
        </span>
      </div>

      {/* Action icons — always visible, never clipped */}
      <div className="flex items-center gap-0.5 shrink-0">
        {resolvedUrl && allowPreview && onPreview && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePreviewClick}
            aria-label="Preview"
            title="Preview"
            className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 cursor-pointer shrink-0"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        )}
        {resolvedUrl && allowDownload && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDownloadClick}
            disabled={isDownloading}
            aria-label="Download"
            title="Download"
            className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 cursor-pointer shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        )}
        {messageId && (
          <FileShareButton fileId={messageId} fileName={resolvedName} />
        )}
      </div>
    </div>
  )
}

export default FileCard
