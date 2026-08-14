'use client';

interface PostActionsProps {
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  onToggleLike: () => void;
  onShowComments: () => void;
}

export default function PostActions({ liked, likesCount, commentsCount, onToggleLike, onShowComments }: PostActionsProps) {
  return (
    <div className="px-4 py-3 flex items-center gap-5 border-t-2 border-emerald-400/30">
      <button
        onClick={onToggleLike}
        className={`flex items-center gap-1.5 text-lg transition-transform active:scale-90 cursor-pointer ${liked ? 'text-red-400' : 'text-white/50 hover:text-white/80'}`}
      >
        <span>{liked ? '❤️' : '🤍'}</span>
        <span className="text-sm">{likesCount}</span>
      </button>
      <button
        onClick={onShowComments}
        className="flex items-center gap-1.5 text-lg text-white/50 hover:text-blue-400 transition-colors cursor-pointer"
      >
        <span>💬</span>
        <span className="text-sm">{commentsCount}</span>
      </button>
      <button className="text-lg text-white/50 hover:text-emerald-400 transition-colors cursor-pointer">
        🔄
      </button>
    </div>
  );
}