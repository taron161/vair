'use client';

interface Message {
  id: string
  senderId: string
  receiverId: string
  text: string
  createdAt: string
  isRead: boolean
}

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
        isMine
          ? 'bg-emerald-400 text-black rounded-br-sm'
          : 'bg-zinc-700/50 text-white rounded-bl-sm'
      }`}>
        <p className="text-sm">{message.text}</p>
      </div>
      <div className="flex items-center gap-1 mt-1 px-1">
        <p className="text-[10px] text-white/40">{time}</p>
        {isMine && (
          <span className="inline-flex items-center text-emerald-300">
            {message.isRead ? (
              <>
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                  <path d="M2 7L6 11L14 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
                </svg>
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none" style={{ marginLeft: '-10px' }}>
                  <path d="M2 7L6 11L14 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </>
            ) : (
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                <path d="M2 7L6 11L14 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  )
}