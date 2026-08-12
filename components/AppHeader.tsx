'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  email?: string;
}

export default function AppHeader({ email }: AppHeaderProps) {
  const router = useRouter();

  return (
    <header className="px-4 py-3 border-b border-white/10 flex justify-between items-center flex-shrink-0">
      <h1 className="text-white text-xl font-bold">VAIR</h1>
      <div className="flex items-center gap-3">
        <span className="text-white/50 text-sm">{email}</span>
        <button
          onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
          className="text-red-400 text-sm hover:text-red-300 transition-colors"
        >
          Выйти
        </button>
      </div>
    </header>
  );
}