'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Bell,
  BellOff,
  Check,
  X,
  Loader2,
  Mail,
  MessageSquare,
  DollarSign,
  Star,
  Shield,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Clock,
  MoreVertical,
  Trash2,
  Bell as BellIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Dropdown } from '@/components/ui/Dropdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Modal } from '@/components/ui/Modal'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Notification, NotificationType, Profile } from '@/types'

interface NotificationBellProps {
  userId: string
  className?: string
}

interface NotificationWithDetails extends Notification {
  actor?: Profile
  reference?: {
    id: string
    title?: string
    type: string
  }
}

const notificationTypeIcons: Record<NotificationType, React.ReactNode> = {
  new_enquiry: <Mail className="w-5 h-5" />,
  new_message: <MessageSquare className="w-5 h-5" />,
  new_quotation: <DollarSign className="w-5 h-5" />,
  quotation_accepted: <CheckCircle className="w-5 h-5 text-success-600" />,
  quotation_rejected: <X className="w-5 h-5 text-error-600" />,
  listing_approved: <CheckCircle className="w-5 h-5 text-success-600" />,
  listing_rejected: <X className="w-5 h-5 text-error-600" />,
  listing_suspended: <AlertCircle className="w-5 h-5 text-warning-600" />,
  review_received: <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />,
  account_suspended: <Shield className="w-5 h-5 text-error-600" />,
  account_reinstated: <Shield className="w-5 h-5 text-success-600" />,
  report_filed: <AlertCircle className="w-5 h-5 text-warning-600" />,
  report_resolved: <CheckCircle className="w-5 h-5 text-success-600" />,
}

const notificationTypeLabels: Record<NotificationType, string> = {
  new_enquiry: 'New Enquiry',
  new_message: 'New Message',
  new_quotation: 'New Quotation',
  quotation_accepted: 'Quotation Accepted',
  quotation_rejected: 'Quotation Rejected',
  listing_approved: 'Listing Approved',
  listing_rejected: 'Listing Rejected',
  listing_suspended: 'Listing Suspended',
  review_received: 'New Review',
  account_suspended: 'Account Suspended',
  account_reinstated: 'Account Reinstated',
  report_filed: 'Report Filed',
  report_resolved: 'Report Resolved',
}

export default function NotificationBell({ userId, className }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, notificationId: string | null }>({ open: false, notificationId: null })
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/notifications?user_id=${userId}&limit=50`)
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications/count?user_id=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch unread count')
      const data = await response.json()
      setUnreadCount(data.count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }, [userId])

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()

    // Subscribe to real-time notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setNotifications(prev =>
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          )
          if (updatedNotification.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotifications, fetchUnreadCount, userId, supabase])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })
      if (!response.ok) throw new Error('Failed to mark as read')

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })
      if (!response.ok) throw new Error('Failed to mark all as read')

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })
      if (!response.ok) throw new Error('Failed to delete notification')

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      const deleted = notifications.find(n => n.id === notificationId)
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const getNotificationActionUrl = (notification: NotificationWithDetails) => {
    if (!notification.reference_id) return null

    switch (notification.type) {
      case 'new_enquiry':
      case 'new_message':
        return `/dashboard/${notification.reference_type === 'provider' ? 'provider' : 'customer'}/messages?conversation=${notification.reference_id}`
      case 'new_quotation':
      case 'quotation_accepted':
      case 'quotation_rejected':
        return `/dashboard/customer/quotations?quotation=${notification.reference_id}`
      case 'listing_approved':
      case 'listing_rejected':
      case 'listing_suspended':
        return `/dashboard/provider/listings?listing=${notification.reference_id}`
      case 'review_received':
        return `/dashboard/provider/reviews?review=${notification.reference_id}`
      default:
        return null
    }
  }

  const handleNotificationClick = (notification: NotificationWithDetails) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id)
    }

    const url = getNotificationActionUrl(notification)
    if (url) {
      window.location.href = url
    }
    setIsOpen(false)
  }

  const unreadNotifications = notifications.filter(n => !n.is_read).length

  return (
    <div className={cn('relative', className)}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        {unreadCount > 0 ? (
          <Bell className="w-5 h-5 text-primary-600" />
        ) : (
          <BellOff className="w-5 h-5 text-secondary-500" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 w-96 lg:w-[400px] bg-white rounded-xl shadow-xl border border-secondary-200 z-50 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-primary-600 hover:text-primary-700"
                >
                  Mark all read
                </Button>
              )}
            </div>

            {/* List */}
            <ScrollArea className="max-h-[500px]">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState
                  title="No notifications"
                  description="You're all caught up!"
                  className="py-12"
                />
              ) : (
                <div className="divide-y divide-secondary-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 hover:bg-secondary-50 transition-colors cursor-pointer',
                        !notification.is_read && 'bg-primary-50/50'
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          !notification.is_read ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-500'
                        )}>
                          {notificationTypeIcons[notification.type as NotificationType] || <BellIcon className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              'font-medium text-secondary-900',
                              !notification.is_read && 'font-semibold'
                            )}>
                              {notificationTypeLabels[notification.type as NotificationType] || notification.type}
                            </p>
                            <span className="text-xs text-secondary-500 whitespace-nowrap">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-secondary-600 mt-1 line-clamp-2">{notification.message}</p>
                          {!notification.is_read && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="w-2 h-2 bg-primary-600 rounded-full" />
                              <span className="text-xs text-primary-600">Unread</span>
                            </div>
                          )}
                        </div>
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="icon" className="text-secondary-400 hover:text-secondary-600 p-1">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          }
                          items={[
                            !notification.is_read ? {
                              label: 'Mark as read',
                              icon: <Check className="w-4 h-4" />,
                              onClick: (e) => { e.stopPropagation(); handleMarkAsRead(notification.id) },
                            } : {
                              label: 'Mark as unread',
                              icon: <Clock className="w-4 h-4" />,
                              onClick: (e) => { e.stopPropagation(); /* TODO: implement mark unread */ },
                            },
                            { divider: true },
                            {
                              label: 'Delete',
                              icon: <Trash2 className="w-4 h-4" />,
                              danger: true,
                              onClick: (e) => { e.stopPropagation(); setDeleteConfirm({ open: true, notificationId: notification.id }) },
                            },
                          ]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-secondary-200">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = '/notifications'}
                >
                  View all notifications
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, notificationId: null })}
        title="Delete Notification"
        description="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        onConfirm={async () => {
          if (!deleteConfirm.notificationId) return
          await handleDelete(deleteConfirm.notificationId)
          setDeleteConfirm({ open: false, notificationId: null })
        }}
        confirmVariant="error"
      />
    </div>
  )
}