'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { UploadProvider } from '@/lib/UploadContext'
import AppFooter from '@/components/AppFooter'
import MessageBubble from '@/components/chat/MessageBubble'
import DateDivider from '@/components/chat/DateDivider'
import ChatHeader from '@/components/chat/ChatHeader'
import ChatInput from '@/components/chat/ChatInput'
import ScrollDownButton from '@/components/chat/ScrollDownButton'

interface Message {
  id: string
  senderId: string
  receiverId: string
  text: string
  createdAt: string
  isRead: boolean
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
  const [showScrollDown, setShowScrollDown] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior }), 50)
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
    scrollToBottom('auto')
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
            scrollToBottom('smooth')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, receiver])

  useEffect(() => {
    const handleWindowScroll = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      setShowScrollDown(distanceFromBottom > 200)
    }

    window.addEventListener('scroll', handleWindowScroll)
    return () => window.removeEventListener('scroll', handleWindowScroll)
  }, [])

  const sendMessage = async () => {
    if (!text.trim() || !user || !receiver) return

    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId: user.id,
      receiverId: receiver.userId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    }

    setText('')

    await supabase.from('Message').insert({
      id: newMessage.id,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      text: newMessage.text,
      createdAt: newMessage.createdAt,
      isRead: false,
    })

    await loadMessages(user.id, receiver.userId)
  }

  const isSameDay = (date1: string, date2: string) => {
    return new Date(date1).toDateString() === new Date(date2).toDateString()
  }

  if (loading) return null

  return (
    <>
      <div className="flex-1 flex flex-col min-h-[calc(100vh-120px)] pb-16 relative">
        <ChatHeader receiver={receiver} handle={handle} />

        <div className="flex-1 px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/40 text-sm">Нет сообщений</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isMine = message.senderId === user?.id
              const showDate = index === 0 || !isSameDay(message.createdAt, messages[index - 1].createdAt)

              return (
                <div key={message.id}>
                  {showDate && <DateDivider dateStr={message.createdAt} />}
                  <MessageBubble message={message} isMine={isMine} />
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {showScrollDown && <ScrollDownButton onClick={() => scrollToBottom('smooth')} />}

        <ChatInput value={text} onChange={(e) => setText(e.target.value)} onSend={sendMessage} />
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