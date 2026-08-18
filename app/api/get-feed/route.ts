import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Нет userId' }, { status: 400 })
    }

    // Получаем подписки
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })

    const followingIds = follows.map((f) => f.followingId)

    if (followingIds.length === 0) {
      return NextResponse.json({ posts: [] })
    }

    // Получаем посты с media, likes, comments
    const posts = await prisma.post.findMany({
      where: {
        userId: { in: followingIds },
      },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
        likes: true,
        comments: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Считаем score
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000

    const postsWithScore = posts.map((post) => {
      const likesCount = post.likes.length
      const commentsCount = post.comments.length

      const lastDayLikes = post.likes.filter((l) => {
        return now - new Date(l.createdAt).getTime() < dayInMs
      }).length

      const lastDayComments = post.comments.filter((c) => {
        return now - new Date(c.createdAt).getTime() < dayInMs
      }).length

      const postAge = now - new Date(post.createdAt).getTime()
      const ageHours = Math.max(1, postAge / (1000 * 60 * 60))

      const score =
        (lastDayLikes * 10) +
        (lastDayComments * 20) +
        (likesCount / ageHours) +
        (commentsCount / ageHours) +
        (1000 / ageHours)

      return {
        id: post.id,
        caption: post.caption,
        createdAt: post.createdAt.toISOString(),
        userId: post.userId,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        media: post.media,
        score,
      }
    })

    postsWithScore.sort((a, b) => b.score - a.score)

    return NextResponse.json({ posts: postsWithScore })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}