import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import AppFooter from '@/components/AppFooter'
import { UploadProvider } from '@/lib/UploadContext'
import PostEditorWrapper from '@/components/PostEditorWrapper'
import PostListClient from './PostListClient'
import HeaderClient from './HeaderClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  userId?: string
}

export default async function UserProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params

  const { data: profile } = await supabase
    .from('Profile')
    .select('*')
    .eq('handle', handle)
    .single()

  if (!profile) notFound()

  const { data: posts } = await supabase
    .from('Post')
    .select('*')
    .eq('userId', profile.userId)
    .order('createdAt', { ascending: false })

  const postsWithMedia: Post[] = posts
    ? await Promise.all(
        posts.map(async (post) => {
          const { data: media } = await supabase
            .from('Media')
            .select('*')
            .eq('postId', post.id)
            .order('order', { ascending: true })
          return { ...post, media: media || [] }
        })
      )
    : []

  return (
    <UploadProvider>
      <HeaderClient email={profile.displayName || undefined} />
      <div className="flex-1 overflow-y-auto pt-[30px] pb-24">
        {postsWithMedia.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/50 text-sm">Нет постов</p>
          </div>
        ) : (
          <PostListClient posts={postsWithMedia} userId={profile.userId} />
        )}
      </div>
      <AppFooter />
      <PostEditorWrapper />
    </UploadProvider>
  )
}