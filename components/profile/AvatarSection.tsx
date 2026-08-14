'use client';

interface AvatarSectionProps {
  avatarUrl: string | null;
  displayName: string | null;
  email?: string;
}

export default function AvatarSection({ avatarUrl, displayName, email }: AvatarSectionProps) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-emerald-400/30 flex items-center justify-center text-white text-3xl font-bold mb-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Аватар" className="w-full h-full object-cover" />
        ) : (
          displayName?.charAt(0) || email?.charAt(0).toUpperCase() || '?'
        )}
      </div>

      {displayName && (
        <p className="text-white text-lg font-semibold mb-1">{displayName}</p>
      )}
      <p className="text-white/50 text-sm">{email}</p>
    </div>
  );
}