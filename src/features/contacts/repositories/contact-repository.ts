import { createClient } from '@/lib/supabase/client'
import { Contact } from '../types/contact.types'

export async function getUserContacts(userId: string): Promise<Contact[]> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        id,
        owner_id,
        contact_user_id,
        nickname,
        email,
        created_at,
        contact_user:profiles!contacts_contact_user_id_fkey (
          id,
          name,
          email,
          avatar,
          company,
          mobile
        )
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!data) return []

    return data.map((d: any) => {
      const u = d.contact_user || {}
      const contactEmail = d.email || u.email || ''
      return {
        id: d.id,
        ownerId: d.owner_id,
        contactUserId: d.contact_user_id,
        fullName: d.nickname || u.name || contactEmail.split('@')[0] || 'Unknown',
        email: contactEmail,
        avatarUrl: u.avatar || undefined,
        company: u.company || undefined,
        mobile: u.mobile || undefined,
        status: 'Active',
        nickname: d.nickname || undefined,
        createdAt: d.created_at,
      }
    })
  } catch (e) {
    console.error('Failed to get user contacts:', e)
    return []
  }
}

export async function createContact(
  ownerId: string,
  contactEmail: string,
  nickname?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  try {
    const emailLower = contactEmail.trim().toLowerCase()

    // ✅ Step 1: Search for existing profile by email
    let { data: profile, error: searchError } = await supabase
      .from('profiles')
      .select('id, name, email, avatar, company, mobile')
      .eq('email', emailLower)
      .maybeSingle()

    if (searchError) throw searchError

    // ✅ Step 2: Prevent adding yourself
    if (profile && profile.id === ownerId) {
      return { success: false, error: 'You cannot add yourself as a contact.' }
    }

    // ✅ Step 3: Check if contact already exists (by email case-insensitively OR by contact_user_id)
    let existingQuery = supabase
      .from('contacts')
      .select('id')
      .eq('owner_id', ownerId)

    if (profile) {
      const { data: existingContact, error: existingError } = await existingQuery
        .or(`email.ilike.${emailLower},contact_user_id.eq.${profile.id}`)
        .maybeSingle()

      if (existingError) throw existingError
      if (existingContact) {
        return { success: false, error: 'This contact is already in your list.' }
      }
    } else {
      const { data: existingContact, error: existingError } = await existingQuery
        .ilike('email', emailLower)
        .maybeSingle()

      if (existingError) throw existingError
      if (existingContact) {
        return { success: false, error: 'This contact is already in your list.' }
      }
    }

    let contactUserId: string

    if (profile) {
      // ✅ User is registered - use existing profile ID
      contactUserId = profile.id
    } else {
      // ✅ User is NOT registered - create a new profile for them
      const displayName = nickname || emailLower.split('@')[0]
      
      // Generate a UUID for the new unregistered user
      const newUserId = crypto.randomUUID ? crypto.randomUUID() : 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })

      // ✅ Insert new profile for unregistered user
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
          email: emailLower,
          name: displayName,
          avatar: null,
          company: null,
          mobile: null,
          status: 'offline',
          online: false,
          offline: true,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .maybeSingle()

      if (insertError) {
        console.error('Failed to create profile for contact:', insertError)
        return { success: false, error: 'Failed to create contact profile.' }
      }

      if (!newProfile) {
        return { success: false, error: 'Failed to create contact profile.' }
      }

      contactUserId = newProfile.id
    }

    // ✅ Step 4: Create the contact entry with user_uuid
    const { error: insertError } = await supabase
      .from('contacts')
      .insert({
        owner_id: ownerId,
        contact_user_id: contactUserId,
        nickname: nickname?.trim() || null,
        email: emailLower,
        user_uuid: ownerId  // ✅ Store the user_uuid
      })

    if (insertError) {
      console.error('Failed to insert contact:', insertError)
      return { success: false, error: 'Failed to add contact.' }
    }

    return { success: true }
  } catch (err) {
    console.error('Failed to create contact:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create contact' }
  }
}

export async function updateContactNickname(
  contactId: string,
  ownerId: string,
  nickname: string
): Promise<boolean> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('contacts')
      .update({ nickname: nickname.trim() || null })
      .eq('id', contactId)
      .eq('owner_id', ownerId)

    if (error) throw error
    return true
  } catch (err) {
    console.error('Failed to update contact nickname:', err)
    return false
  }
}

export async function deleteContact(contactId: string, ownerId: string): Promise<boolean> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId)
      .eq('owner_id', ownerId)

    if (error) throw error
    return true
  } catch (err) {
    console.error('Failed to delete contact:', err)
    return false
  }
}