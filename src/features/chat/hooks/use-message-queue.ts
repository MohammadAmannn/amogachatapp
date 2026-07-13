import { useState, useEffect, useCallback } from 'react'
import { getOfflineMessages, addMessageToQueue, removeMessageFromQueue } from '../managers/message-queue'
import { syncOfflineQueue } from '../managers/offline-sync'
import { QueuedMessage } from '../utils/indexeddb'
import { useOnlineStatus } from './use-online-status'

export function useMessageQueue(onMessageSynced?: (clientMsgId: string, serverMsg: any) => void) {
  const [queue, setQueue] = useState<QueuedMessage[]>([])
  const isOnline = useOnlineStatus()

  const loadQueue = useCallback(async () => {
    try {
      const items = await getOfflineMessages()
      setQueue(items)
    } catch (e) {
      console.error('Failed to load offline queue:', e)
    }
  }, [])

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  // Automatically trigger sync when coming online, with periodic retries if queue is not empty
  useEffect(() => {
    if (!isOnline) return

    const executeSync = () => {
      syncOfflineQueue((clientMsgId, serverMsg) => {
        loadQueue()
        if (onMessageSynced) {
          onMessageSynced(clientMsgId, serverMsg)
        }
      })
    }

    // Run immediately
    executeSync()

    // Periodically retry every 10 seconds while online
    const interval = setInterval(executeSync, 10000)

    return () => clearInterval(interval)
  }, [isOnline, loadQueue, onMessageSynced])

  const enqueue = useCallback(async (msg: {
    conversationId: string
    senderId: string
    message: string
    messageType?: 'text' | 'image' | 'video' | 'document' | 'audio'
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
  }) => {
    const item = await addMessageToQueue(msg)
    await loadQueue()
    return item
  }, [loadQueue])

  const dequeue = useCallback(async (clientMsgId: string) => {
    await removeMessageFromQueue(clientMsgId)
    await loadQueue()
  }, [loadQueue])

  return {
    queue,
    enqueue,
    dequeue,
    isOnline,
    refreshQueue: loadQueue,
  }
}
export default useMessageQueue
