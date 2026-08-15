'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AvatarCropper from '@/components/AvatarCropper'
import AvatarSection from '@/components/profile/AvatarSection'
import ProfileActions from '@/components/profile/ProfileActions'

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

  const compressImage = async (file: File, maxWidth: number): Promise<File> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(img.src)

        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          resolve(compressedFile)
        }, 'image/jpeg', 0.85)
      }
      img.onerror = () => resolve(file)
    })
  }

  const handleAvatarSave = async (file: File) => {
    if (!user) return

    const timestamp = Date.now()
    const fileName450 = `${user.id}-${timestamp}-450.jpg`
    const fileName120 = `${user.id}-${timestamp}-120.jpg`

    // Создаём 450px
    const img450 = await compressImage(file, 450)

    // Создаём 120px
    const img120 = await compressImage(file, 120)

    // Загружаем обе
    let uploadError: { message?: string } | null = null

    for (let attempt = 0; attempt < 3; attempt++) {
      const result450 = await supabase.storage.from('avatars').upload(fileName450, img450, { upsert: true })
      if (result450.error) {
        uploadError = result450.error
        await new Promise(r => setTimeout(r, 2000))
        continue
      }

      const result120 = await supabase.storage.from('avatars').upload(fileName120, img120, { upsert: true })
      if (result120.error) {
        uploadError = result120.error
        await new Promise(r => setTimeout(r, 2000))
        continue
      }

      uploadError = null
      break
    }

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return
    }

    const { data: url450 } = supabase.storage.from('avatars').getPublicUrl(fileName450)
    const { data: url120 } = supabase.storage.from('avatars').getPublicUrl(fileName120)

    // Удаляем старые аватары
    const { data: filesList } = await supabase.storage.from('avatars').list()
    const oldFiles = filesList?.filter(f => f.name.startsWith(user.id) && f.name !== fileName450 && f.name !== fileName120) || []
    for (const oldFile of oldFiles) {
      await supabase.storage.from('avatars').remove([oldFile.name])
    }

    // Обновляем профиль
    await supabase
      .from('Profile')
      .update({
        avatarUrl: url450.publicUrl,
        avatarUrlSmall: url120.publicUrl,
        updatedAt: new Date().toISOString()
      })
      .eq('userId', user.id)

    setAvatarUrl(url450.publicUrl)
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
      <div className="flex-1 overflow-y-auto px-4 pt-8">
        <AvatarSection avatarUrl={avatarUrl} displayName={displayName} email={user?.email} />

        {editingName ? (
          <div className="flex gap-2 px-4 py-3 rounded-xl bg-white/5 mb-1">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ваше имя"
              className="flex-1 bg-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none"
              autoFocus
            />
            <button onClick={handleNameSave} className="text-emerald-400 text-sm font-semibold cursor-pointer">
              ОК
            </button>
          </div>
        ) : (
          <ProfileActions
            onEditAvatar={() => setShowCropper(true)}
            onEditName={() => setEditingName(true)}
            onSettings={() => router.push('/settings')}
            onLogout={() => supabase.auth.signOut().then(() => router.push('/login'))}
          />
        )}
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