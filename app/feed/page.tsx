'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppFooter from '@/components/AppFooter'
import PostEditorWrapper from '@/components/PostEditorWrapper'
import PostListClient from '@/components/PostListClient'

interface UserData {
  id: string
  email?: string
}

interface Media {
  id: string
  url: string
  type: string
  order: number
  fullUrl?: string
}

interface Post {
  id: string
  caption: string | null
  createdAt: string
  media: Media[]
  userId?: string
  score?: number
}

interface LikeData {
  id: string
  postId: string
  userId: string
  createdAt: string
}

interface CommentData {
  id: string
  postId: string
  userId: string
  text: string
  createdAt: string
}

interface PostData {
  id: string
  userId: string
  caption: string | null
  createdAt: string
  updatedAt: string
}

function FeedContent() {
  const [user, setUser] = useState<UserData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadFeed = async (userId: string) => {
      const { data: follows } = await supabase
        .from('Follow')
        .select('followingId')
        .eq('followerId', userId);

      const followingIds = follows?.map((f: { followingId: string }) => f.followingId) || [];

      if (followingIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data: postsData } = await supabase
        .from('Post')
        .select('*')
        .in('userId', followingIds)
        .order('createdAt', { ascending: false });

      if (postsData) {
        const postsWithScore = await Promise.all(
          postsData.map(async (post: PostData) => {
            const { data: likes } = await supabase
              .from('Like')
              .select('*')
              .eq('postId', post.id);
            
            const likesCount = likes?.length || 0;

            const lastDayLikes = likes?.filter((l: LikeData) => {
              const likeDate = new Date(l.createdAt);
              const now = new Date();
              return now.getTime() - likeDate.getTime() < 24 * 60 * 60 * 1000;
            }).length || 0;

            const { data: comments } = await supabase
              .from('Comment')
              .select('*')
              .eq('postId', post.id);
            
            const commentsCount = comments?.length || 0;

            const lastDayComments = comments?.filter((c: CommentData) => {
              const commentDate = new Date(c.createdAt);
              const now = new Date();
              return now.getTime() - commentDate.getTime() < 24 * 60 * 60 * 1000;
            }).length || 0;

            const { data: media } = await supabase
              .from('Media')
              .select('*')
              .eq('postId', post.id)
              .order('order', { ascending: true });

            const postAge = Date.now() - new Date(post.createdAt).getTime();
            const ageHours = Math.max(1, postAge / (1000 * 60 * 60));
            
            const score = 
              (lastDayLikes * 10) + 
              (lastDayComments * 20) + 
              (likesCount / ageHours) + 
              (commentsCount / ageHours) +
              (1000 / ageHours);

            return {
              ...post,
              media: media || [],
              score,
            };
          })
        );

        postsWithScore.sort((a, b) => (b.score || 0) - (a.score || 0));
        setPosts(postsWithScore as Post[]);
      }
      setLoading(false);
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        loadFeed(user.id)
      }
    })
  }, [router])

  if (loading) return null

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-24 pt-4">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center h-full px-6">
            <div className="text-center">
              <p className="text-white text-lg mb-2">Лента пуста</p>
              <p className="text-white/50 text-sm">Подпишитесь на пользователей, чтобы видеть их посты</p>
            </div>
          </div>
        ) : (
          <PostListClient posts={posts} userId={user?.id || ''} />
        )}
      </div>
      <AppFooter />
      <PostEditorWrapper />
    </>
  )
}

export default function FeedPage() {
  return (
    <UploadProvider>
      <FeedContent />
    </UploadProvider>
  )
}