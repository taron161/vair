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
    <header className="px-4 py-0.5 border-b border-white/15 bg-zinc-700/40 backdrop-blur-lg flex justify-between items-center flex-shrink-0 rounded-b-2xl shadow-lg shadow-black/20">
      <Link href="/" className="flex items-center -ml-2">
        <img
          src="/logo-192.png"
          alt="VAIR"
          className="w-12 h-12 object-contain"
        />
      </Link>

      <Link
        href="/profile"
        className="w-9 h-9 rounded-full overflow-hidden bg-emerald-400/40 flex items-center justify-center text-white text-base font-medium hover:bg-emerald-400/60 transition-colors"
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