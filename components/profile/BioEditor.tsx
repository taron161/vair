'use client';

interface BioEditorProps {
  value: string;
  originalValue: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

export default function BioEditor({ value, originalValue, onChange, onSave }: BioEditorProps) {
  return (
    <div className="mb-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="О себе..."
        maxLength={200}
        rows={4}
        className="w-full bg-white/5 text-white text-sm rounded-xl px-4 py-3 resize-none focus:outline-none focus:bg-white/10 placeholder-white/30"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={onSave}
          disabled={value.trim() === originalValue.trim()}
          className="px-4 py-1.5 rounded-lg bg-emerald-400 text-black text-sm font-semibold hover:bg-emerald-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}