'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(true)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const toggleMode = () => {
    setIsRegister(!isRegister)
    setEmail('')
    setPassword('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setError('Этот email уже зарегистрирован. Войдите или используйте другой.')
        } else {
          setError(error.message)
        }
      } else if (data.user) {
        const handle = Math.random().toString().slice(2, 12)
        await supabase.from('Profile').insert({
          id: crypto.randomUUID(),
          userId: data.user.id,
          handle: handle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        localStorage.setItem('userHandle', handle)
        router.push('/')
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Неверный email или пароль')
        } else {
          setError(error.message)
        }
      } else if (data.user) {
        const { data: profile } = await supabase
          .from('Profile')
          .select('handle')
          .eq('userId', data.user.id)
          .single()
        
        if (profile?.handle) {
          localStorage.setItem('userHandle', profile.handle)
        }
        router.push('/')
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-20 bg-zinc-700/50">
      {/* Анимированный логотип */}
      <div className="flex justify-center mb-8">
        <div className="relative w-40 h-32">
          {/* Две карточки с увеличенным углом */}
          <motion.div
            className="absolute w-16 h-24 rounded-lg bg-[#18181b] z-0"
            style={{ left: '25%', top: '15%', transformOrigin: 'bottom center' }}
            animate={{ rotate: [-10, -10, -20, -20, -10, -10] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', times: [0, 0.3, 0.35, 0.65, 0.7, 1] }}
          />
          <motion.div
            className="absolute w-16 h-24 rounded-lg bg-[#18181b] z-0"
            style={{ right: '25%', top: '15%', transformOrigin: 'bottom center' }}
            animate={{ rotate: [10, 10, 20, 20, 10, 10] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', times: [0, 0.3, 0.35, 0.65, 0.7, 1], delay: 0.15 }}
          />

          {/* Веер и буква V поверх карточек */}
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            width="70"
            height="70"
            viewBox="0 0 70 70"
            fill="none"
          >
            <path d="M35 45 L10 12 Q35 5 60 12 Z" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" opacity="0.6"/>
            <path d="M35 45 L25 10" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
            <path d="M35 45 L45 10" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
            <path d="M35 42 L18 8" stroke="#34d399" strokeWidth="5" strokeLinecap="round"/>
            <path d="M35 42 L52 8" stroke="#34d399" strokeWidth="5" strokeLinecap="round"/>
          </svg>

          {/* Надпись VAIR */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-20">
            <span className="text-[#34d399] text-sm font-bold tracking-[4px]">VAIR</span>
          </div>
        </div>
      </div>

      {/* Форма */}
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-sm hover:text-white/80 transition-colors"
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors"
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
    </div>
  )
}