'use client';

import Link from 'next/link';

interface CommentWithProfile {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
  handle?: string;
  avatarUrl?: string;
  displayName?: string;
}

interface CommentItemProps {
  comment: CommentWithProfile;
  onClose: () => void;
  onReply: (comment: CommentWithProfile) => void;
}

export default function CommentItem({ comment, onClose, onReply }: CommentItemProps) {
  return (
    <div className="flex gap-3">
      <Link href={`/${comment.handle || ''}`} onClick={onClose}>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-400/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {comment.avatarUrl ? (
            <img src={comment.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            comment.userId.slice(0, 1).toUpperCase()
          )}
        </div>
      </Link>
      <div className="flex-1">
        <Link href={`/${comment.handle || ''}`} onClick={onClose}>
          <p className="text-white/50 text-xs mb-0.5 hover:text-white transition-colors cursor-pointer">
            {comment.displayName || `@${comment.handle}`}
          </p>
        </Link>
        <p className="text-white/90 text-sm">{comment.text}</p>
        <button
          onClick={() => onReply(comment)}
          className="text-white/40 text-xs mt-1 hover:text-white/70 transition-colors cursor-pointer"
        >
          Ответить
        </button>
      </div>
    </div>
  );
}