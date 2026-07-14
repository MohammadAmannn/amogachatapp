import { getOfflineMessages, removeMessageFromQueue } from './message-queue'
import { createMessage } from '../repositories/message-repository'
import { uploadAttachment } from '@/features/files/managers/attachment-uploader'

export async function syncOfflineQueue(
  onMessageSynced?: (clientMsgId: string, serverMsg: any) => void
): Promise<void> {
  try {
    const queued = await getOfflineMessages()
    if (queued.length === 0) return

    // Sort chronologically by original creation date
    const sorted = [...queued].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    for (const msg of sorted) {
      let fileUrl = msg.attachment_metadata ? '' : undefined
      let fileName = msg.attachment_metadata?.fileName
      let fileSize = msg.attachment_metadata?.fileSize
      let mimeType = msg.attachment_metadata?.mimeType
      let duration = msg.attachment_metadata?.duration

      // If there is an offline file attachment
      if (msg.attachment_file && msg.attachment_metadata) {
        try {
          const folder = 
            msg.message_type === 'image' ? 'images' : 
            msg.message_type === 'video' ? 'videos' : 
            msg.message_type === 'audio' ? 'audio' : 'documents'

          const fileToUpload = msg.attachment_file instanceof File 
            ? msg.attachment_file 
            : new File([msg.attachment_file], msg.attachment_metadata.fileName, { type: msg.attachment_metadata.mimeType })

          const { promise } = uploadAttachment(fileToUpload, folder)
          const uploadedUrl = await promise
          
          fileUrl = uploadedUrl
        } catch (uploadErr) {
          console.error(`Failed to upload queued attachment for ${msg.client_message_id}:`, uploadErr)
          msg.retry_count = (msg.retry_count || 0) + 1
          if (msg.retry_count > 5) {
            await removeMessageFromQueue(msg.client_message_id)
          }
          continue // skip this message and let next run try it
        }
      }

      // Upload message to database
      try {
        const savedMsg = await createMessage({
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          message: msg.message,
          messageType: msg.message_type,
          fileUrl,
          fileName,
          fileSize,
          mimeType,
          duration,
          replyMetadata: msg.reply_metadata?.replyto_message_id ? {
            replyemoji: msg.reply_metadata.replyemoji || null,
            replyto_message_id: msg.reply_metadata.replyto_message_id,
            replyto_user_id: msg.reply_metadata.replyto_user_id || null,
            parent_message_id: msg.reply_metadata.parent_message_id || null,
          } : undefined,
          clientMessageId: msg.client_message_id,
          locationData: msg.location_data,
          locationType: msg.location_type,
        })

        if (savedMsg) {
          await removeMessageFromQueue(msg.client_message_id)
          if (onMessageSynced) {
            onMessageSynced(msg.client_message_id, savedMsg)
          }
        }
      } catch (sendErr) {
        console.error(`Failed to send queued message ${msg.client_message_id}:`, sendErr)
        break // Pause sync to maintain chronological order
      }
    }
  } catch (err) {
    console.error('Failed to sync offline message queue:', err)
  }
}
