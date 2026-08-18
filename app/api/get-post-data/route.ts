import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const userId = searchParams.get('userId')

    if (!postId) {
      return NextResponse.json({ error: 'Нет postId' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        likes: {
          where: userId ? { userId } : undefined,
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Пост не найден' }, { status: 404 })
    }

    // Проверяем, лайкнул ли текущий пользователь
    const liked = userId ? post.likes.some((l) => l.userId === userId) : false

    // Получаем аватары лайкнувших из подписок
    let likersAvatars: string[] = []

    if (userId) {
      const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      })

      const followingIds = follows.map((f) => f.followingId)

      const likers = await prisma.like.findMany({
        where: {
          postId,
          userId: { in: followingIds },
        },
        select: {
          user: {
            select: {
              profile: {
                select: {
                  avatarUrlSmall: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        take: 7,
      })

      likersAvatars = likers
        .map((l) => l.user.profile?.avatarUrlSmall || l.user.profile?.avatarUrl)
        .filter(Boolean) as string[]
    }

    return NextResponse.json({
      liked,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      likersAvatars,
      authorAvatar: post.user.profile?.avatarUrl || null,
      authorName: post.user.profile?.displayName || null,
      authorHandle: post.user.profile?.handle || null,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}