'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import PostList from '@/components/PostList'
import EmptyState from '@/components/EmptyState'
import PostEditor from '@/components/PostEditor'
import LoadingScreen from '@/components/LoadingScreen'

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

interface UserData {
  id: string
  email?: string
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editorFiles, setEditorFiles] = useState<File[] | null>(null)
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
        if (!ctx) { resolve(file); return }
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return }
          resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }))
        }, 'image/jpeg', 0.8)
      }
      img.onerror = () => resolve(file)
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files.length) return
    setEditorFiles(Array.from(files))
    e.target.value = ''
  }

  const handleEditorSave = async (data: { media: File[]; coverIndex: number; caption: string; hashtags: string }) => {
    if (!user) return
    setUploading(true)
    setEditorFiles(null)

    const formData = new FormData()
    const orderedMedia = [...data.media]
    const cover = orderedMedia.splice(data.coverIndex, 1)
    const reordered = [...cover, ...orderedMedia]

    for (let i = 0; i < reordered.length; i++) {
      let file = reordered[i]
      if (file.type.startsWith('image/') && !file.type.includes('gif')) {
        file = await compressImage(file)
      }
      formData.append('files', file)
    }

    formData.append('userId', user.id)
    formData.append('caption', data.caption)
    formData.append('hashtags', data.hashtags)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (res.ok) await loadPosts(user.id)
    setUploading(false)
  }

  if (loading) return <LoadingScreen />

  return (
    <>
      <AppHeader email={user?.email} />

      <div className="flex-1 overflow-y-auto pb-24 pt-[30px]">
        {posts.length === 0 ? (
          <EmptyState uploading={uploading} onFileSelect={handleFileSelect} />
        ) : (
          <PostList posts={posts} />
        )}
      </div>

      <AppFooter uploading={uploading} onFileSelect={handleFileSelect} />

      {editorFiles && (
        <PostEditor
          files={editorFiles}
          onSave={handleEditorSave}
          onCancel={() => setEditorFiles(null)}
        />
      )}
    </>
  )
}