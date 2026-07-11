import { useState, useCallback } from 'react'
import { Message } from '../types/chat'
import { createMessage } from '../services/message.service'

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
        messageType: attachment?.messageType,
        fileUrl: attachment?.fileUrl,
        fileName: attachment?.fileName,
        fileSize: attachment?.fileSize,
        mimeType: attachment?.mimeType,
        duration: attachment?.duration,
        replyMetadata,
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
