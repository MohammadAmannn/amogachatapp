import { createClient } from '@/lib/supabase/client'

/**
 * Looks up a user's permanent business UUID from the `users` table using their auth UUID.
 * Called client-side after auth state changes.
 */
export async function resolveBusinessId(authUserId: string): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (error) {
    console.error('[user.service] Failed to resolve business ID:', error.message)
    return null
  }
  return data?.id ?? null
}

/**
 * Looks up or creates a Pending user record by email.
 * Uses a server-side RPC (SECURITY DEFINER) to bypass RLS on the users table.
 * Used when adding contacts or group members who may not have signed in yet.
 */
export async function getOrCreatePendingUser(
  email: string,
  name: string
): Promise<{ id: string; status: string } | null> {
  const supabase = createClient()

  // Call SECURITY DEFINER function — bypasses client-side RLS safely
  const { data, error } = await supabase
    .rpc('get_or_create_pending_user', {
      p_email: email.trim().toLowerCase(),
      p_name: name.trim() || email.split('@')[0],
    })

  if (error) {
    console.error('[user.service] Failed to get/create pending user via RPC:', error.message)
    return null
  }

  if (!data) return null
  return { id: data.id, status: data.status }
}

/**
 * Looks up a user's business ID by email.
 * Returns null if not found.
 */
export async function getUserByEmail(email: string): Promise<{ id: string; name: string; email: string; avatar?: string } | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, avatar')
    .ilike('email', email.trim())
    .maybeSingle()

  if (error || !data) return null
  return {
    id: data.id,
    name: data.name || data.email.split('@')[0],
    email: data.email,
    avatar: data.avatar || undefined,
  }
}

/**
 * Ensures a user record exists for the given auth user.
 * Called after login to guarantee the users table row is present.
 * Returns the permanent business UUID.
 */
export async function ensureUserExists(authUser: {
  authUserId: string
  email: string
  name?: string
  picture?: string
}): Promise<string | null> {
  const supabase = createClient()

  // Try to find by email first (handles the deleted-account-re-signup case)
  const { data: byEmail } = await supabase
    .from('users')
    .select('id, auth_user_id')
    .ilike('email', authUser.email.trim())
    .maybeSingle()

  if (byEmail) {
    // If auth_user_id doesn't match, update it (user deleted account and re-signed in)
    if (byEmail.auth_user_id !== authUser.authUserId) {
      await supabase
        .from('users')
        .update({
          auth_user_id: authUser.authUserId,
          status: 'Active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', byEmail.id)
    }
    return byEmail.id
  }

  // Create a new user row (should be rare since the DB trigger does this on auth insert)
  const { data: created, error } = await supabase
    .from('users')
    .insert({
      email: authUser.email.trim().toLowerCase(),
      name: authUser.name || authUser.email.split('@')[0],
      avatar: authUser.picture || null,
      status: 'Active',
      auth_user_id: authUser.authUserId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[user.service] Failed to create user row:', error.message)
    return null
  }
  return created?.id ?? null
}
