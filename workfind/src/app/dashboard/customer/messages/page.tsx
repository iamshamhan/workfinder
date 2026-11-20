'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ConversationList from '@/components/messaging/ConversationList'
import MessageThread from '@/components/messaging/MessageThread'
import { Profile, Conversation, Message } from '@/types'
import { Loader2, MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export default function CustomerMessagesPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation & { participant: Profile; last_message?: Message; unread_count: number } | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
      setIsLoadingUser(false)
    }
    fetchUser()
  }, [])

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="container py-8">
          <Card variant="outlined" padding="lg" className="max-w-md mx-auto text-center">
            <MessageSquare className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">Please log in</h2>
            <p className="text-secondary-600 mb-6">You need to be logged in to view your messages.</p>
            <a href="/auth/login?redirect=/dashboard/customer/messages" className="text-primary-600 hover:text-primary-700 font-medium">
              Log in
            </a>
          </Card>
        </div>
      </div>
    )
  }

  const handleConversationSelect = useCallback((conversation: Conversation & { participant: Profile; last_message?: Message; unread_count: number }) => {
    setSelectedConversation(conversation)
  }, [])

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Messages</h1>
            <p className="text-secondary-600 mt-1">Your conversations with service providers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
          {/* Conversation List - 1/3 width on lg, full on mobile */}
          <div className="lg:col-span-1">
            <ConversationList
              userId={userId}
              onConversationSelect={handleConversationSelect}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* Message Thread - 2/3 width on lg, full on mobile */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <MessageThread
                conversationId={selectedConversation.id}
                userId={userId}
                participant={selectedConversation.participant}
              />
            ) : (
              <Card variant="outlined" className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center p-8">
                  <EmptyState
                    title="Select a conversation"
                    description="Choose a conversation from the list to start messaging"
                    icon={<MessageSquare className="w-12 h-12 text-secondary-300" />}
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}