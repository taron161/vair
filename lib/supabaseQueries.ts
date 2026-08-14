import { supabase } from '@/lib/supabase';

// Получить профиль по userId
export async function getProfileByUserId(userId: string) {
  const { data } = await supabase
    .from('Profile')
    .select('*')
    .eq('userId', userId)
    .single();
  return data;
}

// Получить профиль по handle
export async function getProfileByHandle(handle: string) {
  const { data } = await supabase
    .from('Profile')
    .select('*')
    .eq('handle', handle)
    .single();
  return data;
}

// Получить текущего пользователя
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Получить handle текущего пользователя
export async function getCurrentUserHandle() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from('Profile')
    .select('handle')
    .eq('userId', user.id)
    .single();

  return data?.handle || null;
}