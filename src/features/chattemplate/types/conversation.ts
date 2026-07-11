import { Profile } from './chat'
import { Message } from './message'

export interface Conversation {
  id: string
  type: 'direct' | 'group' | 'channel_group' | 'message_group'
  name?: string
  image?: string
  created_by?: string
  created_at: string
  // UI extended fields
  lastMessage?: Message
  unreadCount?: number
  members?: Profile[]
}

export interface ConversationMember {
  id: string
  conversation_id: string
  user_id: string
  role: string
  unread_count: number
  joined_at: string
  profile?: Profile
}
