'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import FanGallery from '@/components/FanGallery'

interface Media {
  id: string
  url: string
  type: string
  order: number
}

interface Post {
  id: string
  caption: string | null
  createdAt: string
  media: Media[]
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const loadPosts = useCallback(async (userId: string) => {
    const { data: postsData } = await supabase
      .from('Post')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })

    if (postsData) {
      const postsWithMedia = await Promise.all(
        postsData.map(async (post) => {
          const { data: media } = await supabase
            .from('Media')
            .select('*')
            .eq('postId', post.id)
            .order('order', { ascending: true })
          return { ...post, media: media || [] }
        })
      )
      setPosts(postsWithMedia)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else {
        setUser(user)
        loadPosts(user.id)
      }
      setLoading(false)
    })
  }, [])

  const compressImage = async (file: File, maxWidth: number = 1200): Promise<File> => {
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
        }, 'image/jpeg', 0.8)
      }
      img.onerror = () => resolve(file)
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files.length || !user) return

    setUploading(true)

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      let file = files[i]

      if (file.type.startsWith('image/') && !file.type.includes('gif')) {
        file = await compressImage(file)
      }

      formData.append('files', file)
    }
    formData.append('userId', user.id)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      await loadPosts(user.id)
    }

    setUploading(false)
    e.target.value = ''
  }

  if (loading) return null

  return (
    <>
      <header className="px-4 py-3 border-b border-white/10 flex justify-between items-center flex-shrink-0">
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

      <div className="flex-1 overflow-y-auto pb-24">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center h-full px-6">
            <div className="text-center">
              <p className="text-white text-lg mb-2">У вас пока нет постов</p>
              <p className="text-white/50 text-sm mb-6">Поделитесь первым снимком!</p>
              <label className="inline-block px-6 py-3 rounded-xl bg-white text-black font-semibold cursor-pointer hover:bg-white/90 transition-colors">
                {uploading ? 'Загрузка...' : '📷 Создать пост'}
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {posts.map((post) => (
              <div key={post.id} className="border-b border-white/5 pb-4">
                {post.caption && (
                  <p className="text-white/80 text-sm px-4 py-2">{post.caption}</p>
                )}
                <FanGallery photos={post.media} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
        <div className="w-full max-w-[460px] bg-zinc-900/95 backdrop-blur-lg border-t border-white/10 px-4 py-2 flex items-center justify-between">
          <div className="w-10 h-10" />

          <label className="relative w-16 h-16 flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className="w-14 h-14 flex items-center justify-center">
              <svg viewBox="0 0 60 60" className="w-14 h-14">
                {[0, 1, 2, 3, 4].map((i) => {
                  const angle = (i - 2) * 14
                  return (
                    <rect
                      key={i}
                      x={22 + i * 2}
                      y={6}
                      width="12"
                      height="36"
                      rx="3"
                      fill="white"
                      opacity={0.15 + i * 0.12}
                      transform={`rotate(${angle}, 30, 42)`}
                    />
                  )
                })}
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-400/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold leading-none">+</span>
              </div>
            </div>
          </label>

          <div className="w-10 h-10" />
        </div>
      </div>
    </>
  )
}