'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  likes_count?: number;
  comments_count?: number;
}

export function usePostCard(post: Post) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [likersAvatars, setLikersAvatars] = useState<string[]>([]);
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [authorHandle, setAuthorHandle] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || '';
      setCurrentUserId(currentUserId);

      if (currentUserId) {
        const { data: like } = await supabase
          .from('Like')
          .select('id')
          .eq('postId', post.id)
          .eq('userId', currentUserId)
          .maybeSingle();
        setLiked(!!like);
      }

      const { count: actualLikesCount } = await supabase
        .from('Like')
        .select('*', { count: 'exact', head: true })
        .eq('postId', post.id);

      if (actualLikesCount !== null && actualLikesCount !== undefined) {
        setLikesCount(actualLikesCount);
      }

      const { count: actualCommentsCount } = await supabase
        .from('Comment')
        .select('*', { count: 'exact', head: true })
        .eq('postId', post.id);

      if (actualCommentsCount !== null && actualCommentsCount !== undefined) {
        setCommentsCount(actualCommentsCount);
      }

      if (currentUserId) {
        const { data: follows } = await supabase
          .from('Follow')
          .select('followingId')
          .eq('followerId', currentUserId);

        const followingIds = follows?.map((f: { followingId: string }) => f.followingId) || [];

        if (followingIds.length > 0) {
          const { data: likesData } = await supabase
            .from('Like')
            .select('userId')
            .eq('postId', post.id);

          if (likesData) {
            const likerIds = likesData
              .map((l: { userId: string }) => l.userId)
              .filter((id: string) => followingIds.includes(id))
              .slice(0, 7);

            if (likerIds.length > 0) {
              const { data: profiles } = await supabase
                .from('Profile')
                .select('avatarUrlSmall, avatarUrl')
                .in('userId', likerIds);

              const avatars = (profiles || [])
                .map((p: { avatarUrlSmall?: string | null; avatarUrl?: string | null }) => p.avatarUrlSmall || p.avatarUrl)
                .filter(Boolean) as string[];
              setLikersAvatars(avatars);
            }
          }
        }
      }

      const { data: profile } = await supabase
        .from('Profile')
        .select('avatarUrl, displayName, handle')
        .eq('userId', post.userId)
        .single();
      if (profile) {
        setAuthorAvatar(profile.avatarUrl);
        setAuthorName(profile.displayName);
        setAuthorHandle(profile.handle);
      }
    };

    loadData();
  }, [post.id]);

  const toggleLike = async () => {
    if (!currentUserId) return;

    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));

    if (newLiked) {
      const { error } = await supabase.from('Like').insert({
        id: crypto.randomUUID(),
        postId: post.id,
        userId: currentUserId,
        createdAt: new Date().toISOString(),
      });
      if (error) {
        setLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
      }
    } else {
      const { error } = await supabase
        .from('Like')
        .delete()
        .eq('postId', post.id)
        .eq('userId', currentUserId);
      if (error) {
        setLiked(true);
        setLikesCount((c) => c + 1);
      }
    }
  };

  const deletePost = async () => {
    for (const media of post.media) {
      const urlParts = media.url.split('/');
      const filePath = urlParts.slice(-2).join('/');
      if (filePath) {
        await supabase.storage.from('photos').remove([filePath]);
      }
    }

    await supabase.from('Like').delete().eq('postId', post.id);
    await supabase.from('Comment').delete().eq('postId', post.id);
    await supabase.from('Media').delete().eq('postId', post.id);
    await supabase.from('Post').delete().eq('id', post.id);
  };

  return {
    liked,
    likesCount,
    commentsCount,
    likersAvatars,
    authorAvatar,
    authorName,
    authorHandle,
    currentUserId,
    toggleLike,
    deletePost,
    setCommentsCount,
  };
}