'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, style, ...props }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      scrollTo: (options: ScrollToOptions) => {
        scrollRef.current?.scrollTo(options)
      },
      scrollTop: scrollRef.current?.scrollTop,
      scrollLeft: scrollRef.current?.scrollLeft,
    }))

    return (
      <div
        ref={scrollRef}
        className={cn(
          'overflow-auto',
          'scrollbar-thin',
          'scrollbar-track-transparent',
          'scrollbar-thumb-secondary-300',
          'hover:scrollbar-thumb-secondary-400',
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ScrollArea.displayName = 'ScrollArea'

export const ScrollBar = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, orientation = 'vertical', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center',
          orientation === 'vertical' ? 'w-2' : 'h-2',
          className
        )}
        {...props}
      />
    )
  }
)

ScrollBar.displayName = 'ScrollBar'

export const ScrollAreaViewport = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      />
    )
  }
)

ScrollAreaViewport.displayName = 'ScrollAreaViewport'