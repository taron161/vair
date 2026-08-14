'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import CommentItem from '@/components/comments/CommentItem';
import CommentInput from '@/components/comments/CommentInput';

interface CommentWithProfile {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
  handle?: string;
  avatarUrl?: string;
  displayName?: string;
}

interface CommentsModalProps {
  postId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export default function CommentsModal({ postId, onClose, onCommentAdded }: CommentsModalProps) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const loadComments = async () => {
      const { data: comments } = await supabase
        .from('Comment')
        .select('*')
        .eq('postId', postId)
        .order('createdAt', { ascending: true });

      if (comments) {
        const commentsWithProfiles = await Promise.all(
          comments.map(async (comment) => {
            const { data: profile } = await supabase
              .from('Profile')
              .select('handle, avatarUrl, displayName')
              .eq('userId', comment.userId)
              .single();
            return { ...comment, handle: profile?.handle, avatarUrl: profile?.avatarUrl, displayName: profile?.displayName };
          })
        );
        setComments(commentsWithProfiles);
      }
    };

    loadComments();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || '');
    });
  }, [postId]);

  const handleReply = (comment: CommentWithProfile) => {
    setReplyingTo(comment.userId);
    setText(`@${comment.displayName || comment.handle || comment.userId.slice(0, 10)}, `);
    inputRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    const { error } = await supabase.from('Comment').insert({
      id: crypto.randomUUID(),
      postId,
      userId: currentUserId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    });

    if (error) {
      console.error('Comment error:', error);
      return;
    }

    const { data: comments } = await supabase
      .from('Comment')
      .select('*')
      .eq('postId', postId)
      .order('createdAt', { ascending: true });

    if (comments) {
      const commentsWithProfiles = await Promise.all(
        comments.map(async (comment) => {
          const { data: profile } = await supabase
            .from('Profile')
            .select('handle, avatarUrl, displayName')
            .eq('userId', comment.userId)
            .single();
          return { ...comment, handle: profile?.handle, avatarUrl: profile?.avatarUrl, displayName: profile?.displayName };
        })
      );
      setComments(commentsWithProfiles);
    }

    setText('');
    setReplyingTo(null);
    onCommentAdded?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/90 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-[460px] bg-zinc-900 rounded-t-3xl flex flex-col h-[80vh]"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-semibold">Комментарии</h2>
            <button onClick={onClose} className="text-white/50 hover:text-white cursor-pointer">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {comments.length === 0 ? (
              <p className="text-white/50 text-sm text-center">Нет комментариев</p>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onClose={onClose}
                  onReply={handleReply}
                />
              ))
            )}
          </div>

          <CommentInput
            value={text}
            onChange={(e) => setText(e.target.value)}
            onSend={handleSubmit}
            replyingTo={replyingTo}
            onCancelReply={() => {
              setReplyingTo(null);
              setText('');
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}