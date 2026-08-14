'use client';

interface PostHeaderProps {
  authorAvatar: string | null;
  authorName: string | null;
  dateStr: string;
  timeStr: string;
}

export default function PostHeader({ authorAvatar, authorName, dateStr, timeStr }: PostHeaderProps) {
  return (
    <>
      <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-400/30 border-2 border-emerald-400/50 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {authorAvatar ? (
          <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
        ) : (
          authorName?.charAt(0).toUpperCase() || '?'
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white/50 text-xs mb-1">
          {authorName || 'Пользователь'}
        </p>

        <div className="mt-1">
          <p className="text-white/40 text-[11px]">{dateStr}</p>
          <p className="text-white/30 text-[10px]">{timeStr}</p>
        </div>
      </div>
    </>
  );
}