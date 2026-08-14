'use client';

interface Receiver {
  userId: string
  handle: string
  displayName?: string | null
  avatarUrl?: string | null
}

interface ChatHeaderProps {
  receiver: Receiver | null;
  handle: string;
}

export default function ChatHeader({ receiver, handle }: ChatHeaderProps) {
  return (
    <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-400/30 flex items-center justify-center text-white text-sm font-bold">
        {receiver?.avatarUrl ? (
          <img src={receiver.avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          (receiver?.displayName || handle).charAt(0).toUpperCase()
        )}
      </div>
      <p className="text-white font-medium">
        {receiver?.displayName || `@${handle}`}
      </p>
    </div>
  )
}