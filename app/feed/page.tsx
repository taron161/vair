'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppFooter from '@/components/AppFooter'
import PostEditorWrapper from '@/components/PostEditorWrapper'
import PostListClient from '@/components/PostListClient'

interface UserData {
  id: string
  email?: string
}

interface Media {
  id: string
  url: string
  type: string
  order: number
  fullUrl?: string
}

interface Post {
  id: string
  caption: string | null
  createdAt: string
  media: Media[]
  userId?: string
  score?: number
}

function FeedContent() {
  const [user, setUser] = useState<UserData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadFeed = async (userId: string) => {
      const res = await fetch('/api/get-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts)
      }
      setLoading(false)
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        loadFeed(user.id)
      }
    })
  }, [router])

  if (loading) return null

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-24 pt-4">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center h-full px-6">
            <div className="text-center">
              <p className="text-white text-lg mb-2">Лента пуста</p>
              <p className="text-white/50 text-sm">Подпишитесь на пользователей, чтобы видеть их посты</p>
            </div>
          </div>
        ) : (
          <PostListClient posts={posts} userId={user?.id || ''} />
        )}
      </div>
      <AppFooter />
      <PostEditorWrapper />
    </>
  )
}

export default function FeedPage() {
  return (
    <UploadProvider>
      <FeedContent />
    </UploadProvider>
  )
}