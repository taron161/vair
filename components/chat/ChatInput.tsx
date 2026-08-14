'use client';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
}

export default function ChatInput({ value, onChange, onSend }: ChatInputProps) {
  return (
    <div className="px-4 py-3 border-t border-white/10 flex-shrink-0 bg-zinc-700/50">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={onChange}
          placeholder="Сообщение..."
          className="flex-1 bg-white/5 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:bg-white/10"
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
        />
        <button
          onClick={onSend}
          disabled={!value.trim()}
          className="w-10 h-10 rounded-xl bg-emerald-400 text-black font-semibold flex items-center justify-center disabled:opacity-30"
        >
          ➤
        </button>
      </div>
    </div>
  )
}