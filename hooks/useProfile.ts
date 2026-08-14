'use client';

import { useEffect, useState } from 'react';
import { getProfileByUserId } from '@/lib/supabaseQueries';

interface Profile {
  id: string;
  userId: string;
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      const frame = requestAnimationFrame(() => setLoading(false));
      return () => cancelAnimationFrame(frame);
    }

    let cancelled = false;

    getProfileByUserId(userId).then((data) => {
      if (cancelled) return;
      setProfile(data);
      const frame = requestAnimationFrame(() => setLoading(false));
      return () => cancelAnimationFrame(frame);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, loading };
}