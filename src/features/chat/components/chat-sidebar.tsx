import { useState } from 'react'
import { Search, Loader2, MessageSquare, PanelLeft, Check, CheckCheck, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getDisplayNameInitials } from '@/lib/utils'
import { Conversation } from '../types/chat.types'

import { Button } from '@/components/ui/button'

interface ChatSidebarProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onSelectConversation: (convo: Conversation) => void
  isLoading?: boolean
  onNavigateToTab?: (tab: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  onlineUserIds?: Set<string>
  currentUserId?: string
}

export function ChatSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoading = false,
  onNavigateToTab,
  isCollapsed,
  onToggleCollapse,
  onlineUserIds,
  currentUserId,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter conversations based on name query
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase()
    return c.name?.toLowerCase().includes(q)
  })

  // Helper to resolve preview text for different media types
  const getLastMessageText = (convo: Conversation) => {
    const msg = convo.lastMessage
    if (!msg) return 'No messages yet'
    if (msg.message_type === 'image') return '📷 Image'
    if (msg.message_type === 'video') return '🎥 Video'
    if (msg.message_type === 'document') return '📁 Document'
    if (msg.message_type === 'audio') return '🎤 Voice note'
    return msg.message || ''
  }

  // Format message time as short HH:MM string
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className='flex h-full w-full flex-col bg-card border-0 sm:border border-border rounded-none sm:rounded-xl shadow-xs overflow-hidden shrink-0'>
      {/* Search & Collapse Toggle Section */}
      <div className='p-4 border-b border-border bg-muted/10 shrink-0 flex items-center justify-between gap-2 h-[73px]'>
        <div className={cn(
          'relative flex-grow flex-1 min-w-0 transition-all duration-300 animate-in fade-in duration-200',
          isCollapsed ? 'block lg:hidden' : 'block'
        )}>
          <Search className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70' />
          <Input
            placeholder='Search chats...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9 rounded-xl border-border/80 bg-background/50 focus-visible:ring-primary/50 text-xs h-10 w-full'
          />
        </div>
        <Button
          size='icon'
          variant='ghost'
          onClick={onToggleCollapse}
          className={cn(
            'hidden lg:flex h-10 w-10 shrink-0 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer',
            isCollapsed ? 'mx-auto' : ''
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft className={cn('h-5 w-5 transition-transform duration-200', isCollapsed ? 'rotate-180' : '')} />
        </Button>
      </div>

      {/* Main List Scroll Area */}
      <ScrollArea className='flex-1 p-2'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-14 text-muted-foreground/80 space-y-2'>
            <Loader2 className='h-5 w-5 animate-spin text-primary' />
            <p className='text-[10px] font-medium'>Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-muted-foreground/60 space-y-3 text-center px-4 animate-in fade-in duration-300'>
            <div className='h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm mx-auto'>
              <MessageSquare className='h-6 w-6 stroke-[1.5]' />
            </div>
            <div className='space-y-1'>
              <p className='text-xs font-bold text-foreground'>No conversations yet</p>
              <p className='text-[10px] max-w-[200px] text-muted-foreground/80 leading-normal mx-auto'>Start a chat by adding and selecting a contact.</p>
            </div>
            {onNavigateToTab && (
              <Button
                variant='outline'
                onClick={() => onNavigateToTab('contact')}
                className='h-8 rounded-lg text-[10px] font-bold border-border/80 px-4 mt-2 active:scale-95 transition-all cursor-pointer'
              >
                Go to Contacts
              </Button>
            )}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-muted-foreground/60 space-y-2 text-center px-4'>
            <MessageSquare className='h-8 w-8 stroke-[1.5]' />
            <p className='text-xs font-semibold'>No chats found</p>
            <p className='text-[10px]'>Try refining your search query.</p>
          </div>
        ) : (
          <div className='space-y-1'>
            {filteredConversations.map((convo) => {
              const isSelected = selectedConversation?.id === convo.id
              const lastMsgTime = convo.lastMessage?.created_at

              return (
                <button
                  key={convo.id}
                  type='button'
                  onClick={() => onSelectConversation(convo)}
                  className={cn(
                    'w-full flex items-center transition-all duration-200 cursor-pointer relative',
                    isCollapsed 
                      ? 'p-3 gap-3 text-left lg:p-2 lg:py-3.5 lg:justify-center lg:gap-0 lg:group/item' 
                      : 'gap-3 p-3 text-left',
                    isSelected
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 shadow-xs'
                      : 'hover:bg-muted/40 border border-transparent'
                  )}
                >
                  {isCollapsed && isSelected && (
                    <span className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-md animate-in slide-in-from-left duration-200 hidden lg:block" />
                  )}

                  <div className='relative shrink-0'>
                    <Avatar className={cn(
                      'h-10 w-10 border border-border/60 rounded-xl shrink-0 transition-transform duration-200',
                      isCollapsed ? 'lg:group-hover/item:scale-108 lg:group-hover/item:shadow-sm' : ''
                    )}>
                      <AvatarImage src={convo.image} alt={convo.name} />
                      <AvatarFallback className='rounded-xl bg-primary/10 text-primary font-bold text-xs'>
                        {getDisplayNameInitials(convo.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    {convo.type === 'direct' && (() => {
                      const recipient = convo.members?.find(m => m.id !== currentUserId)
                      const isOnline = recipient ? onlineUserIds?.has(recipient.id) : false
                      return (
                        <span className={cn(
                          'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-background',
                          isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                        )} />
                      )
                    })()}
                  </div>

                  <div className={cn(
                    'flex-grow min-w-0 flex flex-col gap-0.5 animate-in fade-in duration-200',
                    isCollapsed ? 'block lg:hidden' : 'block'
                  )}>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-bold text-foreground truncate block max-w-[70%]'>
                        {convo.name}
                      </span>
                      <span className={cn(
                        'text-[9px] tabular-nums shrink-0',
                        convo.unreadCount && convo.unreadCount > 0 ? 'text-emerald-500 font-extrabold' : 'text-muted-foreground/80 font-bold'
                      )}>
                        {formatTime(lastMsgTime)}
                      </span>
                    </div>

                    <div className='flex items-center justify-between gap-2 min-w-0'>
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        {convo.lastMessage && convo.lastMessage.sender_user_id === currentUserId && (
                          <span className="shrink-0 flex items-center">
                            {convo.lastMessage.message_status === 'pending' && (
                              <Clock className="h-3 w-3 text-muted-foreground/60 animate-pulse" />
                            )}
                            {convo.lastMessage.message_status === 'sent' && (
                              <Check className="h-3 w-3 text-muted-foreground/70" />
                            )}
                            {convo.lastMessage.message_status === 'delivered' && (
                              <CheckCheck className="h-3 w-3 text-muted-foreground/70" />
                            )}
                            {convo.lastMessage.message_status === 'read' && (
                              <CheckCheck className="h-3 w-3 text-sky-500" />
                            )}
                            {!convo.lastMessage.message_status && (
                              <CheckCheck className="h-3 w-3 text-muted-foreground/70" />
                            )}
                          </span>
                        )}
                        <p className={cn(
                          'text-[10px] truncate leading-normal flex-1',
                          convo.unreadCount && convo.unreadCount > 0 ? 'text-foreground font-extrabold' : 'text-muted-foreground font-semibold'
                        )}>
                          {getLastMessageText(convo)}
                        </p>
                      </div>
                      {convo.unreadCount && convo.unreadCount > 0 ? (
                        <span className='h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[8px] font-extrabold flex items-center justify-center shrink-0 animate-in zoom-in-50 duration-150 leading-none'>
                          {convo.unreadCount > 99 ? '99+' : convo.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
export default ChatSidebar
