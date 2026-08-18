import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { postId, userId, caption, mediaRecords } = body

    if (!postId || !userId || !mediaRecords || mediaRecords.length === 0) {
      return NextResponse.json({ error: 'Нет данных' }, { status: 400 })
    }

    // Создаём пост
    await prisma.post.create({
      data: {
        id: postId,
        userId,
        caption: caption || null,
      },
    })

    // Создаём media записи
    for (const media of mediaRecords) {
      await prisma.media.create({
        data: {
          id: crypto.randomUUID(),
          postId,
          url: media.url,
          fullUrl: media.fullUrl || null,
          type: media.type,
          order: media.order,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}