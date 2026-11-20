'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  MessageSquare,
  Mail,
  Phone,
  ChevronRight,
  X,
  Trash2,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Send,
  Loader2,
  MoreVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { formatCurrency } from '@/lib/utils'

interface ProviderMessagesPageProps {
  userId: string
}

interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  listing_id: string | null
  job_request_id: string | null
  other_participant: {
    id: string
    full_name: string
    avatar_url: string | null
    role: 'customer' | 'provider'
  }
  listing?: {
    id: string
    title: string
    main_image_url: string | null
  }
  job_request?: {
    id: string
    title: string
  }
  last_message: {
    content: string
    sender_id: string
    created_at: string
    message_type: string
  } | null
  unread_count: number
  updated_at: string
}

const sortOptions: SelectOption[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'unread', label: 'Unread First' },
]

export default function ProviderMessagesPage({ userId }: ProviderMessagesPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Array<{id: string, sender_id: string, content: string, created_at: string, message_type: string}>>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/provider/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/provider/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const handleConversationClick = (conversation: Conversation) => {
    setActiveConversation(conversation)
    fetchMessages(conversation.id)
    // Mark as read
    if (conversation.unread_count > 0) {
      setConversations(prev => prev.map(c =>
        c.id === conversation.id ? { ...c, unread_count: 0 } : c
      ))
    }
  }

  const handleSendMessage = async () => {
    if (!activeConversation || !newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const response = await fetch('/api/provider/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: activeConversation.id,
          content: newMessage,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        addToast('Message sent', 'success')
      } else {
        addToast('Failed to send message', 'error')
      }
    } catch (error) {
      addToast('Failed to send message', 'error')
    } finally {
      setIsSending(false)
    }
  }

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.other_participant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.listing?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.job_request?.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    switch (sortBy) {
      case 'unread':
        return b.unread_count - a.unread_count
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    }
  })

  const itemsPerPage = 15
  const totalPages = Math.ceil(sortedConversations.length / itemsPerPage)
  const paginatedConversations = sortedConversations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Messages</h1>
            <p className="text-secondary-600 mt-1">Communicate with your customers</p>
          </div>
          {totalUnread > 0 && (
            <Badge variant="primary" className="text-sm">
              <MessageSquare className="w-3 h-3 mr-1" />
              {totalUnread} unread
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations List */}
          <Card variant="outlined" className="lg:col-span-1 h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Conversations</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    placeholder="Sort"
                    options={sortOptions}
                    value={sortBy}
                    onChange={(value) => setSortBy(value)}
                    className="w-36"
                  />
                </div>
              </div>
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
              />
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="animate-pulse p-4 border-b border-secondary-100">
                      <div className="h-4 bg-secondary-200 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-secondary-200 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : paginatedConversations.length === 0 ? (
                <EmptyState
                  title="No conversations"
                  description={searchQuery ? 'Try adjusting your search.' : 'Start a conversation by replying to an enquiry or job request.'}
                  className="py-12"
                />
              ) : (
                <div className="divide-y divide-secondary-100">
                  {paginatedConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      className={`w-full p-4 text-left transition-colors ${
                        activeConversation?.id === conversation.id
                          ? 'bg-primary-50 border-r-2 border-primary-500'
                          : 'hover:bg-secondary-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={conversation.other_participant.avatar_url}
                          fallback={conversation.other_participant.full_name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-medium text-secondary-900 truncate">
                              {conversation.other_participant.full_name}
                            </p>
                            {conversation.unread_count > 0 && (
                              <Badge variant="primary" size="xs">{conversation.unread_count}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-secondary-600 truncate mb-1">
                            {conversation.last_message?.content || 'No messages yet'}
                          </p>
                          <p className="text-xs text-secondary-400">
                            {new Date(conversation.updated_at).toLocaleDateString('en-LK', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {(conversation.listing || conversation.job_request) && (
                            <p className="text-xs text-primary-600 mt-1 truncate">
                              {conversation.listing ? `Listing: ${conversation.listing.title}` : `Job: ${conversation.job_request?.title}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="p-4 border-t border-secondary-100">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedConversations.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    showTotal={false}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Conversation */}
          <Card variant="outlined" className="lg:col-span-3 flex flex-col h-[calc(100vh-200px)]">
            {activeConversation ? (
              <>
                <CardHeader className="pb-4 border-b border-secondary-100 flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={activeConversation.other_participant.avatar_url}
                      fallback={activeConversation.other_participant.full_name}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-secondary-900 truncate">
                          {activeConversation.other_participant.full_name}
                        </h3>
                        <Badge variant="secondary" size="xs">
                          {activeConversation.other_participant.role}
                        </Badge>
                      </div>
                      {(activeConversation.listing || activeConversation.job_request) && (
                        <p className="text-sm text-secondary-500 truncate">
                          {activeConversation.listing
                            ? `Regarding: ${activeConversation.listing.title}`
                            : `Regarding Job: ${activeConversation.job_request?.title}`}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveConversation(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-0">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" id="messages-container">
                      {messages.length === 0 ? (
                        <div className="text-center py-12 text-secondary-500">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-secondary-200" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${message.sender_id === userId ? 'flex-row-reverse' : ''}`}
                          >
                            <div
                              className={`max-w-[70%] flex flex-col ${
                                message.sender_id === userId ? 'items-end' : 'items-start'
                              }`}
                            >
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  message.sender_id === userId
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-white text-secondary-900 rounded-tl-none border border-secondary-200'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <p className={`text-xs text-secondary-400 mt-1 px-1 ${
                                message.sender_id === userId ? 'text-right' : ''
                              }`}>
                                {new Date(message.created_at).toLocaleTimeString('en-LK', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-4 border-t border-secondary-100 flex-shrink-0">
                      <div className="flex items-end gap-3">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          placeholder="Type a message..."
                          rows={1}
                          className="flex-1 px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                          style={{ minHeight: '48px', maxHeight: '150px' }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isSending}
                          size="lg"
                          className="h-12"
                        >
                          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                      </div>
                      <p className="text-xs text-secondary-400 text-center mt-2">
                        Press Enter to send, Shift+Enter for new line
                      </p>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-secondary-200" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">Select a conversation</h3>
                  <p className="text-secondary-500">Choose a conversation from the left to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}