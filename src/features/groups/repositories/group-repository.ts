import { createClient } from '@/lib/supabase/client'
import { Group } from '../types/group.types'

export async function getGroups(): Promise<Group[]> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('chat_group')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    if (data) {
      return data.map((d: any) => ({
        id: d.id,
        groupName: d.name,
        description: d.description || '',
        groupImage: d.image_url || '',
        users: Array.isArray(d.users) ? d.users : [],
        status: d.status as 'Active' | 'Inactive',
        email: d.email || undefined,
        userUuid: d.user_uuid || undefined,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }))
    }
  } catch (e) {
    console.error('Supabase getGroups error:', e)
  }
  return []
}export async function saveGroup(group: Omit<Group, 'id'> & { id?: string }): Promise<Group | null> {
  const supabase = createClient()
  const id = group.id || crypto.randomUUID()
  const now = new Date().toISOString()
  
  let userUuid: string | null = null
  const groupEmail = group.email?.trim().toLowerCase()
  
  // ✅ Check if userUuid is already provided (for existing users)
  if (group.userUuid) {
    userUuid = group.userUuid
  } else if (groupEmail) {
    // If not provided, try to find/create from email
    try {
      const { data: existing, error: searchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', groupEmail)
        .maybeSingle()

      if (searchError) throw searchError

      if (existing) {
        userUuid = existing.id
      } else {
        // Create new profile if doesn't exist
        const newUserId = crypto.randomUUID ? crypto.randomUUID() : 
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          })

        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: newUserId,
            email: groupEmail,
            name: group.groupName || groupEmail.split('@')[0],
            avatar: group.groupImage || null,
            status: 'offline',
            online: false,
            offline: true,
            last_seen: now,
            updated_at: now
          })
          .select('id')
          .maybeSingle()

        if (!insertError && inserted) {
          userUuid = inserted.id
        }
      }
    } catch (err) {
      console.error('[group-repository] Failed to get or create group user:', err)
    }
  }

  // ✅ Log to debug
  console.log('[group-repository] Saving group with userUuid:', userUuid)

  // ✅ Prepare the record with user_uuid
  const record = {
    id,
    name: group.groupName,
    description: group.description || null,
    image_url: group.groupImage || null,
    users: group.users || [],
    status: group.status || 'Active',
    email: groupEmail || null,
    user_uuid: userUuid,  // ✅ This should now have a value
    created_at: group.createdAt || now,
    updated_at: now
  }

  try {
    const { error } = await supabase
      .from('chat_group')
      .upsert(record)
    
    if (error) throw error
    
    return {
      id,
      groupName: group.groupName,
      description: group.description || '',
      groupImage: group.groupImage || '',
      users: group.users || [],
      status: group.status || 'Active',
      email: groupEmail || undefined,
      userUuid: userUuid || undefined,
      createdAt: now,
      updatedAt: now,
    }
  } catch (e) {
    console.error('Supabase saveGroup error:', e)
    return null
  }
}

export async function deleteGroup(id: string): Promise<boolean> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('chat_group')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  } catch (e) {
    console.error('Supabase deleteGroup error:', e)
    return false
  }
}