import { queueMessage, getQueuedMessages, deleteQueuedMessage, QueuedMessage } from '../utils/indexeddb'

export async function addMessageToQueue(msg: {
  conversationId: string
  senderId: string
  message: string
  messageType?: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location'
  attachmentFile?: File | Blob
  attachmentMetadata?: {
    fileName: string
    fileSize: number
    mimeType: string
    duration?: number
  }
  replyMetadata?: {
    replyemoji?: string
    replyto_message_id?: string
    replyto_user_id?: string
    parent_message_id?: string
  }
  locationData?: any
  locationType?: 'current' | 'live'
}): Promise<QueuedMessage> {
  const clientMsgId = crypto.randomUUID()
  const queuedItem: QueuedMessage = {
    client_message_id: clientMsgId,
    conversation_id: msg.conversationId,
    sender_id: msg.senderId,
    message: msg.message,
    message_type: msg.messageType || 'text',
    created_at: new Date().toISOString(),
    reply_metadata: msg.replyMetadata,
    retry_count: 0,
    attachment_file: msg.attachmentFile,
    attachment_metadata: msg.attachmentMetadata,
    location_data: msg.locationData,
    location_type: msg.locationType,
  }

  await queueMessage(queuedItem)
  return queuedItem
}

export async function getOfflineMessages(): Promise<QueuedMessage[]> {
  return await getQueuedMessages()
}

export async function removeMessageFromQueue(clientMsgId: string): Promise<void> {
  await deleteQueuedMessage(clientMsgId)
}
