'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import PostEditorWrapper from '@/components/PostEditorWrapper'
import Link from 'next/link'

interface UserData {
  id: string
  email?: string
}

interface Profile {
  id: string
  userId: string
  handle: string
  displayName?: string | null
}

function ExploreContent() {
  const [user, setUser] = useState<UserData | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else setUser(user)
    })

    const loadProfiles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const { data } = await supabase
        .from('Profile')
        .select('*')
        .order('createdAt', { ascending: false });

      if (data) {
        const filtered = data.filter((profile) => profile.userId !== currentUserId);
        setProfiles(filtered);
      }
      setLoading(false);
    };

    loadProfiles();
  }, []);

  if (loading) return null

  return (
    <>
      <AppHeader email={user?.email} />

      <div className="flex-1 overflow-y-auto pb-24 pt-4">
        {/* Строка поиска */}
        <div className="px-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск пользователей..."
            className="w-full bg-white/5 text-white text-sm rounded-xl px-4 py-2.5 placeholder-white/30 focus:outline-none focus:bg-white/10"
          />
        </div>

        <div className="space-y-0">
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/${profile.handle}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-400/30 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {profile.userId.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  @{profile.handle}
                </p>
                {profile.displayName && (
                  <p className="text-white/40 text-xs truncate">{profile.displayName}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {profiles.length === 0 && (
          <p className="text-white/40 text-sm text-center mt-8">Пока никого нет</p>
        )}
      </div>

      <AppFooter />
      <PostEditorWrapper />
    </>
  )
}

export default function ExplorePage() {
  return (
    <UploadProvider>
      <ExploreContent />
    </UploadProvider>
  )
}