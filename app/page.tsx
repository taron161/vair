'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import FanGallery from '@/components/FanGallery'

const demoPhotos = [
  { id: '1', url: '/photo/photo-1.jpg', caption: 'Золотой закат' },
  { id: '2', url: '/photo/photo-2.jpg', caption: 'Утренний город' },
  { id: '3', url: '/photo/photo-3.jpg', caption: 'Лесная тропа' },
  { id: '4', url: '/photo/photo-4.jpg', caption: 'Морской бриз' },
  { id: '5', url: '/photo/photo-5.jpg', caption: 'Ночные огни' },
]

export default function Home() {
  const [user, setUser] = useState<any>(null)
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
      <header className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">VAIR</h1>
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-sm">{user?.email}</span>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            className="text-red-400 text-sm hover:text-red-300 transition-colors"
          >
            Выйти
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <FanGallery photos={demoPhotos} />
      </div>

      <nav className="px-4 py-3 border-t border-white/10">
        <p className="text-white/50 text-sm text-center">🏠</p>
      </nav>
    </>
  )
}