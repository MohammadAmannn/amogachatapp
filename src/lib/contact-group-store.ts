import { createClient } from '@supabase/supabase-js'

export interface Contact {
  id: string
  fullName: string
  company?: string
  email: string
  mobile: string
  status: 'Active' | 'Inactive'
  createdAt?: string
  updatedAt?: string
}

export interface Group {
  id: string
  groupName: string
  description?: string
  groupImage?: string
  users: string[] // List of user names/emails/ids
  status: 'Active' | 'Inactive'
  email?: string
  userUuid?: string
  createdAt?: string
  updatedAt?: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Contacts API methods (Supabase direct)
export async function getContacts(): Promise<Contact[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    if (data) {
      return data.map((d: any) => ({
        id: d.id,
        fullName: d.full_name,
        company: d.company || '',
        email: d.email,
        mobile: d.mobile,
        status: d.status as 'Active' | 'Inactive',
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }))
    }
  } catch (e) {
    console.error('Supabase getContacts error:', e)
  }
  return []
}

export async function saveContact(contact: Omit<Contact, 'id'> & { id?: string }): Promise<Contact | null> {
  if (!supabase) return null
  const id = contact.id || crypto.randomUUID()
  const now = new Date().toISOString()
  
  const record = {
    id,
    full_name: contact.fullName,
    company: contact.company || null,
    email: contact.email,
    mobile: contact.mobile,
    status: contact.status,
  }

  try {
    const { error } = await supabase
      .from('contacts')
      .upsert({
        ...record,
        updated_at: now
      })
    
    if (error) throw error
    return {
      id,
      ...contact,
      createdAt: now,
      updatedAt: now,
    }
  } catch (e) {
    console.error('Supabase saveContact error:', e)
    return null
  }
}

export async function deleteContact(id: string): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  } catch (e) {
    console.error('Supabase deleteContact error:', e)
    return false
  }
}

// Groups API methods (Supabase direct on chat_group table)
export async function getGroups(): Promise<Group[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('chat_group')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    if (data) {
      return data.map((d: any) => ({
        id: d.id,
        groupName: d.name,
        description: d.description || '',
        groupImage: d.image_url || '',
        users: Array.isArray(d.users) ? d.users : [],
        status: d.status as 'Active' | 'Inactive',
        email: d.email || undefined,
        userUuid: d.user_uuid || undefined,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }))
    }
  } catch (e) {
    console.error('Supabase getGroups error:', e)
  }
  return []
}

export async function saveGroup(group: Omit<Group, 'id'> & { id?: string }): Promise<Group | null> {
  if (!supabase) return null
  const id = group.id || crypto.randomUUID()
  const now = new Date().toISOString()
  
  // Step 1 - Create or Get User in users table
  let userUuid: string | null = null
  const groupEmail = group.email?.trim().toLowerCase()
  if (groupEmail) {
    try {
      // 1. Search the users table for an existing user with that email
      const { data: existing, error: searchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', groupEmail)
        .maybeSingle()

      if (searchError) throw searchError

      if (existing) {
        userUuid = existing.id
      } else {
        // 2. Try direct insert into users table (in case RLS permits it)
        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .insert({
            email: groupEmail,
            name: group.groupName,
            avatar: group.groupImage || null,
            status: 'Active'
          })
          .select('id')
          .maybeSingle()

        if (!insertError && inserted) {
          userUuid = inserted.id
        } else {
          console.warn('[contact-group-store] Direct user insert failed, falling back to RPC:', insertError)
          // Fallback to get_or_create_pending_user RPC
          const { data: rpcUser, error: rpcError } = await supabase
            .rpc('get_or_create_pending_user', {
              p_email: groupEmail,
              p_name: group.groupName
            })

          if (rpcError) throw rpcError
          const parsedUser = typeof rpcUser === 'string' ? JSON.parse(rpcUser) : rpcUser
          if (parsedUser && parsedUser.id) {
            userUuid = parsedUser.id
          }
        }
      }
    } catch (err) {
      console.error('[contact-group-store] Failed to get or create group user:', err)
    }
  }

  const record = {
    id,
    name: group.groupName,
    description: group.description || null,
    image_url: group.groupImage || null,
    users: group.users, // Supabase client handles array to JSONB serialization
    status: group.status,
    user_uuid: userUuid, // Populate chat_groups.user_uuid = userUuid
  }

  try {
    const { error } = await supabase
      .from('chat_group')
      .upsert({
        ...record,
        updated_at: now
      })
    
    if (error) throw error
    return {
      id,
      ...group,
      userUuid: userUuid || undefined,
      createdAt: now,
      updatedAt: now,
    }
  } catch (e) {
    console.error('Supabase saveGroup error:', e)
    return null
  }
}

export async function deleteGroup(id: string): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('chat_group')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  } catch (e) {
    console.error('Supabase deleteGroup error:', e)
    return false
  }
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  recipientId: string
  isGroup: boolean
  timestamp: string
  messageType?: 'text' | 'image' | 'video' | 'document' | 'audio'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  duration?: number
}

export async function getChatMessages(recipientId: string): Promise<ChatMessage[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('recipient_id', recipientId)
      .order('timestamp', { ascending: true })
    
    if (error) throw error
    if (data) {
      return data.map((d: any) => ({
        id: d.id,
        senderId: d.sender_id,
        senderName: d.sender_name,
        message: d.message,
        recipientId: d.recipient_id,
        isGroup: d.is_group,
        timestamp: d.timestamp,
        messageType: d.message_type || 'text',
        fileUrl: d.file_url || undefined,
        fileName: d.file_name || undefined,
        fileSize: d.file_size ? Number(d.file_size) : undefined,
        mimeType: d.mime_type || undefined,
        duration: d.duration ? Number(d.duration) : undefined,
      }))
    }
  } catch (e) {
    console.error('Supabase getChatMessages error:', e)
  }
  return []
}

export async function saveChatMessage(msg: {
  message: string
  recipientId: string
  isGroup: boolean
  senderId?: string
  senderName?: string
  messageType?: 'text' | 'image' | 'video' | 'document' | 'audio'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  duration?: number
}): Promise<ChatMessage | null> {
  if (!supabase) return null
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  
  const record = {
    id,
    sender_id: msg.senderId || 'you',
    sender_name: msg.senderName || 'You',
    message: msg.message,
    recipient_id: msg.recipientId,
    is_group: msg.isGroup,
    timestamp: now,
    message_type: msg.messageType || 'text',
    file_url: msg.fileUrl || null,
    file_name: msg.fileName || null,
    file_size: msg.fileSize || null,
    mime_type: msg.mimeType || null,
    duration: msg.duration || null,
  }

  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert(record)
    
    if (error) throw error
    return {
      id,
      senderId: record.sender_id,
      senderName: record.sender_name,
      message: record.message,
      recipientId: record.recipient_id,
      isGroup: record.is_group,
      timestamp: record.timestamp,
      messageType: record.message_type as any,
      fileUrl: record.file_url || undefined,
      fileName: record.file_name || undefined,
      fileSize: record.file_size ? Number(record.file_size) : undefined,
      mimeType: record.mime_type || undefined,
      duration: record.duration ? Number(record.duration) : undefined,
    }
  } catch (e) {
    console.error('Supabase saveChatMessage error:', e)
    return null
  }
}

