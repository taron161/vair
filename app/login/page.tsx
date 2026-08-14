'use client'

import AnimatedLogo from '@/components/auth/AnimatedLogo';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col px-6 pt-20 bg-zinc-700/50">
      <AnimatedLogo />
      <LoginForm />
    </div>
  );
}