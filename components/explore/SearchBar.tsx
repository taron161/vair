'use client';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="px-4 mb-4">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Поиск пользователей..."
        className="w-full bg-white/5 text-white text-sm rounded-xl px-4 py-2.5 placeholder-white/30 focus:outline-none focus:bg-white/10"
      />
    </div>
  );
}