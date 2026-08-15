'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'

interface UserData {
  id: string
  email?: string
}

function SettingsContent() {
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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/50 text-lg">Настройки (скоро)</p>
      </div>
    </>
  )
}

export default function SettingsPage() {
  return (
    <UploadProvider>
      <SettingsContent />
    </UploadProvider>
  )
}