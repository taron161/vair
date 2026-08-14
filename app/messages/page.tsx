'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import DialogList from '@/components/messages/DialogList'

interface UserData {
  id: string
  email?: string
}

interface Dialog {
  userId: string
  handle: string
  displayName?: string
  avatarUrl?: string
  lastMessage?: string
  lastMessageTime?: string
}

function MessagesContent() {
  const [user, setUser] = useState<UserData | null>(null)
  const [dialogs, setDialogs] = useState<Dialog[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadDialogs = useCallback(async (userId: string) => {
    const { data: messages } = await supabase
      .from('Message')
      .select('*')
      .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
      .order('createdAt', { ascending: false })

    if (messages) {
      const dialogMap = new Map<string, Dialog>()
      
      for (const msg of messages) {
        const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId
        
        if (!dialogMap.has(otherId)) {
          const { data: profile } = await supabase
            .from('Profile')
            .select('handle, displayName, avatarUrl')
            .eq('userId', otherId)
            .single()
          
          dialogMap.set(otherId, {
            userId: otherId,
            handle: profile?.handle || '',
            displayName: profile?.displayName,
            avatarUrl: profile?.avatarUrl,
            lastMessage: msg.text,
            lastMessageTime: msg.createdAt,
          })
        }
      }
      
      setDialogs(Array.from(dialogMap.values()))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else {
        setUser(user)
        loadDialogs(user.id)
      }
    })
  }, [loadDialogs, router])

  if (loading) return null

  return (
    <>
      <AppHeader email={user?.email} />
      <div className="flex-1 overflow-y-auto pb-24">
        <DialogList dialogs={dialogs} />
      </div>
      <AppFooter />
    </>
  )
}

export default function MessagesPage() {
  return (
    <UploadProvider>
      <MessagesContent />
    </UploadProvider>
  )
}