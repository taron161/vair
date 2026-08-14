'use client';

import UserListItem from './UserListItem';

interface Profile {
  id: string;
  userId: string;
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

interface UsersListProps {
  profiles: Profile[];
}

export default function UsersList({ profiles }: UsersListProps) {
  if (profiles.length === 0) {
    return (
      <p className="text-white/40 text-sm text-center mt-8">Пока никого нет</p>
    );
  }

  return (
    <div className="space-y-0">
      {profiles.map((profile) => (
        <UserListItem key={profile.id} profile={profile} />
      ))}
    </div>
  );
}