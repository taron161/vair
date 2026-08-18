import { prisma } from '@/lib/prisma'

interface UpdateProfileData {
  displayName?: string | null
  bio?: string | null
  avatarUrl?: string | null
  avatarUrlSmall?: string | null
  birthDate?: string | null
  showBirthDate?: boolean
  gender?: string | null
}

// Получить профиль по userId
export async function getProfileByUserId(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
  })
}

// Получить профиль по handle
export async function getProfileByHandle(handle: string) {
  return prisma.profile.findUnique({
    where: { handle },
  })
}

// Создать профиль
export async function createProfile(data: {
  id: string
  userId: string
  handle: string
}) {
  return prisma.profile.create({
    data: {
      id: data.id,
      userId: data.userId,
      handle: data.handle,
    },
  })
}

// Обновить профиль
export async function updateProfile(userId: string, data: UpdateProfileData) {
  return prisma.profile.update({
    where: { userId },
    data,
  })
}

// Получить посты пользователя с media
export async function getPostsByUserId(userId: string) {
  return prisma.post.findMany({
    where: { userId },
    include: {
      media: {
        orderBy: { order: 'asc' },
      },
      likes: true,
      comments: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// Создать пост
export async function createPost(data: {
  id: string
  userId: string
  caption?: string | null
}) {
  return prisma.post.create({
    data: {
      id: data.id,
      userId: data.userId,
      caption: data.caption || null,
    },
  })
}

// Создать media
export async function createMedia(data: {
  id: string
  postId: string
  url: string
  fullUrl?: string
  type: string
  order: number
}) {
  return prisma.media.create({
    data: {
      id: data.id,
      postId: data.postId,
      url: data.url,
      fullUrl: data.fullUrl,
      type: data.type,
      order: data.order,
    },
  })
}

// Лайк
export async function toggleLike(postId: string, userId: string) {
  const existing = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  })

  if (existing) {
    await prisma.like.delete({
      where: { id: existing.id },
    })
    await prisma.post.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } },
    })
    return false
  } else {
    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    })
    await prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    })
    return true
  }
}

// Подписка
export async function toggleFollow(followerId: string, followingId: string) {
  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  })

  if (existing) {
    await prisma.follow.delete({
      where: { id: existing.id },
    })
    return false
  } else {
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    })
    return true
  }
}

// Сообщения
export async function getMessages(userId: string, receiverId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function sendMessage(data: {
  id: string
  senderId: string
  receiverId: string
  text: string
}) {
  return prisma.message.create({
    data: {
      id: data.id,
      senderId: data.senderId,
      receiverId: data.receiverId,
      text: data.text,
    },
  })
}

// Получить лайки поста
export async function getLikesByPostId(postId: string) {
  return prisma.like.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              handle: true,
              displayName: true,
              avatarUrl: true,
              avatarUrlSmall: true,
            },
          },
        },
      },
    },
  })
}

// Получить комментарии поста
export async function getCommentsByPostId(postId: string) {
  return prisma.comment.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              handle: true,
              displayName: true,
              avatarUrl: true,
              avatarUrlSmall: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}

// Добавить комментарий
export async function createComment(data: {
  id: string
  postId: string
  userId: string
  text: string
}) {
  await prisma.comment.create({
    data: {
      id: data.id,
      postId: data.postId,
      userId: data.userId,
      text: data.text,
    },
  })
  await prisma.post.update({
    where: { id: data.postId },
    data: { commentsCount: { increment: 1 } },
  })
}

// Удалить пост
export async function deletePost(postId: string) {
  return prisma.post.delete({
    where: { id: postId },
  })
}

// Получить подписки пользователя
export async function getFollowing(userId: string) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })
}

// Получить подписчиков пользователя
export async function getFollowers(userId: string) {
  return prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        include: {
          profile: {
            select: {
              handle: true,
              displayName: true,
              avatarUrl: true,
              avatarUrlSmall: true,
            },
          },
        },
      },
    },
  })
}

// Получить пользователя
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  })
}

// Создать пользователя
export async function createUser(data: {
  id: string
  email: string
}) {
  return prisma.user.create({
    data: {
      id: data.id,
      email: data.email,
    },
  })
}