'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppHeader from '@/components/AppHeader'
import AvatarCropper from '@/components/AvatarCropper'

interface UserData {
  id: string
  email?: string
}

function ProfileContent() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCropper, setShowCropper] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async (userId: string) => {
      const { data: profile } = await supabase
        .from('Profile')
        .select('*')
        .eq('userId', userId)
        .single()
      
      if (profile) {
        setAvatarUrl(profile.avatarUrl || null)
        setDisplayName(profile.displayName || null)
        setNameInput(profile.displayName || '')
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else {
        setUser(user)
        loadProfile(user.id)
      }
      setLoading(false)
    })
  }, [])

  const handleAvatarSave = async (file: File) => {
    if (!user) return

    const fileName = `${user.id}.jpg`
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('Upload avatar error:', uploadError)
      return
    }

    const { data: urlData } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(fileName)

    await supabase
      .from('Profile')
      .update({ avatarUrl: urlData.publicUrl, updatedAt: new Date().toISOString() })
      .eq('userId', user.id)

    setAvatarUrl(urlData.publicUrl)
    setShowCropper(false)
  }

  const handleNameSave = async () => {
    if (!user || !nameInput.trim()) return

    await supabase
      .from('Profile')
      .update({ displayName: nameInput.trim(), updatedAt: new Date().toISOString() })
      .eq('userId', user.id)

    setDisplayName(nameInput.trim())
    setEditingName(false)
  }

  if (loading) return null

  return (
    <>
      <AppHeader email={user?.email} />
      <div className="flex-1 overflow-y-auto px-4 pt-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-emerald-400/30 flex items-center justify-center text-white text-3xl font-bold mb-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Аватар" className="w-full h-full object-cover" />
            ) : (
              displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          
          {displayName && (
            <p className="text-white text-lg font-semibold mb-1">{displayName}</p>
          )}
          <p className="text-white/50 text-sm">{user?.email}</p>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => setShowCropper(true)}
            className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-white/80 text-sm hover:bg-white/10 transition-colors"
          >
            📷 Изменить аватар
          </button>

          {editingName ? (
            <div className="flex gap-2 px-4 py-3 rounded-xl bg-white/5">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ваше имя"
                className="flex-1 bg-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none"
                autoFocus
              />
              <button onClick={handleNameSave} className="text-emerald-400 text-sm font-semibold">
                ОК
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-white/80 text-sm hover:bg-white/10 transition-colors"
            >
              ✏️ Изменить имя
            </button>
          )}

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

      {showCropper && (
        <AvatarCropper
          onSave={handleAvatarSave}
          onClose={() => setShowCropper(false)}
        />
      )}
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