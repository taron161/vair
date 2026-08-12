'use client';

import Link from 'next/link';

interface AppHeaderProps {
  email?: string;
}

export default function AppHeader({ email }: AppHeaderProps) {
  return (
    <header className="px-4 py-3 border-b border-white/10 flex justify-between items-center flex-shrink-0">
      <Link href="/" className="text-white text-xl font-bold">VAIR</Link>
      
      <Link
        href="/profile"
        className="w-8 h-8 rounded-full bg-emerald-400/30 flex items-center justify-center text-white text-sm font-medium hover:bg-emerald-400/50 transition-colors"
      >
        {email?.charAt(0).toUpperCase() || '?'}
      </Link>
    </header>
  );
}