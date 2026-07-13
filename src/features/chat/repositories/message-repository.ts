import { createClient } from '@/lib/supabase/client'
import { Message } from '../types/chat.types'

// Helper function to resolve auth UUID (auth.uid()) to permanent business UUID (users.id)
async function getBusinessUserId(supabase: any, authUserId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle()
    
    if (error) throw error
    return data?.id || authUserId
  } catch (err) {
    console.error('[message.service] Error resolving business UUID:', err)
    return authUserId
  }
}

export async function getConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
  const supabase = createClient()
  try {
    // Resolve auth UUID to business UUID
    const businessUserId = await getBusinessUserId(supabase, userId)

    // Note: Joins users table instead of profiles table due to updated constraint
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users!sender_user_id (
          id,
          name,
          email,
          avatar
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('owner_user_id', businessUserId)
      .or('deleted.eq.false,deleted_by.not.is.null') // Exclude "delete for me" messages, but show "delete for everyone" messages
      .order('created_at', { ascending: true })

    if (error) throw error
    if (!data) return []

    // Helper to fetch referenced reply message if exists
    const messages = data.map((d: any) => ({
      id: d.id,
      conversation_id: d.conversation_id,
      owner_user_id: d.owner_user_id,
      sender_user_id: d.sender_user_id,
      message: d.message,
      message_type: d.message_type,
      direction: d.direction,
      sent: d.sent,
      received: d.received,
      created_at: d.created_at,
      
      message_status: d.message_status || undefined,
      client_message_id: d.client_message_id || undefined,
      queued_at: d.queued_at || undefined,
      delivered_at: d.delivered_at || undefined,
      read_at: d.read_at || undefined,
      retry_count: d.retry_count ? Number(d.retry_count) : undefined,

      file_url: d.file_url || undefined,
      file_name: d.file_name || undefined,
      file_size: d.file_size ? Number(d.file_size) : undefined,
      mime_type: d.mime_type || undefined,
      duration: d.duration ? Number(d.duration) : undefined,
      thumbnail: d.thumbnail || undefined,

      thumb: d.thumb,
      favorite: d.favorite,
      flag: d.flag,
      star: d.star,
      pin: d.pin,
      archive: d.archive,
      deleted: d.deleted,
      action_this: d.action_this,
      reply: d.reply,
      forward: d.forward,

      deleted_at: d.deleted_at || undefined,
      deleted_by: d.deleted_by || undefined,

      replyemoji: d.replyemoji || undefined,
      replyto_message_id: d.replyto_message_id || undefined,
      replyto_user_id: d.replyto_user_id || undefined,
      parent_message_id: d.parent_message_id || undefined,

      forwardemoji: d.forwardemoji || undefined,
      forwardto_message_id: d.forwardto_message_id || undefined,
      forwardto_user_id: d.forwardto_user_id || undefined,

      sender_message_id: d.sender_message_id || undefined,

      sender: d.sender ? {
        id: d.sender.id,
        name: d.sender.name,
        email: d.sender.email,
        avatar_url: d.sender.avatar || undefined,
      } : undefined,
    }))

    // Load reply references for UI display if needed
    for (const msg of messages) {
      if (msg.reply && msg.replyto_message_id) {
        // Resolve reply message details (we query users table for original sender details if joined)
        const { data: replyMsg, error: replyErr } = await supabase
          .from('chat_messages')
          .select(`
            id,
            message,
            message_type,
            file_name,
            sender:users!sender_user_id(name)
          `)
          .eq('id', msg.replyto_message_id)
          .maybeSingle()

        if (!replyErr && replyMsg) {
          msg.replyMetadata = {
            replyemoji: msg.replyemoji || null,
            replyto_message_id: msg.replyto_message_id,
            replyto_user_id: msg.replyto_user_id || null,
            parent_message_id: msg.parent_message_id || null,
            replyMessageText: replyMsg.message_type === 'text' ? replyMsg.message : `Attachment: ${replyMsg.file_name || 'File'}`,
            replySenderName: replyMsg.sender?.name || 'User',
          }
        }
      }
    }

    return messages
  } catch (e) {
    console.error('Failed to get conversation messages:', e)
    return []
  }
}

