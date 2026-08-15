'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Follower {
  id?: string;
  userId: string;
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  avatarUrlSmall?: string | null;
}

interface FollowersModalProps {
  userId: string;
  onClose: () => void;
}

export default function FollowersModal({ userId, onClose }: FollowersModalProps) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  const randomColors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#818cf8', '#c084fc', '#f472b6'];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const loadFollowers = async () => {
      const { data: follows } = await supabase
        .from('Follow')
        .select('*')
        .eq('followingId', userId);

      if (follows) {
        const followersWithProfiles = await Promise.all(
          follows.map(async (follow) => {
            const { data: profile } = await supabase
              .from('Profile')
              .select('userId, handle, displayName, avatarUrl, avatarUrlSmall')
              .eq('userId', follow.followerId)
              .single();
            return profile;
          })
        );
        const validFollowers = followersWithProfiles.filter((f) => f !== null && f !== undefined) as Follower[];
        setFollowers(validFollowers);
      }
      setLoading(false);
    };

    const frame = requestAnimationFrame(() => {
      loadFollowers();
    });

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      cancelAnimationFrame(frame);
    };
  }, [userId]);

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
          className="w-full max-w-[460px] bg-zinc-900 rounded-t-3xl flex flex-col h-[70vh]"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-semibold">Подписчики</h2>
            <button onClick={onClose} className="text-white/50 hover:text-white cursor-pointer">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex-1 h-4 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            ) : followers.length === 0 ? (
              <p className="text-white/50 text-sm text-center mt-8">Нет подписчиков</p>
            ) : (
              <div className="space-y-0">
                {followers.map((follower, index) => (
                  <Link
                    key={follower.userId}
                    href={`/${follower.handle}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5"
                  >
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: follower.avatarUrl || follower.avatarUrlSmall ? undefined : randomColors[index % randomColors.length] }}
                    >
                      {follower.avatarUrl ? (
                        <img src={follower.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : follower.avatarUrlSmall ? (
                        <img src={follower.avatarUrlSmall} alt="" className="w-full h-full object-cover" />
                      ) : (
                        follower.displayName?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {follower.displayName || `@${follower.handle}`}
                      </p>
                      <p className="text-white/40 text-xs truncate">@{follower.handle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}