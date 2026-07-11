import { NextRequest, NextResponse } from 'next/server'
import { saveGroup } from '@/lib/contact-group-store'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json([])
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json([])
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from('chat_group')
      .select('*')
      .contains('users', JSON.stringify([email]))
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (data || []).map((d: any) => ({
      id: d.id,
      groupName: d.name,
      description: d.description || '',
      groupImage: d.image_url || '',
      users: Array.isArray(d.users) ? d.users : [],
      status: d.status as 'Active' | 'Inactive',
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }))

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('GET groups error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.groupName || !body.users || !body.status || !body.email) {
      return NextResponse.json(
        { error: 'groupName, users, status, and email are required fields' },
        { status: 400 }
      )
    }

    const saved = await saveGroup(body)
    if (!saved) {
      return NextResponse.json({ error: 'Failed to save group' }, { status: 500 })
    }

    return NextResponse.json(saved, { status: 201 })
  } catch (err) {
    console.error('POST group error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
