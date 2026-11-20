'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default'

/**
 * Toast function for programmatic toast creation
 * Usage: toast({ type: 'success', title: 'Success!', message: 'Operation completed' })
 */
export function toast(options: Omit<Toast, 'id'> & { id?: string }) {
  // This is a placeholder - in a real app you'd use a toast context or store
  // For now, we'll just log to console
  console.warn('toast() called but no toast context available:', options)
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ToastProps extends Toast {
  onClose: (id: string) => void
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-success-500" aria-hidden="true" />,
  error: <AlertCircle className="w-5 h-5 text-error-500" aria-hidden="true" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning-500" aria-hidden="true" />,
  info: <Info className="w-5 h-5 text-primary-500" aria-hidden="true" />,
  default: <Info className="w-5 h-5 text-secondary-500" aria-hidden="true" />,
}

const bgColors: Record<ToastType, string> = {
  success: 'bg-success-50 border-success-200',
  error: 'bg-error-50 border-error-200',
  warning: 'bg-warning-50 border-warning-200',
  info: 'bg-primary-50 border-primary-200',
  default: 'bg-secondary-50 border-secondary-200',
}

const ariaLiveMap: Record<ToastType, 'polite' | 'assertive'> = {
  success: 'polite',
  error: 'assertive',
  warning: 'assertive',
  info: 'polite',
  default: 'polite',
}

export function ToastItem({ id, type, title, message, duration = 5000, action, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(id), 200)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg',
        'animate-slide-in',
        isExiting && 'animate-slide-out',
        bgColors[type]
      )}
      role="alert"
      aria-live={ariaLiveMap[type]}
      aria-atomic="true"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-secondary-900">{title}</p>
        {message && <p className="mt-1 text-sm text-secondary-600">{message}</p>}
        {action && (
          <button
            onClick={() => {
              action.onClick()
              onClose(id)
            }}
            className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 underline"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => onClose(id), 200)
        }}
        className="flex-shrink-0 text-secondary-400 hover:text-secondary-600 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>
      <style jsx global>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-out {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
        .animate-slide-in { animation: slide-in 300ms ease-out; }
        .animate-slide-out { animation: slide-out 200ms ease-in; }
      `}</style>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 w-full max-w-sm"
      aria-live="polite"
      aria-label="Notifications"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}