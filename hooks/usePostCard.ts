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
  likesCount?: number;
  commentsCount?: number;
}

export function usePostCard(post: Post) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
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

      // Получаем данные поста и автора через API
      const res = await fetch(`/api/get-post-data?postId=${post.id}&userId=${currentUserId}`, {
        method: 'GET',
      })

      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setLikesCount(data.likesCount)
        setCommentsCount(data.commentsCount)
        setLikersAvatars(data.likersAvatars || [])
        setAuthorAvatar(data.authorAvatar)
        setAuthorName(data.authorName)
        setAuthorHandle(data.authorHandle)
      }
    }

    loadData()
  }, [post.id])

  const toggleLike = async () => {
    if (!currentUserId) return

    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)))

    const res = await fetch('/api/toggle-like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, userId: currentUserId }),
    })

    if (!res.ok) {
      setLiked(!newLiked)
      setLikesCount((c) => (newLiked ? Math.max(0, c - 1) : c + 1))
    }
  }

  const deletePost = async () => {
    const res = await fetch('/api/delete-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id }),
    })

    if (!res.ok) {
      throw new Error('Delete failed')
    }
  }

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
  }
}