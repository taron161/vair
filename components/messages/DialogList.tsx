'use client';

import DialogItem from './DialogItem';

interface Dialog {
  userId: string;
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface DialogListProps {
  dialogs: Dialog[];
}

export default function DialogList({ dialogs }: DialogListProps) {
  if (dialogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/50 text-sm">Нет диалогов</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {dialogs.map((dialog) => (
        <DialogItem key={dialog.userId} dialog={dialog} />
      ))}
    </div>
  );
}