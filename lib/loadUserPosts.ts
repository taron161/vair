import { prisma } from '@/lib/prisma'

export async function loadUserPosts(handle: string) {
  const profile = await prisma.profile.findUnique({
    where: { handle },
  })

  if (!profile) return null

  const posts = await prisma.post.findMany({
    where: { userId: profile.userId },
    include: {
      media: {
        orderBy: { order: 'asc' },
      },
      likes: true,
      comments: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return { profile, posts }
}