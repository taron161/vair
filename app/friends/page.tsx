'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'

interface UserData {
  id: string
  email?: string
}

function FriendsContent() {
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
        <p className="text-white/50 text-lg">Друзья (скоро)</p>
      </div>
      <AppFooter />
    </>
  )
}

export default function FriendsPage() {
  return (
    <UploadProvider>
      <FriendsContent />
    </UploadProvider>
  )
}