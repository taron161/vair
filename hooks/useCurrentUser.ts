'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/supabaseQueries';

interface UserData {
  id: string;
  email?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setUser({ id: user.id, email: user.email });
      }
      setLoading(false);
    });
  }, []);

  return { user, loading };
}