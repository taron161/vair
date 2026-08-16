'use client';

interface BirthDateEditorProps {
  value: string;
  showToOthers: boolean;
  onChange: (value: string) => void;
  onToggleShow: (show: boolean) => void;
}

export default function BirthDateEditor({ value, showToOthers, onChange, onToggleShow }: BirthDateEditorProps) {
  return (
    <div className="mb-4">
      <p className="text-white/50 text-xs mb-2">Дата рождения</p>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:bg-white/10"
      />
      <label className="flex items-center gap-2 mt-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!showToOthers}
          onChange={(e) => onToggleShow(!e.target.checked)}
          className="w-4 h-4 accent-emerald-400 cursor-pointer"
        />
        <span className="text-white/50 text-xs">Не показывать другим</span>
      </label>
    </div>
  );
}