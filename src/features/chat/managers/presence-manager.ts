import { createClient } from '@/lib/supabase/client'

export async function updateProfilePresence(userId: string, isOnline: boolean): Promise<void> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        status: isOnline ? 'online' : 'offline',
        online: isOnline,
        offline: !isOnline,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error
  } catch (err) {
    console.error('Failed to update profile presence in database:', err)
  }
}
