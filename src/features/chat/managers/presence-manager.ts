import { createClient } from '@/lib/supabase/client'

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
    console.error('[presence.service] Error resolving business UUID:', err)
    return authUserId
  }
}

export async function updateProfilePresence(userId: string, isOnline: boolean): Promise<void> {
  const supabase = createClient()
  try {
    const businessUserId = await getBusinessUserId(supabase, userId)

    const { error } = await supabase
      .from('profiles')
      .update({
        status: isOnline ? 'online' : 'offline',
        online: isOnline,
        offline: !isOnline,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessUserId)

    if (error) throw error
  } catch (err) {
    console.error('Failed to update profile presence in database:', err)
  }
}
