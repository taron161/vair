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

export async function loadUserPosts(handle: string) {
  const { data: profile } = await supabase
    .from('Profile')
    .select('*')
    .eq('handle', handle)
    .single();

  if (!profile) return null;

  const { data: posts } = await supabase
    .from('Post')
    .select('*')
    .eq('userId', profile.userId)
    .order('createdAt', { ascending: false });

  if (!posts || posts.length === 0) {
    return { profile, posts: [] };
  }

  // Получаем все media одним запросом
  const postIds = posts.map((p: Post) => p.id);

  const { data: allMedia } = await supabase
    .from('Media')
    .select('*')
    .in('postId', postIds)
    .order('order', { ascending: true });

  // Группируем media по postId
  const mediaByPost = new Map<string, Media[]>();
  for (const media of allMedia || []) {
    if (!mediaByPost.has(media.postId)) {
      mediaByPost.set(media.postId, []);
    }
    mediaByPost.get(media.postId)!.push(media);
  }

  const postsWithMedia: Post[] = posts.map((post: Post) => ({
    ...post,
    media: mediaByPost.get(post.id) || [],
  }));

  return { profile, posts: postsWithMedia };
}