'use client';

interface PostActionsProps {
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  onToggleLike: () => void;
  onShowComments: () => void;
  onShowLikers: () => void;
}

export default function PostActions({ liked, likesCount, commentsCount, onToggleLike, onShowComments, onShowLikers }: PostActionsProps) {
  const showLikersButton = likesCount > 0 && !(likesCount === 1 && liked);

  return (
    <div className="px-4 py-3 flex items-center gap-4 border-t-2 border-[#18181b]">
      <button
        onClick={onToggleLike}
        className={`flex items-center gap-1.5 text-lg transition-transform active:scale-90 cursor-pointer ${liked ? 'text-red-400' : 'text-white/50 hover:text-white/80'}`}
      >
        <span>{liked ? '❤️' : '🤍'}</span>
        <span className="text-sm">{likesCount}</span>
      </button>

      {showLikersButton && (
        <button
          onClick={onShowLikers}
          className="text-white/50 text-xs hover:text-white/80 transition-colors cursor-pointer"
        >
          Кто лайкнул?
        </button>
      )}

      <button
        onClick={onShowComments}
        className="flex items-center gap-1.5 text-lg text-white/50 hover:text-blue-400 transition-colors cursor-pointer"
      >
        <span>💬</span>
        <span className="text-sm">{commentsCount}</span>
      </button>

      <button className="ml-auto text-lg text-white/50 hover:text-emerald-400 transition-colors cursor-pointer">
        🔄
      </button>
    </div>
  );
}