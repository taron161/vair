import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Media {
  id: string;
  url: string;
  type: string;
  order: number;
  fullUrl?: string;
}

interface Post {
  id: string;
  caption: string | null;
  createdAt: string;
  media: Media[];
  userId?: string;
}

interface PostWithRelations {
  id: string;
  caption: string | null;
  createdAt: string;
  userId?: string;
  media: Media[];
}

export async function loadUserPosts(handle: string) {
  const { data: profile } = await supabase
    .from('Profile')
    .select('*')
    .eq('handle', handle)
    .single();

  if (!profile) return null;

  const { data: posts, error } = await supabase
    .from('Post')
    .select(`
      *,
      media:Media(*)
    `)
    .eq('userId', profile.userId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('loadUserPosts error:', error);
    return { profile, posts: [] };
  }

  const postsWithMedia: Post[] = (posts || []).map((post: PostWithRelations) => ({
    ...post,
    media: (post.media || []).sort((a, b) => a.order - b.order),
  }));

  return { profile, posts: postsWithMedia };
}