export async function createMessage(msg: {
  id?: string
  conversationId: string
  senderId: string
  message: string
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'other'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  duration?: number
  thumbnail?: string
  replyMetadata?: {
    replyemoji?: string | null
    replyto_message_id: string
    replyto_user_id: string | null
    parent_message_id: string | null
  }
  clientMessageId?: string
}): Promise<Message | null> {
  const supabase = createClient()
  try {
    const businessSenderId = await getBusinessUserId(supabase, msg.senderId)

    // 1. Get conversation members (which are now stored as business UUIDs)
    const { data: members, error: membersError } = await supabase
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', msg.conversationId)

    if (membersError || !members || members.length === 0) {
      throw new Error(membersError?.message || 'No members found in conversation')
    }

    const senderMsgId = msg.id || crypto.randomUUID()
    const now = new Date().toISOString()

    // Resolve reply parent message ID if replying
    let resolvedReplyToId: string | null = null
    if (msg.replyMetadata?.replyto_message_id) {
      const { data: replyMsg } = await supabase
        .from('chat_messages')
        .select('id, sender_message_id')
        .eq('id', msg.replyMetadata.replyto_message_id)
        .maybeSingle()
      
      resolvedReplyToId = replyMsg ? (replyMsg.sender_message_id || replyMsg.id) : msg.replyMetadata.replyto_message_id
    }

    // 2. Map copies for all conversation members
    const records = members.map((member: any) => {
      const isSender = member.user_id === businessSenderId
      const msgId = isSender ? senderMsgId : crypto.randomUUID()
      return {
        id: msgId,
        conversation_id: msg.conversationId,
        owner_user_id: member.user_id,
        sender_user_id: businessSenderId,
        message: msg.message,
        message_type: msg.messageType,
        direction: isSender ? 'Sent' : 'Received',
        sent: true,
        received: isSender,
        created_at: now,

        file_url: msg.fileUrl || null,
        file_name: msg.fileName || null,
        file_size: msg.fileSize || null,
        mime_type: msg.mimeType || null,
        duration: msg.duration || null,
        thumbnail: msg.thumbnail || null,

        thumb: false,
        favorite: false,
        flag: false,
        star: false,
        pin: false,
        archive: false,
        deleted: false,
        action_this: false,
        reply: !!msg.replyMetadata,
        forward: false,

        replyemoji: msg.replyMetadata?.replyemoji || null,
        replyto_message_id: resolvedReplyToId,
        replyto_user_id: msg.replyMetadata?.replyto_user_id || null,
        parent_message_id: msg.replyMetadata?.parent_message_id || null,

        sender_message_id: isSender ? null : senderMsgId,
        client_message_id: msg.clientMessageId || null,
        message_status: 'sent',
      }
    })

    // 3. Bulk insert copies into the DB (minimal return to bypass RLS SELECT checks on recipient copies)
    const { error } = await supabase
      .from('chat_messages')
      .insert(records)

    if (error) throw error

    // 4. Return the sender's own copy of the message, constructed locally
    const senderRecord = records.find((r: any) => r.owner_user_id === businessSenderId)
    if (!senderRecord) return null

    // Load sender details from users table to attach to the returned copy
    const { data: profile } = await supabase
      .from('users')
      .select('id, name, email, avatar')
      .eq('id', businessSenderId)
      .maybeSingle()

    return {
      id: senderRecord.id,
      conversation_id: senderRecord.conversation_id,
      owner_user_id: senderRecord.owner_user_id,
      sender_user_id: senderRecord.sender_user_id,
      message: senderRecord.message,
      message_type: senderRecord.message_type,
      direction: senderRecord.direction,
      sent: senderRecord.sent,
      received: senderRecord.received,
      created_at: senderRecord.created_at,
      file_url: senderRecord.file_url || undefined,
      file_name: senderRecord.file_name || undefined,
      file_size: senderRecord.file_size ? Number(senderRecord.file_size) : undefined,
      mime_type: senderRecord.mime_type || undefined,
      duration: senderRecord.duration ? Number(senderRecord.duration) : undefined,
      thumbnail: senderRecord.thumbnail || undefined,
      thumb: senderRecord.thumb,
      favorite: senderRecord.favorite,
      flag: senderRecord.flag,
      star: senderRecord.star,
      pin: senderRecord.pin,
      archive: senderRecord.archive,
      deleted: senderRecord.deleted,
      action_this: senderRecord.action_this,
      reply: senderRecord.reply,
      forward: senderRecord.forward,
      replyemoji: senderRecord.replyemoji || undefined,
      replyto_message_id: senderRecord.replyto_message_id || undefined,
      replyto_user_id: senderRecord.replyto_user_id || undefined,
      parent_message_id: senderRecord.parent_message_id || undefined,
      message_status: senderRecord.message_status,
      client_message_id: senderRecord.client_message_id || undefined,
      sender: profile ? {
        id: profile.id,
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        avatar_url: profile.avatar || undefined,
      } : undefined,
    }

  } catch (err) {
    console.error('Failed to create message copies:', err)
    return null
  }
}

