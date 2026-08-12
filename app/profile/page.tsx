'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppHeader from '@/components/AppHeader'

interface UserData {
  id: string
  email?: string
}

function ProfileContent() {
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
      <div className="flex-1 overflow-y-auto px-4 pt-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-400/30 flex items-center justify-center text-white text-3xl font-bold mb-3">
            {user?.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <p className="text-white/50 text-sm">{user?.email}</p>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => router.push('/settings')}
            className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-white/80 text-sm hover:bg-white/10 transition-colors"
          >
            ⚙️ Настройки
          </button>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-red-400 text-sm hover:bg-white/10 transition-colors"
          >
            🚪 Выйти
          </button>
        </div>
      </div>
    </>
  )
}

export default function ProfilePage() {
  return (
    <UploadProvider>
      <ProfileContent />
    </UploadProvider>
  )
}