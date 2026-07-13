import { 
  Copy, ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Heart, 
  Flag, Star, Pin, Archive, Trash2, Bell, CornerUpLeft, ArrowRight 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Message } from '../types/chat.types'

interface MessageToolbarProps {
  message: Message
  onCopy: () => void
  onReact: (action: 'thumb' | 'favorite' | 'flag' | 'star' | 'pin' | 'archive' | 'action_this', value: boolean) => void
  onDeleteForMe: () => void
  onDeleteForEveryone?: () => void
  onReply: () => void
  onForward: () => void
  onShare: () => void
  isSender: boolean
  className?: string
}

export function MessageToolbar({
  message,
  onCopy,
  onReact,
  onDeleteForMe,
  onDeleteForEveryone,
  onReply,
  onForward,
  onShare,
  isSender,
  className,
}: MessageToolbarProps) {
  return (
    <div 
      className={`flex items-center gap-1 bg-card dark:bg-zinc-900 border border-border/80 rounded-full px-2.5 py-1 shadow-md select-none ${className}`}
      onClick={(e) => e.stopPropagation()} // Prevent bubble clicks
    >
      {/* Thumb Up reaction toggle */}
      <Button
        size="icon"
        variant="ghost"
        className={`h-7 w-7 rounded-full text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 cursor-pointer ${
          message.thumb ? 'text-emerald-500 bg-emerald-500/10' : ''
        }`}
        onClick={() => onReact('thumb', !message.thumb)}
        title="Thumb Up"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>

      {/* Thumb Down (toggles thumb boolean false) */}
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
        onClick={() => onReact('thumb', false)}
        title="Thumb Down"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>

      {/* Copy Action */}
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={onCopy}
        title="Copy text"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>

      {/* Share Action */}
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={onShare}
        title="Share"
      >
        <Share2 className="h-3.5 w-3.5" />
      </Button>

      {/* Three Dot Menu dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            title="More actions"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl border-border/80 shadow-lg">
          <DropdownMenuItem onClick={onReply} className="gap-2 cursor-pointer">
            <CornerUpLeft className="h-4 w-4 text-blue-500" />
            <span>Reply</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onForward} className="gap-2 cursor-pointer">
            <ArrowRight className="h-4 w-4 text-sky-500" />
            <span>Forward</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onReact('pin', !message.pin)} className="gap-2 cursor-pointer">
            <Pin className="h-4 w-4 text-purple-500" />
            <span>{message.pin ? 'Unpin Message' : 'Pin Message'}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onReact('star', !message.star)} className="gap-2 cursor-pointer">
            <Star className={`h-4 w-4 text-amber-500 ${message.star ? 'fill-amber-500' : ''}`} />
            <span>{message.star ? 'Unstar' : 'Star'}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onReact('favorite', !message.favorite)} className="gap-2 cursor-pointer">
            <Heart className={`h-4 w-4 text-rose-500 ${message.favorite ? 'fill-rose-500' : ''}`} />
            <span>{message.favorite ? 'Unfavorite' : 'Favorite'}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onReact('flag', !message.flag)} className="gap-2 cursor-pointer">
            <Flag className={`h-4 w-4 text-red-500 ${message.flag ? 'fill-red-500' : ''}`} />
            <span>{message.flag ? 'Unflag' : 'Flag'}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onReact('archive', !message.archive)} className="gap-2 cursor-pointer">
            <Archive className="h-4 w-4 text-indigo-500" />
            <span>{message.archive ? 'Unarchive' : 'Archive'}</span>
          </DropdownMenuItem>

          {/* Nested Submenu: Action This (Alarm) */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
              <Bell className="h-4 w-4 text-orange-500" />
              <span>Action This</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="rounded-xl border-border/80">
              <DropdownMenuItem onClick={() => onReact('action_this', !message.action_this)} className="cursor-pointer">
                <Bell className="h-4 w-4 text-orange-500 mr-2" />
                <span>{message.action_this ? 'Cancel Alarm' : 'Set Alarm'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <span>Add Custom Action...</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Delete choice sub-menu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 text-rose-500 hover:text-rose-600 focus:text-rose-600 cursor-pointer">
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="rounded-xl border-border/80">
              <DropdownMenuItem onClick={onDeleteForMe} className="text-rose-500 cursor-pointer">
                Delete for Me
              </DropdownMenuItem>
              {isSender && onDeleteForEveryone && (
                <DropdownMenuItem onClick={onDeleteForEveryone} className="text-rose-600 font-bold cursor-pointer">
                  Delete for Everyone
                </DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
export default MessageToolbar
