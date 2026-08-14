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

  const postsWithMedia: Post[] = posts
    ? await Promise.all(
        posts.map(async (post) => {
          const { data: media } = await supabase
            .from('Media')
            .select('*')
            .eq('postId', post.id)
            .order('order', { ascending: true });
          return { ...post, media: media || [] };
        })
      )
    : [];

  return { profile, posts: postsWithMedia };
}