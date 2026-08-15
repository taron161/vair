'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppFooter from '@/components/AppFooter'
import PostEditorWrapper from '@/components/PostEditorWrapper'
import FeedPlaceholder from '@/components/feed/FeedPlaceholder'

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
      <div className="flex-1 overflow-y-auto pb-24">
        <FeedPlaceholder />
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