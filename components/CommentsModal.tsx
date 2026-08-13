'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
            <button onClick={onClose} className="text-white/50 hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {comments.length === 0 ? (
              <p className="text-white/50 text-sm text-center">Нет комментариев</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Link href={`/${comment.handle || ''}`} onClick={onClose}>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-400/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {comment.avatarUrl ? (
                        <img src={comment.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        comment.userId.slice(0, 1).toUpperCase()
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/${comment.handle || ''}`} onClick={onClose}>
                      <p className="text-white/50 text-xs mb-0.5 hover:text-white transition-colors">
                        {comment.displayName || `@${comment.handle}`}
                      </p>
                    </Link>
                    <p className="text-white/90 text-sm">{comment.text}</p>
                    <button
                      onClick={() => handleReply(comment)}
                      className="text-white/40 text-xs mt-1 hover:text-white/70 transition-colors"
                    >
                      Ответить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-white/10">
            {replyingTo && (
              <p className="text-white/40 text-xs mb-1">
                Ответ для @{replyingTo.slice(0, 10)}
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setText('');
                  }}
                  className="ml-2 text-red-400"
                >
                  ✕
                </button>
              </p>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Написать комментарий..."
                className="flex-1 bg-white/5 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:bg-white/10"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="text-emerald-400 text-sm font-semibold px-3 disabled:opacity-30"
              >
                Отпр.
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}