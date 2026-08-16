'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AvatarCropper from '@/components/AvatarCropper'
import BioEditor from '@/components/profile/BioEditor'
import BirthDateEditor from '@/components/profile/BirthDateEditor'
import GenderSelect from '@/components/profile/GenderSelect'
import NameEditor from '@/components/profile/NameEditor'

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
  const [birthDate, setBirthDate] = useState('')
  const [showBirthDate, setShowBirthDate] = useState(true)
  const [gender, setGender] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [bioInput, setBioInput] = useState('')
  const [originalBio, setOriginalBio] = useState('')
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
        setBioInput(profile.bio || '')
        setOriginalBio(profile.bio || '')
        setBirthDate(profile.birthDate || '')
        setShowBirthDate(profile.showBirthDate !== false)
        setGender(profile.gender || '')
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

    const img450 = await compressImage(file, 450)
    const img120 = await compressImage(file, 120)

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

    const { data: filesList } = await supabase.storage.from('avatars').list()
    const oldFiles = filesList?.filter(f => f.name.startsWith(user.id) && f.name !== fileName450 && f.name !== fileName120) || []
    for (const oldFile of oldFiles) {
      await supabase.storage.from('avatars').remove([oldFile.name])
    }

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

  const handleBioSave = async () => {
    if (!user) return

    await supabase
      .from('Profile')
      .update({ bio: bioInput.trim(), updatedAt: new Date().toISOString() })
      .eq('userId', user.id)

    setOriginalBio(bioInput.trim())
  }

  const handleBirthDateChange = async (value: string) => {
    if (!user) return

    setBirthDate(value)

    await supabase
      .from('Profile')
      .update({ birthDate: value || null, updatedAt: new Date().toISOString() })
      .eq('userId', user.id)
  }

  const handleShowBirthDateChange = async (value: boolean) => {
    if (!user) return

    setShowBirthDate(value)

    await supabase
      .from('Profile')
      .update({ showBirthDate: value, updatedAt: new Date().toISOString() })
      .eq('userId', user.id)
  }

  const handleGenderChange = async (value: string) => {
    if (!user) return

    setGender(value)

    await supabase
      .from('Profile')
      .update({ gender: value || null, updatedAt: new Date().toISOString() })
      .eq('userId', user.id)
  }

  if (loading) return null

  return (
    <>
      <div className="flex-1 flex flex-col px-4 pt-8 pb-20">
        <div>
          {/* Аватар */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-emerald-400/30 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {displayName?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowCropper(true)}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✏️
              </button>
            </div>
          </div>

          <NameEditor
            editing={editingName}
            value={nameInput}
            displayName={displayName}
            onChange={setNameInput}
            onStartEdit={() => setEditingName(true)}
            onSave={handleNameSave}
          />

          <BioEditor
            value={bioInput}
            originalValue={originalBio}
            onChange={setBioInput}
            onSave={handleBioSave}
          />

          <BirthDateEditor
            value={birthDate}
            showToOthers={showBirthDate}
            onChange={handleBirthDateChange}
            onToggleShow={handleShowBirthDateChange}
          />

          <GenderSelect
            value={gender}
            onChange={handleGenderChange}
          />
        </div>

        {/* Настройки и выход */}
        <div className="mt-auto flex gap-2 pt-4">
          <button
            onClick={() => router.push('/settings')}
            className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
          >
            ⚙️
          </button>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-colors cursor-pointer"
          >
            Выйти
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