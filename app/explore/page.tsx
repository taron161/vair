'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import PostEditorWrapper from '@/components/PostEditorWrapper'
import SearchBar from '@/components/explore/SearchBar'
import UsersList from '@/components/explore/UsersList'

interface UserData {
  id: string
  email?: string
}

interface Profile {
  id: string
  userId: string
  handle: string
  displayName?: string | null
  avatarUrl?: string | null
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
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <UsersList profiles={profiles} />
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