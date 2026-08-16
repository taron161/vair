'use client';

import { useState } from 'react';
import Link from 'next/link';
import PostItem from '@/components/PostItem';
import CommentsModal from '@/components/CommentsModal';
import PostDescription from '@/components/post/PostDescription';
import PostMenu from '@/components/post/PostMenu';
import PostActions from '@/components/post/PostActions';
import DeleteConfirmModal from '@/components/post/DeleteConfirmModal';
import LikersModal from '@/components/post/LikersModal';
import { usePostCard } from '@/hooks/usePostCard';

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

interface PostCardProps {
  post: Post;
  userId: string;
}

export default function PostCard({ post, userId }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
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
  } = usePostCard(post);

  const description = post.caption?.split('\n').filter(line => !line.trim().startsWith('#')).join('\n') || '';
  const hashtags = post.caption?.split(/\s+/).filter(word => word.startsWith('#')) || [];

  const handleDelete = async () => {
    setIsDeleting(true);
    await deletePost();
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    window.location.reload();
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
    <div className="rounded-2xl bg-zinc-800/30 overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b-2 border-[#18181b] bg-white/[0.02]">
        <div className="flex gap-3">
          {/* Кружок и дата под ним */}
          <div className="flex flex-col items-center flex-shrink-0">
            <Link href={`/${authorHandle || ''}`} className="block">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-400/30 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity">
                {authorAvatar ? (
                  <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  authorName?.charAt(0).toUpperCase() || '?'
                )}
              </div>
            </Link>
            <p className="text-white/30 text-[9px] mt-1 text-center leading-tight">{dateStr}</p>
            <p className="text-white/20 text-[8px] text-center leading-tight">{timeStr}</p>
          </div>

          {/* Имя и описание */}
          <div className="flex-1 min-w-0">
            <Link href={`/${authorHandle || ''}`} className="inline-block">
              <p className="text-white/50 text-xs mb-1 hover:text-white/80 transition-colors cursor-pointer">
                {authorName || 'Пользователь'}
              </p>
            </Link>

            {description && (
              <PostDescription
                description={description}
                hashtags={hashtags}
                expanded={expanded}
                truncatedDesc={truncatedDesc}
                visibleTags={visibleTags}
                hiddenTagsCount={hiddenTagsCount}
                onToggle={() => setExpanded(!expanded)}
              />
            )}
          </div>

          {currentUserId && currentUserId === post.userId && (
            <PostMenu
              menuOpen={menuOpen}
              onToggle={() => setMenuOpen(!menuOpen)}
              onEdit={() => {
                setMenuOpen(false);
                window.dispatchEvent(new CustomEvent('edit-post', { 
                  detail: { 
                    postId: post.id,
                    caption: post.caption,
                    media: post.media
                  } 
                }));
              }}
              onDelete={() => {
                setMenuOpen(false);
                setShowDeleteConfirm(true);
              }}
              isDeleting={isDeleting}
            />
          )}
        </div>
      </div>

      <PostItem post={post} />

      <PostActions
        liked={liked}
        likesCount={likesCount}
        commentsCount={commentsCount}
        onToggleLike={toggleLike}
        onShowComments={() => setShowComments(true)}
        onShowLikers={() => setShowLikers(true)}
      />

      {/* Кружки лайкнувших */}
      {likersAvatars.length > 0 && (
        <div className="flex items-center px-4 pb-3 -mt-2">
          {likersAvatars.map((avatar, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full overflow-hidden border-2 border-[#18181b]"
              style={{ marginLeft: index === 0 ? 0 : '-8px' }}
            >
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {showComments && (
        <CommentsModal
          postId={post.id}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentsCount((c) => c + 1)}
        />
      )}

      {showLikers && (
        <LikersModal postId={post.id} onClose={() => setShowLikers(false)} />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}