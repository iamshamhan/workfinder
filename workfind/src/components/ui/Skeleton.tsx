import { cn } from '@/lib/utils'

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({ variant = 'text', width, height, className }: SkeletonProps) {
  const baseStyles = 'bg-secondary-200 animate-pulse rounded'

  const variantStyles = {
    text: 'h-4 rounded-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  }

  const sizeStyles = {
    text: { width: '100%', height: '1rem' },
    circular: { width: width || '2.5rem', height: height || '2.5rem' },
    rectangular: { width: width || '100%', height: height || '1rem' },
    card: { width: width || '100%', height: height || '12rem' },
  }

  const style = {
    ...sizeStyles[variant],
    width: typeof width === 'number' ? `${width}px` : width || sizeStyles[variant].width,
    height: typeof height === 'number' ? `${height}px` : height || sizeStyles[variant].height,
  }

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '60%' : '100%' } />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 p-6', className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width="3.5rem" height="3.5rem" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height="12rem" />
      <div className="flex items-center gap-2">
        <Skeleton variant="text" width="5rem" />
        <Skeleton variant="text" width="4rem" />
        <Skeleton variant="text" width="6rem" />
      </div>
    </div>
  )
}

export function SkeletonProviderCard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton variant="rectangular" height="12rem" width="100%" />
      <div className="space-y-3 px-2">
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="50%" />
        <div className="flex items-center gap-2">
          <Skeleton variant="text" width="6rem" />
          <Skeleton variant="text" width="5rem" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width="1.5rem" height="1.5rem" />
          <Skeleton variant="text" width="4rem" />
        </div>
      </div>
      <div className="flex gap-2 px-2">
        <Skeleton variant="rectangular" width="40%" height="2.5rem" />
        <Skeleton variant="rectangular" width="40%" height="2.5rem" />
      </div>
    </div>
  )
}