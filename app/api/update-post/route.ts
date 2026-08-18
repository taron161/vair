import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { postId, caption } = body

    if (!postId) {
      return NextResponse.json({ error: 'Нет postId' }, { status: 400 })
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        caption: caption || null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}