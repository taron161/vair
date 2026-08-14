'use client';

interface CommentInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  replyingTo: string | null;
  onCancelReply: () => void;
}

export default function CommentInput({ value, onChange, onSend, replyingTo, onCancelReply }: CommentInputProps) {
  return (
    <div className="px-4 py-3 border-t border-white/10">
      {replyingTo && (
        <p className="text-white/40 text-xs mb-1">
          Ответ для @{replyingTo.slice(0, 10)}
          <button
            onClick={onCancelReply}
            className="ml-2 text-red-400 cursor-pointer"
          >
            ✕
          </button>
        </p>
      )}
      <div className="flex gap-2">
        <input
          value={value}
          onChange={onChange}
          placeholder="Написать комментарий..."
          className="flex-1 bg-white/5 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:bg-white/10"
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
        />
        <button
          onClick={onSend}
          disabled={!value.trim()}
          className="text-emerald-400 text-sm font-semibold px-3 disabled:opacity-30 cursor-pointer"
        >
          Отпр.
        </button>
      </div>
    </div>
  );
}