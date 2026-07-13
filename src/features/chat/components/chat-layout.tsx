import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { AppHeader } from '@/components/layout/app-header'
import { ChatSidebar } from './chat-sidebar'
import { ChatWindow } from './chat-window'
import { ChatWelcome } from './chat-welcome'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ComingSoon } from '@/components/coming-soon'

import { ContactList } from '@/features/contacts/components/contact-list'
import { NewContactForm } from '@/features/contacts/components/new-contact-form'
import { GroupList } from '@/features/groups/components/group-list'
import { NewGroupForm } from '@/features/groups/components/new-group-form'
import { Group } from '@/features/groups'
import { Contact } from '@/features/contacts/types/contact.types'
import { useAuthStore } from '@/features/auth'

// Clean Architecture Realtime Chat Imports
import { useConversation } from '../hooks/use-conversation'
import { useMessages } from '../hooks/use-messages'
import { useRealtime } from '../hooks/use-realtime'
import { useSendMessage } from '../hooks/use-send-message'
import { getUserContacts } from '@/features/contacts/repositories/contact-repository'
import { ensureProfileExists, getProfileByEmail, getOrCreateProfileForContact } from '../repositories/profile-repository'
import { createGroupConversation, clearConversationUnreadCount, getUserConversations } from '../repositories/conversation-repository'
import { Message } from '../types/chat.types'

// Realtime Presence and Offline Messaging Imports
import { useOnlineStatus } from '../hooks/use-online-status'
import { usePresence } from '../hooks/use-presence'
import { useMessageQueue } from '../hooks/use-message-queue'
import { markMessagesAsRead, markMessagesAsDelivered } from '../repositories/delivery-repository'
import { isBrowserOnline } from '../utils/network'
import { toast } from 'sonner'

