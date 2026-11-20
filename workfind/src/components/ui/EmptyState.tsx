import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  className?: string
  illustration?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  illustration,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-4',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {illustration ? (
        <div className="mb-6" aria-hidden="true">
          {illustration}
        </div>
      ) : icon ? (
        <div
          className={cn(
            'mb-6 flex items-center justify-center w-16 h-16 rounded-2xl',
            'bg-secondary-100 text-secondary-500'
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <h3 className="text-xl font-semibold text-secondary-900 mb-2">{title}</h3>
      {description && (
        <p className="text-secondary-500 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function EmptySearchState({
  onClearFilters,
}: {
  onClearFilters?: () => void
}) {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      title="No results found"
      description="We couldn't find any matches for your search. Try adjusting your filters or search terms."
      action={onClearFilters ? {
        label: 'Clear all filters',
        onClick: onClearFilters,
        variant: 'outline',
      } : undefined}
    />
  )
}

export function EmptySavedState({
  onBrowseServices,
}: {
  onBrowseServices?: () => void
}) {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      }
      title="No saved providers yet"
      description="Start browsing services and save your favorite providers to see them here."
      action={onBrowseServices ? {
        label: 'Browse services',
        onClick: onBrowseServices,
      } : undefined}
    />
  )
}

export function EmptyMessagesState({
  onBrowseServices,
}: {
  onBrowseServices?: () => void
}) {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      }
      title="No messages yet"
      description="When you start conversations with service providers, they'll appear here."
      action={onBrowseServices ? {
        label: 'Find a provider',
        onClick: onBrowseServices,
      } : undefined}
    />
  )
}

export function EmptyDashboardState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={action ? { ...action, variant: 'primary' } : undefined}
    />
  )
}