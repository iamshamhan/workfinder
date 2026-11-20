'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  href?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      href,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium transition-all duration-150 ease-out
      rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      whitespace-nowrap
    `

    const variantStyles = {
      primary: `
        bg-primary-600 text-white
        hover:bg-primary-700 active:bg-primary-800
        focus-visible:ring-primary-500
        shadow-sm hover:shadow-md
      `,
      secondary: `
        bg-secondary-100 text-secondary-900
        hover:bg-secondary-200 active:bg-secondary-300
        focus-visible:ring-secondary-500
        border border-secondary-200
      `,
      outline: `
        bg-transparent text-primary-600
        hover:bg-primary-50 active:bg-primary-100
        focus-visible:ring-primary-500
        border border-primary-300
      `,
      ghost: `
        bg-transparent text-secondary-700
        hover:bg-secondary-100 active:bg-secondary-200
        focus-visible:ring-secondary-500
      `,
      destructive: `
        bg-error-600 text-white
        hover:bg-error-700 active:bg-error-800
        focus-visible:ring-error-500
        shadow-sm hover:shadow-md
      `,
      success: `
        bg-success-600 text-white
        hover:bg-success-700 active:bg-success-800
        focus-visible:ring-success-500
        shadow-sm hover:shadow-md
      `,
    }

    const sizeStyles = {
      xs: 'px-2.5 py-1.5 text-xs gap-1 min-h-[32px]',
      sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[36px]',
      md: 'px-4 py-2 text-base gap-2 min-h-[40px]',
      lg: 'px-6 py-3 text-lg gap-2 min-h-[48px]',
      xl: 'px-8 py-4 text-xl gap-2.5 min-h-[56px]',
    }

    const widthStyles = fullWidth ? 'w-full' : ''
    const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], widthStyles, className)
    const content = isLoading ? (
      <>
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </>
    ) : (
      <>
        {leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
      </>
    )

    if (href) {
      return (
        <Link href={href} className={classes} aria-disabled={disabled || isLoading}>
          {content}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'