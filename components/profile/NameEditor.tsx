'use client';

interface NameEditorProps {
  editing: boolean;
  value: string;
  displayName: string | null;
  onChange: (value: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
}

export default function NameEditor({ editing, value, displayName, onChange, onStartEdit, onSave }: NameEditorProps) {
  if (editing) {
    return (
      <div className="flex items-center justify-center gap-2 mb-4">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Имя..."
          className="bg-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none"
          autoFocus
        />
        <button onClick={onSave} className="text-emerald-400 text-sm font-semibold cursor-pointer">
          ОК
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <p className={`text-lg font-semibold ${displayName ? 'text-white' : 'text-white/30'}`}>
        {displayName || 'Имя...'}
      </p>
      <button
        onClick={onStartEdit}
        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
      >
        ✏️
      </button>
    </div>
  );
}