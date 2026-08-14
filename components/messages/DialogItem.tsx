'use client';

import Link from 'next/link';

interface Dialog {
  userId: string;
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface DialogItemProps {
  dialog: Dialog;
}

export default function DialogItem({ dialog }: DialogItemProps) {
  return (
    <Link
      href={`/messages/${dialog.handle}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-400/30 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {dialog.avatarUrl ? (
          <img src={dialog.avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          (dialog.displayName || dialog.handle).charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">
          {dialog.displayName || `@${dialog.handle}`}
        </p>
        {dialog.lastMessage && (
          <p className="text-white/40 text-xs truncate">{dialog.lastMessage}</p>
        )}
      </div>
    </Link>
  );
}