'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send,
  Paperclip,
  Image,
  Smile,
  MoreVertical,
  ChevronLeft,
  Check,
  CheckCheck,
  Clock,
  Loader2,
  AlertCircle,
  Reply,
  Copy,
  Flag,
  Trash2,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Dropdown } from '@/components/ui/Dropdown'
import { Card, CardContent } from '@/components/ui/Card'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Skeleton } from '@/components/ui/Skeleton'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Message, MessageType, Profile } from '@/types'

interface MessageThreadProps {
  conversationId: string
  userId: string
  participant: Profile
  className?: string
}

interface MessageWithSender extends Message {
  sender: Profile
  is_optimistic?: boolean
}

export default function MessageThread({
  conversationId,
  userId,
  participant,
  className,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<MessageWithSender | null>(null)
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, messageId: string | null }>({ open: false, messageId: null })
  const [forwardModal, setForwardModal] = useState<{ open: boolean, message: MessageWithSender | null }>({ open: false, message: null })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/conversations/${conversationId}/messages?user_id=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessages(data.messages || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, userId])

  useEffect(() => {
    fetchMessages()

    // Mark messages as read when opening conversation
    fetch(`/api/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message
          // Fetch sender details
          const { data: sender } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', newMsg.sender_id)
            .single()

          if (sender) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMsg.id)) return prev
              return [...prev, { ...newMsg, sender: sender as Profile, is_optimistic: false }]
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Message
          setMessages(prev => prev.map(m =>
            m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m
          ))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchMessages, conversationId, userId, supabase])

  const sendMessage = async (content: string, type: MessageType = 'text', replyToId?: string) => {
    if (!content.trim() && type === 'text') return

    const optimisticMessage: MessageWithSender = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim(),
      message_type: type,
      read_at: null,
      created_at: new Date().toISOString(),
      sender: { id: userId, full_name: 'You', email: '' } as Profile,
      is_optimistic: true,
    }

    setMessages(prev => [...prev, optimisticMessage])
    setNewMessage('')
    setIsSending(true)
    setShowEmojiPicker(false)

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          content: content.trim(),
          message_type: type,
          reply_to_id: replyToId,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      // Replace optimistic message with real one
      setMessages(prev =>
        prev.map(m => m.id === optimisticMessage.id ? { ...data.message, is_optimistic: false } : m)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
      addToast('Failed to send message. Please try again.', 'error')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (newMessage.trim()) {
        sendMessage(newMessage, 'text', replyingTo?.id)
        setReplyingTo(null)
      }
    }
  }

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffHours < 24) {
      return format(date, 'HH:mm')
    } else if (diffHours < 48) {
      return `Yesterday ${format(date, 'HH:mm')}`
    } else {
      return format(date, 'MMM d, HH:mm')
    }
  }

  const groupMessagesByDate = (messages: MessageWithSender[]) => {
    const groups: Record<string, MessageWithSender[]> = {}

    messages.forEach(msg => {
      const date = new Date(msg.created_at)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      let label: string
      if (diffDays === 0) label = 'Today'
      else if (diffDays === 1) label = 'Yesterday'
      else label = format(date, 'MMMM d, yyyy')

      if (!groups[label]) groups[label] = []
      groups[label].push(msg)
    })

    return Object.entries(groups).map(([date, msgs]) => ({ date, messages: msgs }))
  }

  const groupedMessages = groupMessagesByDate(messages)

  const getMessageStatus = (message: MessageWithSender) => {
    if (message.is_optimistic) return <Clock className="w-4 h-4 text-secondary-400" />
    if (message.read_at) return <CheckCheck className="w-4 h-4 text-primary-600" />
    return <Check className="w-4 h-4 text-secondary-400" />
  }

  const renderMessageContent = (message: MessageWithSender) => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="relative">
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-xs rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.content, '_blank')}
            />
          </div>
        )
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl border border-secondary-200">
            <Download className="w-6 h-6 text-secondary-500" />
            <div>
              <p className="font-medium text-secondary-900">{message.content}</p>
              <p className="text-sm text-secondary-500">Tap to download</p>
            </div>
          </div>
        )
      case 'system':
        return (
          <p className="text-xs text-secondary-500 text-center py-2">{message.content}</p>
        )
      default:
        return (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )
    }
  }

  const isOwnMessage = (message: MessageWithSender) => message.sender_id === userId

  if (error && messages.length === 0) {
    return (
      <Card variant="outlined" className={cn('flex-1 flex flex-col', className)}>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600">{error}</p>
            <Button variant="outline" onClick={fetchMessages} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="outlined" className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Avatar
          src={participant.avatar_url || participant.business_logo_url}
          fallback={participant.full_name || participant.business_name || 'Unknown'}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-secondary-900 truncate">
            {participant.full_name || participant.business_name || 'Unknown'}
          </h2>
          <p className="text-xs text-secondary-500">
            {participant.verification_status === 'verified' && (
              <Badge variant="primary" className="gap-1 text-xs">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                Verified
              </Badge>
            )}
            {participant.district && participant.city && (
              <span className="ml-2">{participant.city}, {participant.district}</span>
            )}
          </p>
        </div>
        <Dropdown
          trigger={
            <Button variant="ghost" size="icon" className="text-secondary-400 hover:text-secondary-600">
              <MoreVertical className="w-5 h-5" />
            </Button>
          }
          items={[
            { label: 'View profile', icon: <MoreVertical className="w-4 h-4" />, onClick: () => {} },
            { label: 'Search in conversation', icon: <MoreVertical className="w-4 h-4" />, onClick: () => {} },
            { divider: true },
            { label: 'Mute notifications', icon: <MoreVertical className="w-4 h-4" />, onClick: () => {} },
            { label: 'Block user', icon: <MoreVertical className="w-4 h-4" />, danger: true, onClick: () => {} },
            { label: 'Report', icon: <Flag className="w-4 h-4" />, danger: true, onClick: () => {} },
          ]}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden relative">
        {isLoading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="h-full" ref={messagesContainerRef}>
            <div className="p-4 space-y-6" ref={messagesContainerRef}>
              {groupedMessages.map(({ date, messages: dateMessages }) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs text-secondary-500">
                    <span className="px-3 py-1 bg-secondary-100 rounded-full">{date}</span>
                  </div>
                  {dateMessages.map((message, index) => {
                    const isOwn = isOwnMessage(message)
                    const showAvatar = index === dateMessages.length - 1 ||
                      dateMessages[index + 1]?.sender_id !== message.sender_id
                    const showTail = index === 0 ||
                      dateMessages[index - 1]?.sender_id !== message.sender_id

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          'flex gap-2 max-w-[75%]',
                          isOwn && 'flex-row-reverse ml-auto',
                          !isOwn && 'mr-auto'
                        )}
                      >
                        {!isOwn && showAvatar && (
                          <Avatar
                            src={participant.avatar_url || participant.business_logo_url}
                            fallback={participant.full_name || participant.business_name || 'Unknown'}
                            size="sm"
                            className={cn('flex-shrink-0 mt-1', !showTail && 'opacity-0')}
                          />
                        )}
                        <div className={cn(
                          'flex flex-col gap-1',
                          isOwn && 'items-end',
                          !isOwn && 'items-start'
                        )}>
                          {!isOwn && showTail && (
                            <p className="text-xs text-secondary-500 ml-1">
                              {message.sender?.full_name || 'Unknown'}
                            </p>
                          )}
                          <div
                            className={cn(
                              'relative px-4 py-2 rounded-2xl',
                              isOwn
                                ? 'bg-primary-600 text-white rounded-tr-sm'
                                : 'bg-white text-secondary-900 border border-secondary-200 rounded-tl-sm shadow-sm'
                            )}
                          >
                            {replyingTo?.id === message.id && (
                              <div className="mb-2 p-2 bg-secondary-100 rounded-lg border-l-2 border-primary-500 text-xs text-secondary-600">
                                Replying to {replyingTo.sender_id === userId ? 'your' : 'their'} message
                                <Button variant="ghost" size="xs" onClick={() => setReplyingTo(null)} className="ml-2 p-0">
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                            {message.reply_to_id && (
                              <div className="mb-2 p-2 bg-secondary-100 rounded-lg border-l-2 border-secondary-400 text-xs text-secondary-600">
                                <span className="font-medium">
                                  {message.reply_to_sender_id === userId ? 'You' : 'They'}
                                </span> replied:
                                <p className="truncate max-w-xs">{message.reply_to_content}</p>
                              </div>
                            )}
                            {renderMessageContent(message)}
                            <div className={cn(
                              'flex items-center gap-1 mt-1',
                              isOwn ? 'justify-end' : 'justify-start'
                            )}>
                              <span className={cn(
                                'text-xs',
                                isOwn ? 'text-primary-100' : 'text-secondary-400'
                              )}>
                                {formatMessageTime(message.created_at)}
                              </span>
                              {isOwn && getMessageStatus(message)}
                            </div>
                          </div>
                          {showAvatar && (
                            <Dropdown
                              trigger={
                                <Button variant="ghost" size="xs" className="p-1 text-secondary-400 hover:text-secondary-600">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              }
                              items={[
                                { label: 'Reply', icon: <Reply className="w-4 h-4" />, onClick: () => setReplyingTo(message) },
                                { label: 'Copy', icon: <Copy className="w-4 h-4" />, onClick: () => { navigator.clipboard.writeText(message.content); addToast('Copied to clipboard', 'success') } },
                                { label: 'Forward', icon: <MoreVertical className="w-4 h-4" />, onClick: () => setForwardModal({ open: true, message }) },
                                { divider: true },
                                { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => setDeleteConfirm({ open: true, messageId: message.id }) },
                              ]}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-secondary-200 bg-secondary-50">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <div className="flex gap-1 p-1 border border-secondary-200 rounded-xl bg-white">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus:ring-0 py-2 px-3"
                disabled={isSending}
                maxLength={4000}
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-secondary-500 hover:text-secondary-700"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-secondary-500 hover:text-secondary-700"
              >
                <Image className="w-5 h-5" />
              </Button>
            </div>
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white border border-secondary-200 rounded-xl shadow-lg z-10">
                <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
                  {['😀', '😂', '😍', '😭', '😎', '🤔', '👍', '👎', '🙏', '🎉', '🔥', '✨', '💯', '👏', '🤝', '💪', '🌟', '❤️', '💔', '😊', '😴', '🤷', '🤷‍♀️', '🤷‍♂️', '👀', '👋', '🤞', '✌️', '🤘', '🖖', '💅'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setNewMessage(prev => prev + emoji)}
                      className="text-2xl hover:scale-125 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={() => sendMessage(newMessage, 'text', replyingTo?.id)}
            disabled={!newMessage.trim() || isSending}
            size="lg"
            className="h-12 w-12 rounded-xl flex-shrink-0"
            rightIcon={isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            aria-label="Send message"
          />
        </div>
        <p className="text-xs text-secondary-500 text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, messageId: null })}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        onConfirm={async () => {
          if (!deleteConfirm.messageId) return
          try {
            const response = await fetch(`/api/messages/${deleteConfirm.messageId}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: userId }),
            })
            if (!response.ok) throw new Error('Failed to delete message')
            setMessages(prev => prev.filter(m => m.id !== deleteConfirm.messageId))
            addToast('Message deleted', 'success')
          } catch (err) {
            addToast('Failed to delete message', 'error')
          } finally {
            setDeleteConfirm({ open: false, messageId: null })
          }
        }}
        confirmVariant="error"
      />

      {/* Forward Modal */}
      <Modal
        isOpen={forwardModal.open}
        onClose={() => setForwardModal({ open: false, message: null })}
        title="Forward Message"
        description="Select a conversation to forward this message to."
        confirmText="Forward"
        onConfirm={async () => {
          // TODO: Implement forward logic
          addToast('Forward feature coming soon', 'info')
          setForwardModal({ open: false, message: null })
        }}
      >
        <p className="text-secondary-600">Forward functionality will be implemented soon.</p>
      </Modal>
    </Card>
  )
}