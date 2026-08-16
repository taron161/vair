'use client';

import { useEffect } from 'react';
import { UploadProvider } from '@/lib/UploadContext';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import PostEditorWrapper from '@/components/PostEditorWrapper';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Глобальная проверка авторизации
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // Если не авторизован и не на логине — отправляем на логин
      if (!user && pathname !== '/login') {
        router.push('/login');
      }

      // Если авторизован и на логине — отправляем на главную
      if (user && pathname === '/login') {
        router.push('/feed');
      }
    };

    const timer = setTimeout(() => {
      checkAuth();
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, router]);

  return (
    <UploadProvider>
      <div className="flex justify-center min-h-screen">
        <div className="w-full max-w-[460px] bg-zinc-900 flex flex-col min-h-screen overflow-hidden">
          {pathname !== '/login' && <AppHeader />}
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <AppFooter />
          <PostEditorWrapper />
        </div>
      </div>
    </UploadProvider>
  );
}