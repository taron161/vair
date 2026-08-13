'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'

interface Message {
  id: string
  senderId: string
  receiverId: string
  text: string
  createdAt: string
}

interface UserData {
  id: string
  email?: string
}

interface Receiver {
  userId: string
  handle: string
  displayName?: string | null
  avatarUrl?: string | null
}

function ChatContent() {
  const params = useParams()
  const handle = params?.handle as string

  const [user, setUser] = useState<UserData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [receiver, setReceiver] = useState<Receiver | null>(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const sortMessages = (msgs: Message[]) => {
    return [...msgs].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      if (timeA !== timeB) return timeA - timeB
      return a.id.localeCompare(b.id)
    })
  }

  const loadMessages = useCallback(async (userId: string, receiverId?: string) => {
    if (!receiverId) return

    const { data } = await supabase
      .from('Message')
      .select('*')
      .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
      .order('createdAt', { ascending: true })

    const filtered = (data || []).filter(
      (msg: Message) =>
        (msg.senderId === userId && msg.receiverId === receiverId) ||
        (msg.senderId === receiverId && msg.receiverId === userId)
    )

    setMessages(sortMessages(filtered))
    setLoading(false)
    scrollToBottom()
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('Profile')
        .select('userId, handle, displayName, avatarUrl')
        .eq('handle', handle)
        .single()

      if (profile) {
        setReceiver(profile)
        loadMessages(user.id, profile.userId)
      }
    })
  }, [handle, loadMessages, router])

  useEffect(() => {
    if (!user || !receiver) return

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Message',
          filter: `receiverId=eq.${user.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message

          if (newMessage.senderId === receiver.userId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMessage.id)) return prev
              return sortMessages([...prev, newMessage])
            })
            scrollToBottom()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, receiver])

  const sendMessage = async () => {
    if (!text.trim() || !user || !receiver) return

    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId: user.id,
      receiverId: receiver.userId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }

    setText('')

    await supabase.from('Message').insert({
      id: newMessage.id,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      text: newMessage.text,
      createdAt: newMessage.createdAt,
    })

    await loadMessages(user.id, receiver.userId)
  }

  if (loading) return null

  return (
    <>
      <AppHeader email={user?.email} />

      <div className="flex-1 flex flex-col pb-24">
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-400/30 flex items-center justify-center text-white text-sm font-bold">
            {receiver?.avatarUrl ? (
              <img src={receiver.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              (receiver?.displayName || handle).charAt(0).toUpperCase()
            )}
          </div>
          <p className="text-white font-medium">
            {receiver?.displayName || `@${handle}`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((message) => {
            const isMine = message.senderId === user?.id
            const time = new Date(message.createdAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div key={message.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                  isMine
                    ? 'bg-emerald-400 text-black rounded-br-sm'
                    : 'bg-zinc-700/50 text-white rounded-bl-sm'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
                <p className="text-[10px] mt-1 px-1 text-white/40">
                  {time}
                </p>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Сообщение..."
              className="flex-1 bg-white/5 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:bg-white/10"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!text.trim()}
              className="w-10 h-10 rounded-xl bg-emerald-400 text-black font-semibold flex items-center justify-center disabled:opacity-30"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      <AppFooter />
    </>
  )
}

export default function ChatPage() {
  return (
    <UploadProvider>
      <ChatContent />
    </UploadProvider>
  )
}