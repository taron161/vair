import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Нет userId' }, { status: 400 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { handle: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 })
    }

    return NextResponse.json({ handle: profile.handle })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}