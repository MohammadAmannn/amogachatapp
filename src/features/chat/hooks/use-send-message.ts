import { useState, useCallback } from 'react'
import { Message } from '../types/chat.types'
import { createMessage } from '../repositories/message-repository'

export function useSendMessage() {
  const [isSending, setIsSending] = useState(false)

  const sendMessage = useCallback(async (
    conversationId: string,
    senderId: string,
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
    }
  ): Promise<Message | null> => {
    setIsSending(true)
    try {
      const savedMsg = await createMessage({
        conversationId,
        senderId,
        message: text,
        messageType: attachment?.messageType || 'text',
        fileUrl: attachment?.fileUrl,
        fileName: attachment?.fileName,
        fileSize: attachment?.fileSize,
        mimeType: attachment?.mimeType,
        duration: attachment?.duration,
        replyMetadata: replyMetadata?.replyto_message_id ? {
          replyemoji: replyMetadata.replyemoji || null,
          replyto_message_id: replyMetadata.replyto_message_id,
          replyto_user_id: replyMetadata.replyto_user_id || null,
          parent_message_id: replyMetadata.parent_message_id || null,
        } : undefined,
      })

      return savedMsg
    } catch (e) {
      console.error('Failed to send message:', e)
      return null
    } finally {
      setIsSending(false)
    }
  }, [])

  return {
    sendMessage,
    isSending,
  }
}
export default useSendMessage
