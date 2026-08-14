'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import PostEditorWrapper from '@/components/PostEditorWrapper'

interface UserData {
  id: string
  email?: string
}

function FeedContent() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else setUser(user)
      setLoading(false)
    })
  }, [])

  if (loading) return null

  return (
    <>
      <AppHeader email={user?.email} />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/50 text-lg">Лента новостей (скоро)</p>
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