export async function updateMessageBooleanAction(
  messageId: string,
  action: 'thumb' | 'favorite' | 'flag' | 'star' | 'pin' | 'archive' | 'action_this',
  value: boolean
): Promise<boolean> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ [action]: value })
      .eq('id', messageId)

    if (error) throw error
    return true
  } catch (err) {
    console.error(`Failed to update message action ${action}:`, err)
    return false
  }
}

export async function deleteMessageForMe(messageId: string): Promise<boolean> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ deleted: true })
      .eq('id', messageId)

    if (error) throw error
    return true
  } catch (err) {
    console.error('Failed to delete message for me:', err)
    return false
  }
}

export async function deleteMessageForEveryone(messageId: string, senderId: string): Promise<boolean> {
  const supabase = createClient()
  try {
    const businessSenderId = await getBusinessUserId(supabase, senderId)

    // 1. Fetch message details to find sender_message_id
    const { data: msg, error: fetchError } = await supabase
      .from('chat_messages')
      .select('id, sender_user_id, sender_message_id')
      .eq('id', messageId)
      .single()

    if (fetchError || !msg) return false
    if (msg.sender_user_id !== businessSenderId) {
      console.error('Only the sender can delete a message for everyone')
      return false
    }

    const senderMsgId = msg.sender_message_id || msg.id

    // 2. Update all message copies associated with this message
    const { error: updateError } = await supabase
      .from('chat_messages')
      .update({
        message: 'This message was deleted.',
        deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: businessSenderId
      })
      .or(`id.eq.${senderMsgId},sender_message_id.eq.${senderMsgId}`)

    if (updateError) throw updateError
    return true
  } catch (err) {
    console.error('Failed to delete message for everyone:', err)
    return false
  }
}

export async function forwardMessage(
  messageId: string,
  targetConversationIds: string[],
  senderId: string
): Promise<boolean> {
  const supabase = createClient()
  try {
    const businessSenderId = await getBusinessUserId(supabase, senderId)

    // 1. Fetch the original message copy
    const { data: original, error: fetchError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (fetchError || !original) return false

    // 2. Loop and duplicate message copies for target conversations
    for (const conversationId of targetConversationIds) {
      const { data: members, error: membersError } = await supabase
        .from('conversation_members')
        .select('user_id')
        .eq('conversation_id', conversationId)

      if (membersError || !members || members.length === 0) continue

      const senderMsgId = crypto.randomUUID()
      const now = new Date().toISOString()

      const records = members.map((member: any) => {
        const isSender = member.user_id === businessSenderId
        const msgId = isSender ? senderMsgId : crypto.randomUUID()
        return {
          id: msgId,
          conversation_id: conversationId,
          owner_user_id: member.user_id,
          sender_user_id: businessSenderId,
          message: original.message,
          message_type: original.message_type,
          direction: isSender ? 'Sent' : 'Received',
          sent: true,
          received: isSender,
          created_at: now,

          file_url: original.file_url || null,
          file_name: original.file_name || null,
          file_size: original.file_size || null,
          mime_type: original.mime_type || null,
          duration: original.duration || null,
          thumbnail: original.thumbnail || null,

          thumb: false,
          favorite: false,
          flag: false,
          star: false,
          pin: false,
          archive: false,
          deleted: false,
          action_this: false,
          reply: false,
          forward: true,

          forwardto_message_id: original.id,
          forwardto_user_id: original.sender_user_id,

          sender_message_id: isSender ? null : senderMsgId
        }
      })

      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert(records)

      if (insertError) throw insertError
    }

    return true
  } catch (err) {
    console.error('Failed to forward message:', err)
    return false
  }
}
