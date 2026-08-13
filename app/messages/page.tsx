'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import Link from 'next/link'

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
        {dialogs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/50 text-sm">Нет диалогов</p>
          </div>
        ) : (
          <div className="space-y-0">
            {dialogs.map((dialog) => (
              <Link
                key={dialog.userId}
                href={`/messages/${dialog.handle}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-400/30 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {dialog.avatarUrl ? (
                    <img src={dialog.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (dialog.displayName || dialog.handle).charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {dialog.displayName || `@${dialog.handle}`}
                  </p>
                  {dialog.lastMessage && (
                    <p className="text-white/40 text-xs truncate">{dialog.lastMessage}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
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