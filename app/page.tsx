'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        router.replace('/feed')
      }
    })
  }, [])

  return <LoadingScreen />
}