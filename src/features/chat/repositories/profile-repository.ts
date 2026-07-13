import { createClient } from '@/lib/supabase/client'
import { Profile } from '../types/chat.types'

export async function ensureProfileExists(user: {
  accountNo: string
  email: string
  name?: string
  picture?: string
}): Promise<Profile | null> {
  const supabase = createClient()
  try {
    // 1. First, check if the profile exists by ID
    const { data: byId, error: errorId } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.accountNo)
      .maybeSingle()

    if (errorId) throw errorId

    if (byId) {
      return {
        id: byId.id,
        name: byId.name || user.name || user.email.split('@')[0],
        email: byId.email || user.email,
        avatar_url: byId.avatar || user.picture || undefined,
      }
    }

    // 2. If not found by ID, check if a profile with this email already exists case-insensitively
    const { data: byEmail, error: errorEmail } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', user.email.trim())
      .maybeSingle()

    if (errorEmail) throw errorEmail

    if (byEmail) {
      console.log(`[profile.service] Profile with email ${user.email} already exists with ID: ${byEmail.id}. Attempting to update ID.`)
      // Try to update the ID to the new accountNo (reconcile)
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ id: user.accountNo })
        .eq('id', byEmail.id)
        .select('*')
        .maybeSingle()

      if (!updateError && updatedProfile) {
        return {
          id: updatedProfile.id,
          name: updatedProfile.name || user.name || user.email.split('@')[0],
          email: updatedProfile.email,
          avatar_url: updatedProfile.avatar || user.picture || undefined,
        }
      }

      // If update failed (e.g. FK constraint block), return the existing profile
      return {
        id: byEmail.id,
        name: byEmail.name || user.name || user.email.split('@')[0],
        email: byEmail.email,
        avatar_url: byEmail.avatar || user.picture || undefined,
      }
    }

    // 3. Insert new profile
    const name = user.name || user.email.split('@')[0]
    const avatar = user.picture || null

    try {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.accountNo,
          name,
          avatar,
          email: user.email,
        })
        .select('*')
        .single()

      if (insertError) {
        if (insertError.code === '23505') {
          // Fallback select by email in case of race condition
          const { data: fallback } = await supabase
            .from('profiles')
            .select('*')
            .ilike('email', user.email.trim())
            .maybeSingle()
          
          if (fallback) {
            return {
              id: fallback.id,
              name: fallback.name || name,
              email: fallback.email,
              avatar_url: fallback.avatar || undefined,
            }
          }
        }
        throw insertError
      }

      return {
        id: newProfile.id,
        name: newProfile.name,
        email: newProfile.email,
        avatar_url: newProfile.avatar || undefined,
      }
    } catch (insertCatchErr: any) {
      if (insertCatchErr.code === '23505') {
        const { data: fallback } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', user.email.trim())
          .maybeSingle()
        
        if (fallback) {
          return {
            id: fallback.id,
            name: fallback.name || name,
            email: fallback.email,
            avatar_url: fallback.avatar || undefined,
          }
        }
      }
      throw insertCatchErr
    }
  } catch (err) {
    console.error('Failed in ensureProfileExists:', err)
    return null
  }
}

export async function getProfileByEmail(email: string): Promise<Profile | null> {
  const supabase = createClient()
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (error) throw error
    const data = profiles && profiles.length > 0 ? profiles[0] : null
    if (!data) return null

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar_url: data.avatar || undefined,
    }
  } catch (err) {
    console.error('Failed to get profile by email:', err)
    return null
  }
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    if (!data) return []

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      avatar_url: d.avatar || undefined,
    }))
  } catch (err) {
    console.error('Failed to get all profiles:', err)
    return []
  }
}

export async function getOrCreateProfileForContact(email: string, name: string): Promise<Profile | null> {
  const existing = await getProfileByEmail(email)
  if (existing) return existing

  const supabase = createClient()
  const placeholderId = crypto.randomUUID()
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: placeholderId,
        name,
        email,
      })
      .select('*')
      .single()

    if (error) throw error
    if (data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar_url: data.avatar || undefined,
      }
    }
  } catch (err) {
    console.error('Failed to create placeholder profile:', err)
  }
  return null
}


