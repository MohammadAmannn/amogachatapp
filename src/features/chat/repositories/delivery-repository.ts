import { createClient } from '@/lib/supabase/client'

export async function markMessagesAsDelivered(conversationId: string, userId: string): Promise<void> {
  const supabase = createClient()
  try {
    // 1. Fetch undelivered received messages for current user
    const { data: undeliveredRecs } = await supabase
      .from('chat_messages')
      .select('id, sender_message_id')
      .eq('conversation_id', conversationId)
      .eq('owner_user_id', userId)
      .eq('direction', 'Received')
      .eq('message_status', 'sent')

    if (undeliveredRecs && undeliveredRecs.length > 0) {
      const recIds = undeliveredRecs.map((m: any) => m.id)
      const senderMsgIds = undeliveredRecs.map((m: any) => m.sender_message_id).filter(Boolean)

      const nowStr = new Date().toISOString()

      // 2. Mark recipient received copies as delivered
      await supabase
        .from('chat_messages')
        .update({
          message_status: 'delivered',
          delivered_at: nowStr,
        })
        .in('id', recIds)

      // 3. Mark sender original copies as delivered (triggers double gray ticks)
      if (senderMsgIds.length > 0) {
        await supabase
          .from('chat_messages')
          .update({
            message_status: 'delivered',
            delivered_at: nowStr,
          })
          .in('id', senderMsgIds)
      }
    }
  } catch (err) {
    console.error('Failed to mark messages as delivered:', err)
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  const supabase = createClient()
  try {
    // 1. Fetch unread received messages for current user
    const { data: unreadRecs } = await supabase
      .from('chat_messages')
      .select('id, sender_message_id')
      .eq('conversation_id', conversationId)
      .eq('owner_user_id', userId)
      .eq('direction', 'Received')
      .in('message_status', ['sent', 'delivered'])

    if (unreadRecs && unreadRecs.length > 0) {
      const recIds = unreadRecs.map((m: any) => m.id)
      const senderMsgIds = unreadRecs.map((m: any) => m.sender_message_id).filter(Boolean)

      const nowStr = new Date().toISOString()

      // 2. Mark recipient received copies as read
      await supabase
        .from('chat_messages')
        .update({
          message_status: 'read',
          read_at: nowStr,
          delivered_at: nowStr,
        })
        .in('id', recIds)

      // 3. Mark sender original copies as read (triggers double blue ticks)
      if (senderMsgIds.length > 0) {
        await supabase
          .from('chat_messages')
          .update({
            message_status: 'read',
            read_at: nowStr,
          })
          .in('id', senderMsgIds)
      }
    }
  } catch (err) {
    console.error('Failed to mark messages as read:', err)
  }
}
