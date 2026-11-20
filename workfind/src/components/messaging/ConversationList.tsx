'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  Search,
  ChevronRight,
  Clock,
  MoreVertical,
  X,
  Trash2,
  Archive,
  Pin,
  Bell,
  BellOff,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Dropdown } from '@/components/ui/Dropdown'
import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Conversation, Message, Profile } from '@/types'

interface ConversationWithDetails extends Conversation {
  participant: Profile
  last_message?: Message
  unread_count: number
}

interface ConversationListProps {
  userId: string
  className?: string
  onConversationSelect?: (conversation: ConversationWithDetails) => void
  selectedConversationId?: string
}

export default function ConversationList({
  userId,
  className,
  onConversationSelect,
  selectedConversationId,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/conversations?user_id=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch conversations')
      const data = await response.json()
      setConversations(data.conversations || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchConversations()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_1_id=eq.${userId},participant_2_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // New conversation created
            fetchConversations()
          } else if (payload.eventType === 'UPDATE') {
            // Conversation updated (last_message_at, etc.)
            fetchConversations()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=in.(${conversations.map(c => c.id).join(',')})`,
        },
        () => {
          // New message in any of our conversations
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchConversations, userId, conversations, supabase])

  const filteredConversations = conversations
    .filter(conv => {
      if (!searchQuery) return true
      const participantName = conv.participant?.full_name?.toLowerCase() || ''
      const lastMessage = conv.last_message?.content?.toLowerCase() || ''
      const businessName = conv.participant?.business_name?.toLowerCase() || ''
      return (
        participantName.includes(searchQuery.toLowerCase()) ||
        lastMessage.includes(searchQuery.toLowerCase()) ||
        businessName.includes(searchQuery.toLowerCase())
      )
    })
    .sort((a, b) => {
      // Pinned conversations first
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      // Then by last message time
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    })

  const handleConversationClick = (conversation: ConversationWithDetails) => {
    onConversationSelect?.(conversation)
  }

  const getParticipantDisplayName = (participant: Profile) => {
    return participant.full_name || participant.business_name || 'Unknown'
  }

  const getParticipantAvatar = (participant: Profile) => {
    return participant.avatar_url || participant.business_logo_url
  }

  if (error) {
    return (
      <Card variant="outlined" padding="lg" className={className}>
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-600">{error}</p>
          <Button variant="outline" onClick={fetchConversations} className="mt-4">
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="outlined" className={cn('flex flex-col h-full', className)}>
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-secondary-900">Messages</h2>
          {conversations.length > 0 && (
            <Badge variant="secondary" size="sm">
              {conversations.filter(c => c.unread_count > 0).length} unread
            </Badge>
          )}
        </div>
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No conversations found' : 'No messages yet'}
            description={searchQuery
              ? 'Try adjusting your search terms.'
              : 'Start a conversation by contacting a provider from their listing or profile.'}
            action={{
              label: searchQuery ? 'Clear search' : 'Browse Services',
              onClick: () => {
                if (searchQuery) setSearchQuery('')
                else window.location.href = '/browse'
              },
              variant: 'outline',
            }}
          />
        ) : (
          <div className="divide-y divide-secondary-100">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  'p-4 hover:bg-secondary-50 transition-colors cursor-pointer flex items-center gap-4',
                  selectedConversationId === conversation.id && 'bg-primary-50 border-l-4 border-primary-500'
                )}
                onClick={() => handleConversationClick(conversation)}
              >
                <Avatar
                  src={getParticipantAvatar(conversation.participant)}
                  fallback={getParticipantDisplayName(conversation.participant)}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-medium text-secondary-900 truncate">
                      {getParticipantDisplayName(conversation.participant)}
                    </h3>
                    <span className="text-xs text-secondary-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-secondary-600 truncate max-w-xs">
                      {conversation.last_message?.content || 'No messages yet'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {conversation.is_pinned && (
                        <Pin className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
                      )}
                      {conversation.is_archived && (
                        <Archive className="w-3.5 h-3.5 text-secondary-400" aria-hidden="true" />
                      )}
                      {conversation.unread_count > 0 && (
                        <Badge variant="primary" size="xs" className="w-5 h-5 p-0 flex items-center justify-center">
                          {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="icon" className="text-secondary-400 hover:text-secondary-600">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  }
                  items={[
                    {
                      label: conversation.is_pinned ? 'Unpin' : 'Pin conversation',
                      icon: conversation.is_pinned ? <Pin className="w-4 h-4" /> : <Pin className="w-4 h-4" />,
                      onClick: () => {
                        // TODO: Implement pin/unpin
                      },
                    },
                    {
                      label: conversation.is_archived ? 'Unarchive' : 'Archive',
                      icon: conversation.is_archived ? <Archive className="w-4 h-4" /> : <Archive className="w-4 h-4" />,
                      onClick: () => {
                        // TODO: Implement archive/unarchive
                      },
                    },
                    {
                      label: conversation.is_muted ? 'Unmute' : 'Mute',
                      icon: conversation.is_muted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />,
                      onClick: () => {
                        // TODO: Implement mute/unmute
                      },
                    },
                    { divider: true },
                    {
                      label: 'Delete conversation',
                      icon: <Trash2 className="w-4 h-4" />,
                      danger: true,
                      onClick: () => {
                        if (confirm('Are you sure you want to delete this conversation?')) {
                          // TODO: Implement delete
                        }
                      },
                    },
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}