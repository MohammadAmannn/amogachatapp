import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Check, CheckCheck, Clock, CornerUpLeft, MapPin } from 'lucide-react'
import { Message } from '../types/chat.types'
import { AttachmentRenderer } from '@/features/files/components/attachment-renderer'
import { MessageActions } from './message-actions'
import { MessageToolbar } from './message-toolbar'
import { ReplyPreview } from './reply-preview'
import { toast } from 'sonner'

interface MessageBubbleProps {
  message: Message
  currentUserId: string
  isGroup: boolean
  onReact: (
    messageId: string,
    action: 'thumb' | 'favorite' | 'flag' | 'star' | 'pin' | 'archive' | 'action_this',
    value: boolean
  ) => void
  onDeleteForMe: (messageId: string) => void
  onDeleteForEveryone?: (messageId: string) => void
  onReply: (message: Message) => void
  onForward: (message: Message) => void
  onViewDocument?: (url: string, name: string, messageId?: string) => void
  onOpenLocationOnMap?: (location: any, type: 'current' | 'live') => void
}

export function MessageBubble({
  message,
  currentUserId,
  isGroup,
  onReact,
  onDeleteForMe,
  onDeleteForEveryone,
  onReply,
  onForward,
  onViewDocument,
  onOpenLocationOnMap,
}: MessageBubbleProps) {
  if (message.message_type === 'system') {
    return (
      <div className="w-full flex justify-center my-1 select-none animate-in fade-in duration-200">
        <div className="bg-sky-100/80 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200/50 dark:border-sky-900/30 rounded-xl px-4 py-1.5 text-[11px] font-semibold shadow-xs max-w-[85%] text-center">
          {message.message}
        </div>
      </div>
    )
  }

  const isMe = message.sender_user_id === currentUserId
  const [showMobileToolbar, setShowMobileToolbar] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const messageTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Copy text handler
  const handleCopy = () => {
    if (message.message) {
      navigator.clipboard.writeText(message.message)
      toast.success('Message copied to clipboard!')
      setShowMobileToolbar(false)
    }
  }

  // Share handler
  const handleShare = () => {
    if (navigator.share && message.message) {
      navigator.share({
        text: message.message,
      }).catch(() => {})
    } else {
      toast.success('Ready to share message link!')
    }
    setShowMobileToolbar(false)
  }

  // Touch handlers to support mobile long press
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowMobileToolbar(true)
      if (navigator.vibrate) {
        navigator.vibrate(50) // Small haptic feedback
      }
    }, 600)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const handleBubbleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMobileToolbar((prev) => !prev)
  }

  const handleReact = (
    action: 'thumb' | 'favorite' | 'flag' | 'star' | 'pin' | 'archive' | 'action_this',
    value: boolean
  ) => {
    if (onReact) {
      onReact(message.id, action, value)
    }
  }

  const handleDeleteForMe = () => {
    if (onDeleteForMe) {
      onDeleteForMe(message.id)
    }
    setShowMobileToolbar(false)
  }

  const handleDeleteForEveryone = () => {
    if (onDeleteForEveryone) {
      onDeleteForEveryone(message.id)
    }
    setShowMobileToolbar(false)
  }

  const handleReply = () => {
    onReply(message)
    setShowMobileToolbar(false)
  }

  const handleForward = () => {
    onForward(message)
    setShowMobileToolbar(false)
  }

  return (
    <div
      id={`msg-${message.id}`}
      className={cn(
        'group flex flex-col items-start gap-1 max-w-[85%] sm:max-w-[75%] transition-all duration-300 relative pb-3',
        {
          'ms-auto items-end': isMe,
        }
      )}
    >
      {/* Sender name for group chats (not me) */}
      {isGroup && !isMe && message.sender && (
        <span className="text-[10px] font-semibold text-muted-foreground/80 px-1 leading-none select-none">
          {message.sender.name}
        </span>
      )}

      {/* Bubble Container */}
      <div
        onClick={handleBubbleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed border transition-all duration-200 shadow-xs max-w-full relative group/bubble select-text',
          {
            'bg-emerald-100 dark:bg-emerald-950/40 text-foreground border-emerald-200/50 dark:border-emerald-900/30 rounded-tr-none':
              isMe && !message.deleted,
            'bg-card text-foreground rounded-tl-none border-border/50': !isMe && !message.deleted,
            'bg-muted/30 text-muted-foreground border-muted rounded-2xl italic': message.deleted,
          }
        )}
      >
        {/* Forwarded Tag */}
        {message.forward && !message.deleted && (
          <span className="text-[10px] text-muted-foreground font-extrabold flex items-center gap-1 mb-1 leading-none opacity-80 select-none">
            <CornerUpLeft className="h-2.5 w-2.5 scale-x-[-1] text-sky-500" />
            Forwarded message
          </span>
        )}

        {/* Reply Message Preview inside the bubble */}
        {message.reply && message.replyto_message && !message.deleted && (
          <ReplyPreview message={message.replyto_message} />
        )}

        {/* Attachments Renderer */}
        {!message.deleted && message.message_type !== 'location' && (
          <AttachmentRenderer
            messageType={message.message_type as any}
            fileUrl={message.file_url}
            fileName={message.file_name}
            fileSize={message.file_size}
            duration={message.duration}
            onViewDocument={onViewDocument}
            messageId={message.id}
          />
        )}

        {/* Location Card Renderer */}
        {!message.deleted && message.message_type === 'location' && message.location_data && (
          <div 
            onClick={(e) => {
              e.stopPropagation()
              onOpenLocationOnMap?.(message.location_data, message.location_type || 'current')
            }}
            className="flex items-center gap-3 p-3 bg-muted/40 hover:bg-muted/70 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70 border border-border/60 rounded-xl cursor-pointer transition-colors max-w-[260px] my-1"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-xs font-bold block text-foreground truncate">
                {message.location_type === 'live' ? 'Live Location' : 'Current Location'}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate" title={message.location_data.address}>
                {message.location_data.address || `${message.location_data.latitude.toFixed(5)}, ${message.location_data.longitude.toFixed(5)}`}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5 animate-pulse">
                Click to view map
              </span>
            </div>
          </div>
        )}

        {/* Text Message Content */}
        {message.deleted ? (
          <p className="break-words">This message was deleted.</p>
        ) : (
          (message.message_type === 'text' || (message.message && message.message_type !== 'location')) && (
            <p className="break-words whitespace-pre-wrap mt-1">{message.message}</p>
          )
        )}

        {/* Timestamp and Check marks */}
        <div className="flex items-center gap-1 justify-end text-[9px] mt-1 opacity-70 select-none text-muted-foreground leading-none">
          <span>{messageTime}</span>
          {isMe && !message.deleted && (
            <span className="flex items-center">
              {message.message_status === 'pending' && (
                <span title="Pending"><Clock className="h-3 w-3 text-muted-foreground/60 animate-pulse" /></span>
              )}
              {message.message_status === 'sent' && (
                <span title="Sent"><Check className="h-3.5 w-3.5 text-muted-foreground/70" /></span>
              )}
              {message.message_status === 'delivered' && (
                <span title="Delivered"><CheckCheck className="h-3.5 w-3.5 text-muted-foreground/70" /></span>
              )}
              {message.message_status === 'read' && (
                <span title="Read"><CheckCheck className="h-3.5 w-3.5 text-sky-500" /></span>
              )}
              {!message.message_status && (
                <span title="Sent"><CheckCheck className="h-3.5 w-3.5 text-muted-foreground/70" /></span>
              )}
            </span>
          )}
        </div>

        {/* Reaction Active Badges */}
        {!message.deleted && (
          <MessageActions
            thumb={message.thumb}
            favorite={message.favorite}
            flag={message.flag}
            star={message.star}
            pin={message.pin}
            archive={message.archive}
          />
        )}
      </div>

      {/* Floating Toolbar (CSS hover on desktop, click/long press state on mobile) */}
      {!message.deleted && (
        <MessageToolbar
          message={message}
          onCopy={handleCopy}
          onReact={handleReact}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          onReply={handleReply}
          onForward={handleForward}
          onShare={handleShare}
          isSender={isMe}
          className={cn(
            'absolute z-30 transition-all duration-200 shadow-md scale-95 pointer-events-none opacity-0',
            // Desktop hover behavior
            'group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto',
            // Mobile active behavior
            showMobileToolbar ? 'opacity-100 scale-100 pointer-events-auto' : '',
            // Positioning based on sender
            isMe ? 'right-2 -bottom-4' : 'left-2 -bottom-4'
          )}
        />
      )}
    </div>
  )
}
export default MessageBubble
