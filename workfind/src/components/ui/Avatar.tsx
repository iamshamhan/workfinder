'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  shape?: 'circle' | 'square'
  className?: string
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  shape = 'circle',
  className,
}: AvatarProps) {
  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-xl',
  }

  const shapeStyles = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  }

  const [imageError, setImageError] = React.useState(false)

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt || fallback || ''}
        className={cn(sizeStyles[size], shapeStyles[shape], 'object-cover', className)}
        onError={() => setImageError(true)}
        aria-hidden={!alt && !fallback}
      />
    )
  }

  const initials = fallback
    ? fallback
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div
      className={cn(
        sizeStyles[size],
        shapeStyles[shape],
        'bg-primary-100 text-primary-700',
        'flex items-center justify-center font-medium',
        'select-none',
        className
      )}
      role="img"
      aria-label={alt || fallback || 'User avatar'}
    >
      {initials}
    </div>
  )
}

export function AvatarGroup({
  avatars,
  max = 5,
  overlap = true,
  className,
}: {
  avatars: Array<{ src?: string; alt?: string; fallback?: string }>
  max?: number
  overlap?: boolean
  className?: string
}) {
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  return (
    <div className={cn('flex', overlap ? '-space-x-2' : 'space-x-2', className)} aria-label={`${avatars.length} people`}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          fallback={avatar.fallback}
          size="sm"
          className={cn('border-2 border-white dark:border-secondary-900', 'ring-2 ring-white dark:ring-secondary-900', index === 0 ? 'z-10' : undefined)}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'w-8 h-8 text-xs',
            'bg-secondary-100 text-secondary-600',
            'flex items-center justify-center font-medium',
            'rounded-full border-2 border-white dark:border-secondary-900',
            'ring-2 ring-white dark:ring-secondary-900'
          )}
          role="img"
          aria-label={`${remainingCount} more people`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}