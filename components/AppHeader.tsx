'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface AppHeaderProps {
  email?: string;
}

export default function AppHeader({ email }: AppHeaderProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from('Profile')
          .select('avatarUrl, displayName')
          .eq('userId', user.id)
          .single();
        if (profile?.avatarUrl) setAvatarUrl(profile.avatarUrl);
        if (profile?.displayName) setDisplayName(profile.displayName);
      }
    });
  }, []);

  return (
    <header className="px-4 py-1 border-b border-white/15 bg-zinc-700/50 flex justify-between items-center flex-shrink-0">
      <Link href="/" className="flex items-center -ml-2">
        <img
          src="/logo-192.png"
          alt="VAIR"
          className="w-16 h-16 object-contain"
        />
      </Link>

      <Link
        href="/profile"
        className="w-12 h-12 rounded-full overflow-hidden bg-emerald-400/40 flex items-center justify-center text-white text-lg font-medium hover:bg-emerald-400/60 transition-colors"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Аватар" className="w-full h-full object-cover" />
        ) : (
          displayName?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || '?'
        )}
      </Link>
    </header>
  );
}