'use client';

interface GenderSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function GenderSelect({ value, onChange }: GenderSelectProps) {
  return (
    <div className="mb-4">
      <p className="text-white/50 text-xs mb-2">Пол</p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white/5 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:bg-white/10 cursor-pointer border-none outline-none"
        >
          <option value="" className="bg-zinc-800 text-white rounded-lg">Не указан</option>
          <option value="male" className="bg-zinc-800 text-white">Мужской</option>
          <option value="female" className="bg-zinc-800 text-white">Женский</option>
        </select>
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
        >
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}