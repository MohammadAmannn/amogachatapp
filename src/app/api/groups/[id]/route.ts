import { NextRequest, NextResponse } from 'next/server'
import { saveGroup, deleteGroup } from '@/features/groups/repositories/group-repository'

export const runtime = 'nodejs'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    if (!body.groupName || !body.users || !body.status) {
      return NextResponse.json(
        { error: 'groupName, users, and status are required fields' },
        { status: 400 }
      )
    }

    // ✅ Include email and user_uuid in update
    const updated = await saveGroup({ 
      ...body, 
      id,
      email: body.email?.trim().toLowerCase() || undefined,
      userUuid: body.user_uuid || body.userUuid || undefined
    })
    
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update group' }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PUT group error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await deleteGroup(id)
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE group error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}