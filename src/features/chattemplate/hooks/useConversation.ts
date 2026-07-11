import { useState, useCallback, useRef, useEffect } from 'react'
import { Conversation } from '../types/chat'
import { getUserConversations, getOrCreateDirectConversation } from '../services/conversation.service'

export function useConversation() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const activeConversationRef = useRef(activeConversation)
  useEffect(() => {
    activeConversationRef.current = activeConversation
  }, [activeConversation])

  const loadConversations = useCallback(async (userId: string) => {
    setIsLoading(true)
    try {
      const data = await getUserConversations(userId)
      setConversations(data)
      
      const activeConvo = activeConversationRef.current
      // Sync active conversation fields if they changed in lists
      if (activeConvo) {
        const updated = data.find(c => c.id === activeConvo.id)
        if (updated) {
          setActiveConversation(updated)
        }
      }
    } catch (e) {
      console.error('Failed to load conversations:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startDirectConversation = useCallback(async (currentUserId: string, targetUserId: string) => {
    setIsLoading(true)
    try {
      const conversationId = await getOrCreateDirectConversation(currentUserId, targetUserId)
      if (conversationId) {
        // Refresh lists
        const data = await getUserConversations(currentUserId)
        setConversations(data)
        const found = data.find(c => c.id === conversationId)
        if (found) {
          setActiveConversation(found)
        }
        return conversationId
      }
    } catch (e) {
      console.error('Failed to start direct conversation:', e)
    } finally {
      setIsLoading(false)
    }
    return null
  }, [])

  return {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
    isLoading,
    loadConversations,
    startDirectConversation,
  }
}
export default useConversation
