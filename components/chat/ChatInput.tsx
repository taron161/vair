'use client';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
}

export default function ChatInput({ value, onChange, onSend }: ChatInputProps) {
  return (
    <div className="px-4 py-3 flex-shrink-0">
      <div className="flex gap-2 items-center">
        <input
          value={value}
          onChange={onChange}
          placeholder="Сообщение..."
          className="flex-1 bg-white/5 text-white text-sm rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20 h-11"
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
        />
        <button
          onClick={onSend}
          disabled={!value.trim()}
          className="w-11 h-11 rounded-xl bg-emerald-400 text-black font-semibold flex items-center justify-center disabled:opacity-30 cursor-pointer"
        >
          ➤
        </button>
      </div>
    </div>
  );
}