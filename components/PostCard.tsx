'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PostItem from '@/components/PostItem';
import CommentsModal from '@/components/CommentsModal';
import { supabase } from '@/lib/supabase';

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

interface PostCardProps {
  post: Post;
  userId: string;
}

interface Like {
  userId: string;
}

export default function PostCard({ post, userId }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);

  const description = post.caption?.split('\n').filter(line => !line.trim().startsWith('#')).join('\n') || '';
  const hashtags = post.caption?.split(/\s+/).filter(word => word.startsWith('#')) || [];

  useEffect(() => {
    const loadLikes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || '';

      const { data: likes } = await supabase
        .from('Like')
        .select('*')
        .eq('postId', post.id);

      setLikesCount(likes?.length || 0);
      setLiked(likes?.some((l: Like) => l.userId === currentUserId) || false);
    };

    const loadCommentsCount = async () => {
      const { count } = await supabase
        .from('Comment')
        .select('*', { count: 'exact', head: true })
        .eq('postId', post.id);
      setCommentsCount(count || 0);
    };

    const loadAuthor = async () => {
      const { data: profile } = await supabase
        .from('Profile')
        .select('avatarUrl, displayName')
        .eq('userId', post.userId)
        .single();
      if (profile) {
        setAuthorAvatar(profile.avatarUrl);
        setAuthorName(profile.displayName);
      }
    };

    loadLikes();
    loadCommentsCount();
    loadAuthor();
  }, [post.id]);

  const toggleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id || '';

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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
  };

  const truncatedDesc = truncateText(description, 50);
  const visibleTags = hashtags.slice(0, 5);
  const hiddenTagsCount = hashtags.length - 5;

  const postDate = new Date(post.createdAt);
  const dateStr = postDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = postDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="rounded-2xl bg-zinc-800/30 border border-white/5 overflow-hidden">
      {/* Блок с автором, описанием и тегами */}
      <div className="px-4 pt-3 pb-2 border-b-2 border-emerald-400/30 bg-white/[0.02]">
        <div className="flex gap-3">
          {/* Кружок автора с изумрудным бордером */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-400/30 border-2 border-emerald-400/50 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {authorAvatar ? (
              <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              authorName?.charAt(0).toUpperCase() || '?'
            )}
          </div>

          {/* Описание, теги, дата и время */}
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-xs mb-1">
              {authorName || 'Пользователь'}
            </p>
            
            {description && (
              <div
                onClick={() => setExpanded(!expanded)}
                className="cursor-pointer select-none transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: expanded ? '500px' : '60px',
                  overflow: 'hidden',
                }}
              >
                <p className="text-white/90 text-sm leading-relaxed mb-1">
                  {expanded ? description : truncatedDesc}
                </p>
                
                {hashtags.length > 0 && (
                  <p className="text-emerald-300 text-xs leading-relaxed break-words mb-1">
                    {(expanded ? hashtags : visibleTags).map((tag, i) => (
                      <span key={i} className="mr-1.5">
                        {tag}
                      </span>
                    ))}
                    {!expanded && hiddenTagsCount > 0 && (
                      <span className="text-white/50">... +{hiddenTagsCount}</span>
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="mt-1">
              <p className="text-white/40 text-[11px]">{dateStr}</p>
              <p className="text-white/30 text-[10px]">{timeStr}</p>
            </div>
          </div>
        </div>
      </div>

      <PostItem post={post} />

      {/* Действия */}
      <div className="px-4 py-3 flex items-center gap-5 border-t-2 border-emerald-400/30">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 text-lg transition-transform active:scale-90 ${liked ? 'text-red-400' : 'text-white/50 hover:text-white/80'}`}
        >
          <span>{liked ? '❤️' : '🤍'}</span>
          <span className="text-sm">{likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(true)}
          className="flex items-center gap-1.5 text-lg text-white/50 hover:text-blue-400 transition-colors"
        >
          <span>💬</span>
          <span className="text-sm">{commentsCount}</span>
        </button>
        <button className="text-lg text-white/50 hover:text-emerald-400 transition-colors">
          🔄
        </button>
      </div>

      {showComments && (
        <CommentsModal
          postId={post.id}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentsCount((c) => c + 1)}
        />
      )}
    </div>
  );
}