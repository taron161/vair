'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        const { data: profile } = await supabase
          .from('Profile')
          .select('handle')
          .eq('userId', user.id)
          .single()

        if (profile) {
          router.replace(`/${profile.handle}`)
        } else {
          router.push('/login')
        }
      }
    })
  }, [])

  return <LoadingScreen />
}