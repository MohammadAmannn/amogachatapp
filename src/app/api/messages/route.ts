import { NextRequest, NextResponse } from 'next/server'
import { getConversationMessages, createMessage } from '@/features/chat/repositories/message-repository'
import { getOrCreateDirectConversation } from '@/features/chat/repositories/conversation-repository'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const recipientId = searchParams.get('recipientId')
    const senderId = searchParams.get('senderId')
    
    if (!conversationId && !recipientId) {
      return NextResponse.json({ error: 'conversationId or recipientId is required' }, { status: 400 })
    }

    if (!senderId) {
      return NextResponse.json({ error: 'senderId (owner_user_id) is required' }, { status: 400 })
    }

    let targetConvoId = conversationId

    if (!targetConvoId && recipientId) {
      targetConvoId = await getOrCreateDirectConversation(senderId, recipientId)
    }

    if (!targetConvoId) {
      return NextResponse.json([])
    }

    const messages = await getConversationMessages(targetConvoId, senderId)
    return NextResponse.json(messages)
  } catch (err) {
    console.error('GET messages error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const isAttachment = body.messageType && body.messageType !== 'text'
    const hasContent = body.message?.trim() || (isAttachment && body.fileUrl)

    if (!hasContent) {
      return NextResponse.json(
        { error: 'message (or fileUrl for attachments) is required' },
        { status: 400 }
      )
    }

    let targetConvoId = body.conversationId

    if (!targetConvoId && body.recipientId) {
      const senderId = body.senderId
      if (!senderId) {
        return NextResponse.json({ error: 'senderId is required to resolve conversation' }, { status: 400 })
      }
      targetConvoId = await getOrCreateDirectConversation(senderId, body.recipientId)
    }

    if (!targetConvoId) {
      return NextResponse.json(
        { error: 'conversationId or recipientId is required to send a message' },
        { status: 400 }
      )
    }

    const senderId = body.senderId
    if (!senderId) {
      return NextResponse.json({ error: 'senderId is required' }, { status: 400 })
    }

    const saved = await createMessage({
      conversationId: targetConvoId,
      senderId,
      message: body.message || '',
      messageType: body.messageType,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      duration: body.duration,
      thumbnail: body.thumbnail,
      replyMetadata: body.replyMetadata,
    })

    if (!saved) {
      return NextResponse.json({ error: 'Failed to save message copies' }, { status: 500 })
    }

    return NextResponse.json(saved, { status: 201 })
  } catch (err) {
    console.error('POST message error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
