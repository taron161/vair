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

  const handleAvatarSave = async (file: File) => {
    if (!user) return

    const fileName = `${user.id}-${Date.now()}.jpg`

    let uploadError: { message?: string } | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      uploadError = result.error;
      if (!uploadError) break;

      console.error(`Upload attempt ${attempt + 1} failed:`, uploadError);
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }

    if (uploadError) {
      console.error('Upload avatar error after retries:', uploadError);
      return;
    }

    const { data: urlData } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Удаляем старые аватары этого пользователя
    const { data: filesList } = await supabase.storage.from('avatars').list();
    const oldFiles = filesList?.filter(f => f.name.startsWith(user.id) && f.name !== fileName) || [];
    for (const oldFile of oldFiles) {
      await supabase.storage.from('avatars').remove([oldFile.name]);
    }

    const { error: updateError } = await supabase
      .from('Profile')
      .update({ avatarUrl: urlData.publicUrl, updatedAt: new Date().toISOString() })
      .eq('userId', user.id);

    if (updateError) {
      console.error('Update profile error:', updateError);
      return;
    }

    setAvatarUrl(urlData.publicUrl);
    setShowCropper(false);
  };

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