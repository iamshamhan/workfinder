'use client'

import { forwardRef, Fragment, ReactNode, KeyboardEvent as ReactKeyboardEvent, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      size = 'md',
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      className,
    },
    ref
  ) => {
    if (!isOpen) return null

    const sizeStyles = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-4xl',
    }

    const modalRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)

    // Focus trap and restore focus on close
    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement as HTMLElement

        // Focus the modal or first focusable element
        setTimeout(() => {
          const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusableElements?.length) {
            focusableElements[0].focus()
          } else {
            modalRef.current?.focus()
          }
        }, 0)

        // Prevent body scroll
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
        // Restore focus to trigger element
        previousActiveElement.current?.focus()
      }

    return () => {
      document.body.style.overflow = ''
    }
    }, [isOpen])

    const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose()
        return
      }

      // Tab trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        onClose()
      }
    }

    return (
      <Fragment>
        <div
          className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
        <div
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 animate-slide-up"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
          onKeyDown={handleKeyDown}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            className={cn(
              'w-full bg-white rounded-2xl shadow-2xl',
              sizeStyles[size],
              'max-h-[90vh] overflow-hidden flex flex-col',
              className
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-6 border-b border-secondary-100">
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-lg font-semibold text-secondary-900">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="modal-description" className="mt-1 text-sm text-secondary-500">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </Button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 200ms ease-out; }
          .animate-slide-up { animation: slide-up 200ms ease-out; }
        `}</style>
      </Fragment>
    )
  }
)

Modal.displayName = 'Modal'

export interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <div
    className={cn(
      'flex items-center justify-end gap-3 p-6 border-t border-secondary-100',
      className
    )}
  >
    {children}
  </div>
)