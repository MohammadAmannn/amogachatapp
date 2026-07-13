import { Profile } from './chat.types'

export interface Message {
  id: string
  conversation_id: string
  owner_user_id: string
  sender_user_id: string | null
  message: string | null
  message_type: 'text' | 'image' | 'video' | 'document' | 'audio'
  direction: 'Sent' | 'Received'
  sent: boolean
  received: boolean
  created_at: string
  
  // Attachments
  file_url?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  duration?: number
  thumbnail?: string

  // Actions
  thumb: boolean
  favorite: boolean
  flag: boolean
  star: boolean
  pin: boolean
  archive: boolean
  deleted: boolean
  action_this: boolean
  reply: boolean
  forward: boolean

  // Delete metadata
  deleted_at?: string
  deleted_by?: string

  // Reply Metadata
  replyemoji?: string
  replyto_message_id?: string
  replyto_user_id?: string
  parent_message_id?: string

  // Forward Metadata
  forwardemoji?: string
  forwardto_message_id?: string
  forwardto_user_id?: string

  // Lineage Metadata
  sender_message_id?: string

  // Offline Sync & Status
  message_status?: 'pending' | 'sent' | 'delivered' | 'read'
  queued_at?: string
  delivered_at?: string
  read_at?: string
  client_message_id?: string
  retry_count?: number

  // UI extended fields
  sender?: Profile
  replyto_message?: Message
}
