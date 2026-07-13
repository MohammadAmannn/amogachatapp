import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message } from '../types/chat.types'

export function useRealtime(
  userId: string | undefined,
  onNewMessage: (msg: Message) => void,
  onUpdateMessage?: (msg: Message) => void,
  onDeleteMessage?: (msgId: string) => void
) {
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`user-chat-messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `owner_user_id=eq.${userId}`,
        },
        async (payload: any) => {
          if (payload.eventType === 'DELETE') {
            if (onDeleteMessage) {
              onDeleteMessage(payload.old.id)
            }
            return
          }

          const newMsg = payload.new as any

          // Resolve sender profile information to display name/avatar
          let senderProfile = undefined
          if (newMsg.sender_user_id) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, name, email, avatar')
                .eq('id', newMsg.sender_user_id)
                .maybeSingle()
              
              if (profile) {
                senderProfile = {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  avatar_url: profile.avatar || undefined,
                }
              }
            } catch (err) {
              console.error('Failed to load sender profile for realtime message:', err)
            }
          }

          const messageObj: Message = {
            id: newMsg.id,
            conversation_id: newMsg.conversation_id,
            owner_user_id: newMsg.owner_user_id,
            sender_user_id: newMsg.sender_user_id,
            message: newMsg.message,
            message_type: newMsg.message_type,
            direction: newMsg.direction,
            sent: newMsg.sent,
            received: newMsg.received,
            created_at: newMsg.created_at,
            
            message_status: newMsg.message_status || undefined,
            client_message_id: newMsg.client_message_id || undefined,
            queued_at: newMsg.queued_at || undefined,
            delivered_at: newMsg.delivered_at || undefined,
            read_at: newMsg.read_at || undefined,
            retry_count: newMsg.retry_count ? Number(newMsg.retry_count) : undefined,

            file_url: newMsg.file_url || undefined,
            file_name: newMsg.file_name || undefined,
            file_size: newMsg.file_size ? Number(newMsg.file_size) : undefined,
            mime_type: newMsg.mime_type || undefined,
            duration: newMsg.duration ? Number(newMsg.duration) : undefined,
            thumbnail: newMsg.thumbnail || undefined,

            thumb: newMsg.thumb,
            favorite: newMsg.favorite,
            flag: newMsg.flag,
            star: newMsg.star,
            pin: newMsg.pin,
            archive: newMsg.archive,
            deleted: newMsg.deleted,
            action_this: newMsg.action_this,
            reply: newMsg.reply,
            forward: newMsg.forward,

            deleted_at: newMsg.deleted_at || undefined,
            deleted_by: newMsg.deleted_by || undefined,

            replyemoji: newMsg.replyemoji || undefined,
            replyto_message_id: newMsg.replyto_message_id || undefined,
            replyto_user_id: newMsg.replyto_user_id || undefined,
            parent_message_id: newMsg.parent_message_id || undefined,

            forwardemoji: newMsg.forwardemoji || undefined,
            forwardto_message_id: newMsg.forwardto_message_id || undefined,
            forwardto_user_id: newMsg.forwardto_user_id || undefined,

            sender_message_id: newMsg.sender_message_id || undefined,
            sender: senderProfile,
          }

          if (payload.eventType === 'INSERT') {
            onNewMessage(messageObj)
          } else if (payload.eventType === 'UPDATE') {
            if (onUpdateMessage) {
              onUpdateMessage(messageObj)
            } else {
              // Backward compatibility: trigger onNewMessage on update if it's the only handler
              onNewMessage(messageObj)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onNewMessage, onUpdateMessage, onDeleteMessage])
}
export default useRealtime