export function ChatLayout() {
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('sidebar')
  const [activeMainTab, setActiveMainTab] = useState('chat')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)

  // Load sidebar toggle state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat_sidebar_collapsed')
    if (saved === 'true') {
      setIsLeftSidebarCollapsed(true)
    }
  }, [])

  const handleToggleLeftSidebar = () => {
    setIsLeftSidebarCollapsed(prev => {
      const nextVal = !prev
      localStorage.setItem('chat_sidebar_collapsed', String(nextVal))
      return nextVal
    })
  }

  // Auth User
  const currentUser = useAuthStore((state) => state.auth.user)

  // Network & Realtime Presence
  const isOnline = useOnlineStatus()
  const { onlineUserIds } = usePresence(currentUser?.accountNo)

  const {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    isLoading: isLoadingConvo,
    loadConversations,
    startDirectConversation,
  } = useConversation()

  const {
    messages,
    setMessages,
    loadMessages,
  } = useMessages()

  const handleMessageSynced = (clientMsgId: string, serverMsg: Message) => {
    if (activeConversation && activeConversation.id === serverMsg.conversation_id) {
      setMessages(prev => prev.map(m => m.id === clientMsgId ? serverMsg : m))
    }
    
    setConversations(prev => prev.map(c => {
      if (c.id === serverMsg.conversation_id) {
        if (c.lastMessage && (c.lastMessage.id === clientMsgId || c.lastMessage.client_message_id === clientMsgId)) {
          return { ...c, lastMessage: serverMsg }
        }
      }
      return c
    }))
  }

  const { queue, enqueue } = useMessageQueue(handleMessageSynced)

  const { sendMessage } = useSendMessage()

  // Ensure current user profile is in the public profiles table
  useEffect(() => {
    if (currentUser) {
      ensureProfileExists(currentUser)
    }
  }, [currentUser])

  // Load conversations list on mount or when user changes
  useEffect(() => {
    if (currentUser) {
      loadConversations(currentUser.accountNo)
    }
  }, [currentUser, loadConversations])

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation && currentUser) {
      loadMessages(activeConversation.id, currentUser.accountNo)
    } else {
      setMessages([])
    }
  }, [activeConversation?.id, currentUser, loadMessages, setMessages])

  // Clear unread counts and mark read in database and locally when opening/switching to a conversation
  useEffect(() => {
    if (activeConversation && currentUser) {
      clearConversationUnreadCount(activeConversation.id, currentUser.accountNo)
      markMessagesAsRead(activeConversation.id, currentUser.accountNo)
      setConversations(prev =>
        prev.map(c => c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c)
      )
    }
  }, [activeConversation?.id, currentUser, setConversations])

  // Mark received messages as delivered on startup
  useEffect(() => {
    if (currentUser && conversations.length > 0) {
      conversations.forEach(c => {
        markMessagesAsDelivered(c.id, currentUser.accountNo)
      })
    }
  }, [currentUser, conversations.length])

  // Subscribe to realtime messages globally for the logged-in user
  useRealtime(
    currentUser?.accountNo,
    // 1. INSERT handler
    (newMsg: Message) => {
      if (activeConversation && newMsg.conversation_id === activeConversation.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id || (m.client_message_id && m.client_message_id === newMsg.client_message_id))) return prev
          let resolvedMsg = newMsg
          if (newMsg.replyto_message_id && !newMsg.replyto_message) {
            const parent = prev.find(m => m.id === newMsg.replyto_message_id || m.sender_message_id === newMsg.replyto_message_id)
            if (parent) {
              resolvedMsg = { ...newMsg, replyto_message: parent }
            }
          }
          return [...prev, resolvedMsg]
        })
        if (currentUser) {
          clearConversationUnreadCount(activeConversation.id, currentUser.accountNo)
          markMessagesAsRead(activeConversation.id, currentUser.accountNo)
        }
      } else {
        if (currentUser) {
          markMessagesAsDelivered(newMsg.conversation_id, currentUser.accountNo)
        }
      }

      setConversations(prev => {
        const index = prev.findIndex(c => c.id === newMsg.conversation_id)
        if (index !== -1) {
          const convo = prev[index]
          const updatedConvo = {
            ...convo,
            lastMessage: newMsg,
            unreadCount: (activeConversation && newMsg.conversation_id === activeConversation.id)
              ? 0
              : (newMsg.sender_user_id === currentUser?.accountNo ? convo.unreadCount : (convo.unreadCount || 0) + 1)
          }
          const filtered = prev.filter(c => c.id !== newMsg.conversation_id)
          return [updatedConvo, ...filtered]
        } else {
          if (currentUser) {
            loadConversations(currentUser.accountNo)
          }
          return prev
        }
      })
    },
    // 2. UPDATE handler (e.g. reaction toggles, soft deletes, replies, reads)
    (updatedMsg: Message) => {
      const isDeletedForMe = updatedMsg.deleted && !updatedMsg.deleted_by

      if (activeConversation && updatedMsg.conversation_id === activeConversation.id) {
        setMessages(prev => {
          if (isDeletedForMe) {
            return prev.filter(m => m.id !== updatedMsg.id)
          }
          return prev.map(m => m.id === updatedMsg.id || (m.client_message_id && m.client_message_id === updatedMsg.client_message_id) ? updatedMsg : m)
        })
      }

      setConversations(prev => {
        return prev.map(c => {
          if (c.id === updatedMsg.conversation_id) {
            if (c.lastMessage?.id === updatedMsg.id || (c.lastMessage?.client_message_id && c.lastMessage.client_message_id === updatedMsg.client_message_id)) {
              return {
                ...c,
                lastMessage: isDeletedForMe ? undefined : {
                  ...c.lastMessage,
                  message: updatedMsg.message || '',
                  deleted: updatedMsg.deleted,
                  message_status: updatedMsg.message_status,
                } as Message
              }
            }
          }
          return c
        })
      })
    },
    // 3. DELETE handler
    (deletedMsgId: string) => {
      setMessages(prev => prev.filter(m => m.id !== deletedMsgId))
    }
  )

  const fetchContactsAndGroups = async () => {
    if (!currentUser) return
    setIsLoadingList(true)
    try {
      const contactsData = await getUserContacts(currentUser.accountNo)
      setContacts(contactsData)
      
      const groupsRes = await fetch(`/api/groups?email=${encodeURIComponent(currentUser.email || '')}`)
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json()
        setGroups(groupsData)
      }
    } catch (e) {
      console.error('Failed to fetch contacts or groups:', e)
    } finally {
      setIsLoadingList(false)
    }
  }

  // Fetch initial contacts & groups lists on mount
  useEffect(() => {
    if (currentUser) {
      fetchContactsAndGroups()
    }
  }, [currentUser])

  const handleSelectConversation = (convo: any) => {
    setActiveConversation(convo)
    setMobileView('chat')
  }

  const handleSelectContact = async (contact: Contact) => {
    if (!currentUser) return
    try {
      // Load or create direct conversation using the verified contactUserId
      await startDirectConversation(currentUser.accountNo, contact.contactUserId)
      setMobileView('chat')
      setActiveMainTab('chat')
    } catch (e) {
      console.error(e)
    }
  }

  const handleSelectGroup = async (group: Group) => {
    if (!currentUser) return
    try {
      // Find if we already have this group conversation loaded in memory
      let found = conversations.find(
        (c) => c.type === 'group' && c.name?.toLowerCase() === group.groupName.toLowerCase()
      )

      // Fallback: reload conversations from DB to see if it was created elsewhere
      if (!found) {
        const dbConvos = await getUserConversations(currentUser.accountNo)
        setConversations(dbConvos)
        found = dbConvos.find(
          (c) => c.type === 'group' && c.name?.toLowerCase() === group.groupName.toLowerCase()
        )
      }

      if (found) {
        setActiveConversation(found)
        setMobileView('chat')
        setActiveMainTab('chat')
      } else {
        // Create new group conversation dynamically using members
        const memberIds: string[] = []
        // Resolve or create user profiles
        for (const email of (group.users || [])) {
          const profile = await getOrCreateProfileForContact(email, email.split('@')[0])
          if (profile) {
            memberIds.push(profile.id)
          }
        }

        const newConvo = await createGroupConversation(
          group.groupName,
          group.groupImage || null,
          memberIds,
          currentUser.accountNo
        )

        if (newConvo) {
          // Fetch updated conversations directly from DB to get populated members
          const dbConvos = await getUserConversations(currentUser.accountNo)
          setConversations(dbConvos)
          const target = dbConvos.find((c: any) => c.id === newConvo.id)
          if (target) {
            setActiveConversation(target)
          } else {
            // Reconstruct members from profiles search
            const resolvedMembers = []
            for (const email of (group.users || [])) {
              const p = await getProfileByEmail(email)
              if (p) {
                resolvedMembers.push(p)
              }
            }
            setActiveConversation({
              id: newConvo.id,
              type: 'group',
              name: newConvo.name,
              image: newConvo.image,
              created_at: newConvo.created_at,
              members: resolvedMembers,
            })
          }
          setMobileView('chat')
          setActiveMainTab('chat')
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSendMessage = async (
    text: string,
    attachment?: {
      messageType: 'image' | 'video' | 'document' | 'audio'
      fileUrl: string
      fileName: string
      fileSize: number
      mimeType: string
      duration?: number
    },
    replyMetadata?: {
      replyemoji?: string
      replyto_message_id?: string
      replyto_user_id?: string
      parent_message_id?: string
    },
    attachmentFile?: File | Blob
  ) => {
    if (!activeConversation || !currentUser) return

    const optimisticId = crypto.randomUUID()
    const now = new Date().toISOString()

    // 1. Construct optimistic message
    let parentMsgCopy = undefined
    if (replyMetadata?.replyto_message_id) {
      parentMsgCopy = messages.find(
        m => m.id === replyMetadata.replyto_message_id || m.sender_message_id === replyMetadata.replyto_message_id
      )
    }

    const localFileUrl = attachmentFile ? URL.createObjectURL(attachmentFile) : attachment?.fileUrl

    const optimisticMsg: Message = {
      id: optimisticId,
      conversation_id: activeConversation.id,
      owner_user_id: currentUser.accountNo,
      sender_user_id: currentUser.accountNo,
      message: text || null,
      message_type: attachment?.messageType || 'text',
      direction: 'Sent',
      sent: false,
      received: false,
      created_at: now,
      message_status: 'pending',
      client_message_id: optimisticId,
      
      file_url: localFileUrl,
      file_name: attachment?.fileName,
      file_size: attachment?.fileSize,
      mime_type: attachment?.mimeType,
      duration: attachment?.duration,

      thumb: false,
      favorite: false,
      flag: false,
      star: false,
      pin: false,
      archive: false,
      deleted: false,
      action_this: false,
      reply: !!replyMetadata,
      forward: false,

      replyto_message_id: replyMetadata?.replyto_message_id,
      replyto_user_id: replyMetadata?.replyto_user_id,
      parent_message_id: replyMetadata?.parent_message_id,
      replyto_message: parentMsgCopy,

      sender: {
        id: currentUser.accountNo,
        name: currentUser.name || currentUser.email || 'You',
        email: currentUser.email || '',
        avatar_url: currentUser.picture || undefined,
      }
    }

    // Append optimistic message
    setMessages((prev) => [...prev, optimisticMsg])

    // Update sidebar last message preview immediately
    setConversations(prev => {
      const index = prev.findIndex(c => c.id === optimisticMsg.conversation_id)
      if (index !== -1) {
        const convo = prev[index]
        const updatedConvo = {
          ...convo,
          lastMessage: optimisticMsg,
        }
        const filtered = prev.filter(c => c.id !== optimisticMsg.conversation_id)
        return [updatedConvo, ...filtered]
      }
      return prev
    })

    // If offline, save in IndexedDB queue
    if (!isBrowserOnline()) {
      await enqueue({
        conversationId: activeConversation.id,
        senderId: currentUser.accountNo,
        message: text,
        messageType: attachment?.messageType || 'text',
        attachmentFile,
        attachmentMetadata: attachment ? {
          fileName: attachment.fileName,
          fileSize: attachment.fileSize,
          mimeType: attachment.mimeType,
          duration: attachment.duration,
        } : undefined,
        replyMetadata,
      })
      toast.info('Waiting for connection... message queued.')
      return
    }

    try {
      const savedMsg = await sendMessage(
        activeConversation.id,
        currentUser.accountNo,
        text,
        attachment,
        replyMetadata
      )

      if (savedMsg) {
        // Resolve parent reply-to message
        let resolvedMsg = savedMsg
        if (savedMsg.replyto_message_id && !savedMsg.replyto_message) {
          const parent = messages.find(
            m => m.id === savedMsg.replyto_message_id || m.sender_message_id === savedMsg.replyto_message_id
          )
          if (parent) {
            resolvedMsg = { ...savedMsg, replyto_message: parent }
          }
        }

        // Replace optimistic message with actual saved message
        setMessages((prev) => prev.map((m) => (m.id === optimisticId ? resolvedMsg : m)))
        
        // Update sidebar last message preview
        setConversations(prev => {
          const index = prev.findIndex(c => c.id === resolvedMsg.conversation_id)
          if (index !== -1) {
            const convo = prev[index]
            const updatedConvo = {
              ...convo,
              lastMessage: resolvedMsg,
              unreadCount: 0
            }
            const filtered = prev.filter(c => c.id !== resolvedMsg.conversation_id)
            return [updatedConvo, ...filtered]
          }
          return prev
        })
      }
    } catch (e) {
      console.error('Failed to send message:', e)
      // Save to queue on network failure
      await enqueue({
        conversationId: activeConversation.id,
        senderId: currentUser.accountNo,
        message: text,
        messageType: attachment?.messageType || 'text',
        attachmentFile,
        attachmentMetadata: attachment ? {
          fileName: attachment.fileName,
          fileSize: attachment.fileSize,
          mimeType: attachment.mimeType,
          duration: attachment.duration,
        } : undefined,
        replyMetadata,
      })
      toast.error('Network error. Queued message.')
    }
  }

  return (
    <>
      <AppHeader title='Chat Template' />

      <Main fixed className='pt-3 pb-0 sm:pb-4 px-0 sm:px-4'>
        <Tabs
          value={activeMainTab}
          onValueChange={setActiveMainTab}
          className='flex flex-1 flex-col overflow-hidden space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2 shrink-0 border-b border-border px-4 sm:px-0'>
            <TabsList className='h-auto gap-6 border-0 bg-transparent p-0 shadow-none rounded-none'>
              <TabsTrigger
                value='chat'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-sm'
              >
                Chat
              </TabsTrigger>
              <TabsTrigger
                value='contact'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-sm'
              >
                Contact
              </TabsTrigger>
              <TabsTrigger
                value='new-contact'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-sm'
              >
                New Contact
              </TabsTrigger>
              <TabsTrigger
                value='new-group'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-sm'
              >
                New Group
              </TabsTrigger>
              <TabsTrigger
                value='group'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-sm'
              >
                Group
              </TabsTrigger>
              <TabsTrigger
                value='history'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-sm'
              >
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value='chat'
            className='flex-1 overflow-hidden flex flex-row mt-0 gap-5 focus-visible:outline-none'
          >
            {/* Left Column (Sidebar) */}
            <div
              className={cn(
                'h-full flex-col shrink-0 sm:flex transition-all duration-300 ease-in-out overflow-hidden',
                mobileView === 'sidebar' ? 'flex w-full' : 'hidden',
                isLeftSidebarCollapsed ? 'lg:w-20' : 'sm:w-80 lg:w-96'
              )}
            >
              <ChatSidebar
                conversations={conversations}
                selectedConversation={activeConversation}
                onSelectConversation={handleSelectConversation}
                isLoading={isLoadingConvo}
                onNavigateToTab={(tab) => setActiveMainTab(tab)}
                isCollapsed={isLeftSidebarCollapsed}
                onToggleCollapse={handleToggleLeftSidebar}
                onlineUserIds={onlineUserIds}
                currentUserId={currentUser?.accountNo}
              />
            </div>

            {/* Right Column (Chat Panel & Sliding User Profile Sidebar) */}
            <div
              className={cn(
                'flex-grow flex flex-row transition-all duration-300 overflow-hidden border border-border/80 dark:border-zinc-800 bg-card rounded-2xl shadow-xs',
                mobileView === 'chat'
                  ? 'flex fixed inset-0 z-50 bg-background w-full h-full animate-fade-in sm:relative sm:inset-auto sm:z-0 sm:h-full'
                  : 'hidden sm:flex sm:relative sm:h-full'
              )}
            >
              <div className="flex-grow flex flex-col h-full overflow-hidden w-full max-w-full min-w-0">
                {activeConversation ? (
                  <ChatWindow
                    selectedTarget={activeConversation}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onBackClick={() => setMobileView('sidebar')}
                    isLeftSidebarCollapsed={isLeftSidebarCollapsed}
                    onToggleLeftSidebar={handleToggleLeftSidebar}
                    onlineUserIds={onlineUserIds}
                  />
                ) : (
                  <ChatWelcome />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value='contact'
            className='flex-1 flex flex-col focus-visible:outline-none bg-transparent min-h-[400px] mt-0 overflow-y-auto'
          >
            <ContactList
              contacts={contacts}
              onRefresh={fetchContactsAndGroups}
              onSelectContact={handleSelectContact}
              onAddContactClick={() => setActiveMainTab('new-contact')}
            />
          </TabsContent>

          <TabsContent
            value='new-contact'
            className='flex-1 flex flex-col focus-visible:outline-none bg-transparent min-h-[400px] mt-0 overflow-y-auto'
          >
            <NewContactForm onSuccess={() => {
              fetchContactsAndGroups()
              setActiveMainTab('contact')
            }} />
          </TabsContent>

          <TabsContent
            value='new-group'
            className='flex-1 flex flex-col focus-visible:outline-none bg-transparent min-h-[400px] mt-0 overflow-y-auto'
          >
            <NewGroupForm contacts={contacts} onSuccess={() => {
              fetchContactsAndGroups()
              setActiveMainTab('group')
            }} />
          </TabsContent>

          <TabsContent
            value='group'
            className='flex-1 flex flex-col focus-visible:outline-none bg-transparent min-h-[400px] mt-0 overflow-y-auto'
          >
            <GroupList
              groups={groups}
              contacts={contacts}
              onRefresh={fetchContactsAndGroups}
              onSelectGroup={handleSelectGroup}
              onAddGroupClick={() => setActiveMainTab('new-group')}
            />
          </TabsContent>

          <TabsContent
            value='history'
            className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
          >
            <ComingSoon />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
export default ChatLayout
