'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setError('Этот email уже зарегистрирован. Войдите или используйте другой.');
        } else {
          setError(error.message);
        }
      } else if (data.user) {
        const handle = Math.random().toString().slice(2, 12);
        await supabase.from('Profile').insert({
          id: crypto.randomUUID(),
          userId: data.user.id,
          handle: handle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Очищаем и записываем новый handle
        localStorage.removeItem('userHandle');
        localStorage.setItem('userHandle', handle);

        // Пытаемся автоматически войти
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError) {
          router.push(`/${handle}`);
        } else {
          setError('Аккаунт создан. Войдите.');
          setIsRegister(false);
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Неверный email или пароль');
        } else {
          setError(error.message);
        }
      } else if (data.user) {
        const { data: profile } = await supabase
          .from('Profile')
          .select('handle')
          .eq('userId', data.user.id)
          .single();

        if (profile?.handle) {
          localStorage.removeItem('userHandle');
          localStorage.setItem('userHandle', profile.handle);
          router.push(`/${profile.handle}`);
        } else {
          router.push('/feed');
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <h2 className="text-white text-2xl font-bold text-center">
        {isRegister ? 'Регистрация' : 'Вход'}
      </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-white/30"
        required
      />

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-white/30"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-sm hover:text-white/80 transition-colors cursor-pointer"
        >
          {showPassword ? '🙈' : '👁'}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors cursor-pointer"
      >
        {isRegister ? 'Зарегистрироваться' : 'Войти'}
      </button>

      <p
        onClick={toggleMode}
        className="text-white/50 text-sm text-center cursor-pointer hover:text-white/80 transition-colors"
      >
        {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </p>
    </form>
  );
}