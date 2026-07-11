import { createClient } from '@/lib/client'
import { Conversation, Profile, Message } from '../types/chat'

// Helper function to resolve auth UUID to business UUID
async function getBusinessUserId(supabase: any, authUserId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle()
    
    if (error) throw error
    return data?.id || authUserId
  } catch (err) {
    console.error('[conversation.service] Error resolving business UUID:', err)
    return authUserId
  }
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClient()
  try {
    const businessUserId = await getBusinessUserId(supabase, userId)

    // 1. Get the list of conversation IDs the user belongs to
    const { data: memberOf, error: memberError } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', businessUserId)

    if (memberError) throw memberError
    if (!memberOf || memberOf.length === 0) return []

    const convoIds = memberOf.map((m: any) => m.conversation_id)

    // 2. Fetch conversations including their members and message copies for this user
    // Note: Joins public.users table instead of public.profiles due to updated constraints
    const { data: convos, error: convoError } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_members (
          role,
          joined_at,
          user_id,
          unread_count,
          users (
            id,
            name,
            email,
            avatar
          )
        ),
        chat_messages (
          id,
          conversation_id,
          sender_user_id,
          message,
          message_type,
          file_url,
          file_name,
          file_size,
          mime_type,
          duration,
          created_at,
          deleted,
          deleted_by
        )
      `)
      .in('id', convoIds)

    if (convoError) throw convoError
    if (!convos) return []

    return convos.map((c: any) => {
      // Find members from users join
      const members: Profile[] = (c.conversation_members || [])
        .map((cm: any) => {
          if (!cm.users) return null
          return {
            id: cm.users.id,
            name: cm.users.name,
            email: cm.users.email,
            avatar_url: cm.users.avatar || undefined,
          }
        })
        .filter(Boolean)

      // Sort message copies and filter out messages deleted for me (deleted = true and deleted_by = null)
      const messageCopies = [...(c.chat_messages || [])]
        .filter((m: any) => !m.deleted || m.deleted_by !== null)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      const lastMessage = messageCopies[0] || undefined

      let displayName = c.name || ''
      let displayImage = c.image || ''

      if (c.type === 'direct') {
        const otherMember = members.find(m => m.id !== businessUserId)
        if (otherMember) {
          displayName = otherMember.name
          displayImage = otherMember.avatar_url || ''
        } else {
          displayName = 'Chat Note (You)'
          const selfMember = members.find(m => m.id === businessUserId)
          displayImage = selfMember?.avatar_url || ''
        }
      }

      // Get unread count for current user
      const selfMemberRecord = (c.conversation_members || []).find((cm: any) => cm.user_id === businessUserId)
      const unreadCount = selfMemberRecord?.unread_count || 0

      return {
        id: c.id,
        type: c.type,
        name: displayName,
        image: displayImage,
        created_by: c.created_by || undefined,
        created_at: c.created_at,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          conversation_id: lastMessage.conversation_id,
          sender_user_id: lastMessage.sender_user_id || 'system',
          message: lastMessage.message || '',
          message_type: lastMessage.message_type,
          file_url: lastMessage.file_url || undefined,
          file_name: lastMessage.file_name || undefined,
          file_size: lastMessage.file_size || undefined,
          mime_type: lastMessage.mime_type || undefined,
          duration: lastMessage.duration || undefined,
          created_at: lastMessage.created_at,
          deleted: !!lastMessage.deleted,
        } as Message : undefined,
        unreadCount,
        members,
      }
    })
  } catch (err) {
    console.error('Failed to get user conversations:', err)
    return []
  }
}

export async function getOrCreateDirectConversation(userAId: string, userBId: string): Promise<string | null> {
  const supabase = createClient()
  try {
    const businessUserAId = await getBusinessUserId(supabase, userAId)
    const businessUserBId = await getBusinessUserId(supabase, userBId)

    // 1. Fetch direct conversations userA belongs to
    const { data: membersA, error: errA } = await supabase
      .from('conversation_members')
      .select('conversation_id, conversations!inner(*)')
      .eq('user_id', businessUserAId)
      .eq('conversations.type', 'direct')

    if (errA) throw errA

    if (membersA && membersA.length > 0) {
      const convoIds = membersA.map((m: any) => m.conversation_id)

      // 2. See if userB belongs to any of those direct conversations
      const { data: membersB, error: errB } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .in('conversation_id', convoIds)
        .eq('user_id', businessUserBId)

      if (errB) throw errB

      if (membersB && membersB.length > 0) {
        return membersB[0].conversation_id
      }
    }

    // 3. Create a new direct conversation if none exists
    const { data: newConvo, error: createError } = await supabase
      .from('conversations')
      .insert({
        type: 'direct',
        created_by: businessUserAId,
      })
      .select('*')
      .single()

    if (createError) throw createError

    // 4. Add both members
    const membersToInsert = [
      { conversation_id: newConvo.id, user_id: businessUserAId },
    ]
    if (businessUserAId !== businessUserBId) {
      membersToInsert.push({ conversation_id: newConvo.id, user_id: businessUserBId })
    }

    const { error: insertError } = await supabase
      .from('conversation_members')
      .insert(membersToInsert)

    if (insertError) throw insertError

    return newConvo.id
  } catch (err) {
    console.error('Failed to get or create direct conversation:', err)
    return null
  }
}

export async function createGroupConversation(
  groupName: string,
  groupImage: string | null,
  memberIds: string[],
  creatorId: string,
  type: 'group' | 'channel_group' | 'message_group' = 'group'
): Promise<Conversation | null> {
  const supabase = createClient()
  try {
    const businessCreatorId = await getBusinessUserId(supabase, creatorId)
    const resolvedMemberIds = await Promise.all(
      memberIds.map(id => getBusinessUserId(supabase, id))
    )

    const { data: newConvo, error: createError } = await supabase
      .from('conversations')
      .insert({
        type,
        name: groupName,
        image: groupImage,
        created_by: businessCreatorId,
      })
      .select('*')
      .single()

    if (createError) throw createError

    const allMemberIds = Array.from(new Set([...resolvedMemberIds, businessCreatorId]))
    const membersToInsert = allMemberIds.map(userId => ({
      conversation_id: newConvo.id,
      user_id: userId,
    }))

    const { error: insertError } = await supabase
      .from('conversation_members')
      .insert(membersToInsert)

    if (insertError) throw insertError

    return {
      id: newConvo.id,
      type: newConvo.type,
      name: newConvo.name,
      image: newConvo.image || undefined,
      created_by: newConvo.created_by,
      created_at: newConvo.created_at,
      members: [],
    }
  } catch (err) {
    console.error('Failed to create group conversation:', err)
    return null
  }
}

export async function clearConversationUnreadCount(conversationId: string, userId: string): Promise<boolean> {
  const supabase = createClient()
  try {
    const businessUserId = await getBusinessUserId(supabase, userId)

    const { error } = await supabase
      .from('conversation_members')
      .update({ unread_count: 0 })
      .eq('conversation_id', conversationId)
      .eq('user_id', businessUserId)

    if (error) throw error
    return true
  } catch (err) {
    console.error('Failed to clear unread count:', err)
    return false
  }
}
