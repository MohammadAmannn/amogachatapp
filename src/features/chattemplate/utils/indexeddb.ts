const DB_NAME = 'amoga-chat-db'
const DB_VERSION = 1

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in the browser'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result
      if (!db.objectStoreNames.contains('offline_queue')) {
        db.createObjectStore('offline_queue', { keyPath: 'client_message_id' })
      }
    }
  })
}

export interface QueuedMessage {
  client_message_id: string
  conversation_id: string
  sender_id: string
  message: string
  message_type: 'text' | 'image' | 'video' | 'document' | 'audio'
  created_at: string
  reply_metadata?: {
    replyemoji?: string
    replyto_message_id?: string
    replyto_user_id?: string
    parent_message_id?: string
  }
  forward_metadata?: {
    forwardemoji?: string
    forwardto_message_id?: string
    forwardto_user_id?: string
  }
  retry_count: number
  attachment_file?: File | Blob
  attachment_metadata?: {
    fileName: string
    fileSize: number
    mimeType: string
    duration?: number
  }
}

export async function queueMessage(message: QueuedMessage): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_queue', 'readwrite')
    const store = tx.objectStore('offline_queue')
    const request = store.put(message)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getQueuedMessages(): Promise<QueuedMessage[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_queue', 'readonly')
    const store = tx.objectStore('offline_queue')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function deleteQueuedMessage(clientMsgId: string): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_queue', 'readwrite')
    const store = tx.objectStore('offline_queue')
    const request = store.delete(clientMsgId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
