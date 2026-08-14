'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  userId: string;
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

interface UserListItemProps {
  profile: Profile;
}

export default function UserListItem({ profile }: UserListItemProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5">
      <Link href={`/${profile.handle}`} className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-400/30 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.userId.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {profile.displayName || `@${profile.handle}`}
          </p>
          {profile.displayName && (
            <p className="text-white/40 text-xs truncate">@{profile.handle}</p>
          )}
        </div>
      </Link>

      <button
        onClick={() => router.push(`/messages/${profile.handle}`)}
        className="px-4 py-1.5 rounded-xl bg-emerald-400/20 text-emerald-300 text-xs font-medium hover:bg-emerald-400/30 transition-colors flex-shrink-0 cursor-pointer"
      >
        Написать
      </button>
    </div>
  );
}