'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import FollowersModal from '@/components/profile/FollowersModal';

interface Profile {
  id: string;
  userId: string;
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  avatarUrlSmall?: string | null;
  birthDate?: string | null;
  showBirthDate?: boolean;
  bio?: string | null;
  gender?: string | null;
}

interface ProfileHeaderProps {
  profile: Profile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [followersCount, setFollowersCount] = useState(0);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowedBack, setIsFollowedBack] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const router = useRouter();

  const randomColors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#818cf8', '#c084fc', '#f472b6'];
  const randomColor = randomColors[profile.userId.length % randomColors.length];

  useEffect(() => {
    const loadFollowStatus = async (userId: string) => {
      const { data: follow } = await supabase
        .from('Follow')
        .select('*')
        .eq('followerId', userId)
        .eq('followingId', profile.userId)
        .single();

      setIsFollowing(!!follow);

      const { data: followBack } = await supabase
        .from('Follow')
        .select('*')
        .eq('followerId', profile.userId)
        .eq('followingId', userId)
        .single();

      setIsFollowedBack(!!followBack);
    };

    const loadData = async () => {
      setLoadingFollowers(true);

      const { count } = await supabase
        .from('Follow')
        .select('*', { count: 'exact', head: true })
        .eq('followingId', profile.userId);
      setFollowersCount(count || 0);
      setLoadingFollowers(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const isOwn = user.id === profile.userId;
        setIsOwnProfile(isOwn);
        if (!isOwn) {
          await loadFollowStatus(user.id);
        }
      }
      setLoading(false);
    };

    const frame = requestAnimationFrame(() => {
      loadData();
    });

    return () => cancelAnimationFrame(frame);
  }, [profile.userId]);

  const handleFollow = async () => {
    if (!currentUserId) return;

    if (isFollowing) {
      await supabase
        .from('Follow')
        .delete()
        .eq('followerId', currentUserId)
        .eq('followingId', profile.userId);
      setIsFollowing(false);
      setFollowersCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from('Follow').insert({
        id: crypto.randomUUID(),
        followerId: currentUserId,
        followingId: profile.userId,
        createdAt: new Date().toISOString(),
      });
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
    }
  };

  const getFollowButtonText = () => {
    if (isFollowing && isFollowedBack) return 'Взаимная подписка';
    if (isFollowing) return 'Отписаться';
    return 'Подписаться';
  };

  const formatBirthDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="px-4 pt-4 pb-3 border-b-2 border-[#18181b]">
      <div className="flex items-start gap-4">
        {/* Аватар */}
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
          style={{ backgroundColor: profile.avatarUrl || profile.avatarUrlSmall ? undefined : randomColor }}
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : profile.avatarUrlSmall ? (
            <img src={profile.avatarUrlSmall} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.displayName?.charAt(0).toUpperCase() || '?'
          )}
        </div>

        {/* Информация */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-lg font-semibold truncate">
            {profile.displayName || `@${profile.handle}`}
          </p>
          <p className="text-white/40 text-xs mb-1">@{profile.handle}</p>

          {profile.showBirthDate !== false && formatBirthDate(profile.birthDate) && (
            <p className="text-white/50 text-xs mb-1">📅 {formatBirthDate(profile.birthDate)}</p>
          )}

          {loadingFollowers ? (
            <div className="w-24 h-3 bg-white/10 rounded animate-pulse" />
          ) : (
            <button
              onClick={() => setShowFollowers(true)}
              className="text-white/50 text-xs hover:text-white/80 transition-colors cursor-pointer"
            >
              <span className="font-semibold text-white">{followersCount}</span> подписчиков
            </button>
          )}

          {profile.bio && (
            <p className="text-white/70 text-sm mt-2">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-2 mt-3">
        {loading ? (
          <div className="flex-1 py-2 rounded-xl bg-white/5 animate-pulse" />
        ) : isOwnProfile ? (
          <button
            onClick={() => router.push('/profile')}
            className="flex-1 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
          >
            Редактировать профиль
          </button>
        ) : (
          <>
            <button
              onClick={handleFollow}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isFollowing
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-emerald-400 text-black hover:bg-emerald-300'
              }`}
            >
              {getFollowButtonText()}
            </button>
            <button
              onClick={() => router.push(`/messages/${profile.handle}`)}
              className="flex-1 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
            >
              Сообщение
            </button>
          </>
        )}
      </div>

      {showFollowers && (
        <FollowersModal
          userId={profile.userId}
          onClose={() => setShowFollowers(false)}
        />
      )}
    </div>
  );
}