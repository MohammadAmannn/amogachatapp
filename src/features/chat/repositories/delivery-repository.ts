import { createClient } from '@/lib/supabase/client'

export async function markMessagesAsDelivered(conversationId: string, userId: string): Promise<void> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({
        message_status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .eq('owner_user_id', userId)
      .eq('direction', 'Received')
      .eq('message_status', 'sent')

    if (error) throw error
  } catch (err) {
    console.error('Failed to mark messages as delivered:', err)
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({
        message_status: 'read',
        read_at: new Date().toISOString(),
        delivered_at: new Date().toISOString(), // Ensure delivered_at is also set if it skipped
      })
      .eq('conversation_id', conversationId)
      .eq('owner_user_id', userId)
      .eq('direction', 'Received')
      .in('message_status', ['sent', 'delivered'])

    if (error) throw error
  } catch (err) {
    console.error('Failed to mark messages as read:', err)
  }
}
