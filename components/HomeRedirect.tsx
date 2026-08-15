'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/login');
      } else {
        // Обновляем handle в localStorage при каждом заходе
        const { data: profile } = await supabase
          .from('Profile')
          .select('handle')
          .eq('userId', user.id)
          .single();

        if (profile?.handle) {
          localStorage.removeItem('userHandle');
          localStorage.setItem('userHandle', profile.handle);
          router.replace(`/${profile.handle}`);
        } else {
          router.replace('/feed');
        }
      }
    });
  }, [router]);

  return <LoadingScreen />;
}