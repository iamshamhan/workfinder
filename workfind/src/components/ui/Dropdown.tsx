'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-react'

export interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  danger?: boolean
}

export interface DropdownProps {
  trigger: React.ReactNode
  options: DropdownOption[]
  onSelect?: (value: string, option: DropdownOption) => void
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({
  trigger,
  options,
  onSelect,
  align = 'left',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const focusedIndexRef = useRef<number>(-1)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const enabledOptions = options.filter(o => !o.disabled)
      const enabledIndices = options.map((o, i) => !o.disabled ? i : -1).filter(i => i !== -1)

      if (enabledIndices.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          if (focusedIndexRef.current === -1) {
            focusedIndexRef.current = enabledIndices[0]
          } else {
            const currentEnabledIndex = enabledIndices.indexOf(focusedIndexRef.current)
            focusedIndexRef.current = enabledIndices[(currentEnabledIndex + 1) % enabledIndices.length]
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (focusedIndexRef.current === -1) {
            focusedIndexRef.current = enabledIndices[enabledIndices.length - 1]
          } else {
            const currentEnabledIndex = enabledIndices.indexOf(focusedIndexRef.current)
            focusedIndexRef.current = enabledIndices[(currentEnabledIndex - 1 + enabledIndices.length) % enabledIndices.length]
          }
          break
        case 'Home':
          e.preventDefault()
          focusedIndexRef.current = enabledIndices[0]
          break
        case 'End':
          e.preventDefault()
          focusedIndexRef.current = enabledIndices[enabledIndices.length - 1]
          break
        case 'Enter':
        case ' ':
          if (focusedIndexRef.current !== -1) {
            e.preventDefault()
            handleOptionClick(options[focusedIndexRef.current])
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          triggerRef.current?.focus()
          break
        case 'Tab':
          setIsOpen(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, options])

  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) return
    onSelect?.(option.value, option)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(true)
      focusedIndexRef.current = -1
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        className="inline-flex items-center"
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={cn(
              'absolute z-50 mt-1 min-w-[180px] bg-white rounded-lg shadow-lg border border-secondary-200',
              'py-1 animate-fade-in',
              align === 'right' ? 'right-0' : 'left-0'
            )}
            role="menu"
            aria-orientation="vertical"
          >
            {options.map((option, index) => {
              const isFocused = focusedIndexRef.current === index
              return (
                <button
                  key={option.value}
                  ref={isFocused ? (el: HTMLButtonElement | null) => { if (el) el.focus() } : undefined}
                  onClick={() => handleOptionClick(option)}
                  disabled={option.disabled}
                  role="menuitem"
                  tabIndex={isFocused ? 0 : -1}
                  className={cn(
                    'w-full px-4 py-2 text-sm flex items-center gap-2',
                    'transition-colors',
                    option.danger
                      ? 'text-error-600 hover:bg-error-50'
                      : 'text-secondary-700 hover:bg-secondary-50',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    isFocused && 'bg-primary-50 text-primary-700 outline-none'
                  )}
                  aria-selected={isFocused}
                  aria-disabled={option.disabled}
                >
                  {option.icon && <span className="w-5 h-5 flex-shrink-0">{option.icon}</span>}
                  <span className="flex-1 text-left">{option.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 150ms ease-out; }
      `}</style>
    </div>
  )
}

export interface SelectDropdownProps {
  value: string
  placeholder?: string
  options: DropdownOption[]
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  leftIcon?: React.ReactNode
}

export function SelectDropdown({
  value,
  placeholder,
  options,
  onChange,
  disabled,
  className,
  leftIcon,
}: SelectDropdownProps) {
  const selectedOption = options.find(o => o.value === value)

  return (
    <Dropdown
      align="right"
      options={options}
      onSelect={(val) => onChange(val)}
      trigger={
        <button
          ref={(el) => { if (el) (el as HTMLButtonElement).id = 'select-trigger' }}
          disabled={disabled}
          type="button"
          id="select-trigger"
          className={cn(
            'w-full px-4 py-2.5 pr-10 text-base text-secondary-900',
            'bg-white border rounded-lg appearance-none',
            'transition-all duration-150 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
            'disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : '',
            disabled
              ? 'border-secondary-200'
              : 'border-secondary-200 hover:border-secondary-300 focus-visible:border-primary-500 focus-visible:ring-primary-500',
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={false}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {leftIcon && <span className="text-secondary-400">{leftIcon}</span>}
              <span>
                {value && selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-secondary-400 flex-shrink-0" aria-hidden="true" />
          </div>
        </button>
      }
    />
  )
}