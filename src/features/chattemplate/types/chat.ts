export interface Profile {
  id: string
  name: string
  email: string
  avatar_url?: string
  username?: string
  status?: 'online' | 'offline'
  online?: boolean
  offline?: boolean
  last_seen?: string
}

export type { Conversation, ConversationMember } from './conversation'
export type { Message } from './message'

export interface Contact {
  id: string
  ownerId: string
  contactUserId: string
  userUuid?: string
  fullName: string
  email: string
  mobile?: string
  company?: string
  status?: 'Active' | 'Inactive'
  avatarUrl?: string
  nickname?: string
  createdAt?: string
}

