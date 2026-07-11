import { X, CornerUpLeft } from 'lucide-react'
import { Message } from '../types/chat'

interface ReplyPreviewProps {
  message?: Message
  onCancel?: () => void
}

export function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
  if (!message) return null

  const isInputPreview = !!onCancel

  const getSnippet = () => {
    if (message.deleted) return 'This message was deleted.'
    if (message.message_type === 'image') return '📷 Photo'
    if (message.message_type === 'video') return '🎥 Video'
    if (message.message_type === 'audio') return '🎤 Voice Message'
    if (message.message_type === 'document') return `📄 ${message.file_name || 'Document'}`
    return message.message || ''
  }

  const handleClick = () => {
    if (isInputPreview) return
    const targetElement = document.getElementById(`msg-${message.id}`)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      targetElement.classList.add('bg-primary/10')
      setTimeout(() => {
        targetElement.classList.remove('bg-primary/10')
      }, 1000)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-stretch gap-2.5 border-l-4 border-primary bg-muted/40 p-2 rounded-r-lg max-w-full ${
        isInputPreview
          ? 'mx-3 mt-2 mb-0 shadow-xs animate-in slide-in-from-bottom-2 duration-200'
          : 'cursor-pointer hover:bg-muted/70 mb-1.5 transition-all text-xs opacity-90'
      }`}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-0.5 justify-center">
        <span className="text-[10px] font-extrabold text-primary flex items-center gap-1 leading-none">
          <CornerUpLeft className="h-2.5 w-2.5" />
          Reply to {message.sender?.name || 'User'}
        </span>
        <span className="text-xs truncate font-medium text-muted-foreground leading-normal">
          {getSnippet()}
        </span>
      </div>

      {isInputPreview && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onCancel()
          }}
          className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          aria-label="Cancel reply"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
export default ReplyPreview
