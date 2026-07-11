import { useState, useCallback } from 'react'
import { Message } from '../types/chat'
import { getConversationMessages } from '../services/message.service'
import { getOfflineMessages } from '../services/messageQueue.service'

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadMessages = useCallback(async (conversationId: string, userId: string) => {
    setIsLoading(true)
    try {
      const dbMessages = await getConversationMessages(conversationId, userId)
      
      // Load offline queued messages from IndexedDB
      const queuedData = await getOfflineMessages()
      const queuedMessagesForConvo: Message[] = queuedData
        .filter((q) => q.conversation_id === conversationId)
        .map((q) => ({
          id: q.client_message_id,
          conversation_id: q.conversation_id,
          owner_user_id: q.sender_id,
          sender_user_id: q.sender_id,
          message: q.message,
          message_type: q.message_type,
          direction: 'Sent',
          sent: false,
          received: false,
          created_at: q.created_at,
          message_status: 'pending',
          client_message_id: q.client_message_id,
          replyto_message_id: q.reply_metadata?.replyto_message_id,
          replyto_user_id: q.reply_metadata?.replyto_user_id,
          parent_message_id: q.reply_metadata?.parent_message_id,
          
          file_name: q.attachment_metadata?.fileName,
          file_size: q.attachment_metadata?.fileSize,
          mime_type: q.attachment_metadata?.mimeType,
          duration: q.attachment_metadata?.duration,
          
          thumb: false,
          favorite: false,
          flag: false,
          star: false,
          pin: false,
          archive: false,
          deleted: false,
          action_this: false,
          reply: !!q.reply_metadata,
          forward: false,
        }))

      setMessages([...dbMessages, ...queuedMessagesForConvo])
    } catch (e) {
      console.error('Failed to load conversation messages:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    messages,
    setMessages,
    isLoading,
    loadMessages,
  }
}
export default useMessages
