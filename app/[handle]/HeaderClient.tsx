'use client';

import AppHeader from '@/components/AppHeader';

export default function HeaderClient({ email }: { email?: string }) {
  return <AppHeader email={email} />;
}