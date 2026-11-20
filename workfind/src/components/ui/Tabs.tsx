'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
  value: string
  label: string
  icon?: React.ReactNode
  count?: number
  disabled?: boolean
  children?: React.ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  variant?: 'line' | 'enclosed' | 'soft'
  fullWidth?: boolean
  className?: string
}

export function Tabs({
  tabs,
  defaultValue,
  value,
  onChange,
  variant = 'line',
  fullWidth = false,
  className,
}: TabsProps) {
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || tabs[0]?.value || '')
  const activeValue = isControlled ? value : uncontrolledValue
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const handleTabClick = (tabValue: string) => {
    const tab = tabs.find(t => t.value === tabValue)
    if (tab?.disabled) return
    if (!isControlled) {
      setUncontrolledValue(tabValue)
    }
    onChange?.(tabValue)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, tabValue: string) => {
    const enabledTabs = tabs.filter(t => !t.disabled)
    const enabledValues = enabledTabs.map(t => t.value)
    const currentIndex = enabledValues.indexOf(tabValue)

    if (currentIndex === -1) return

    let nextIndex = currentIndex

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        nextIndex = (currentIndex + 1) % enabledValues.length
        break
      case 'ArrowLeft':
        e.preventDefault()
        nextIndex = (currentIndex - 1 + enabledValues.length) % enabledValues.length
        break
      case 'Home':
        e.preventDefault()
        nextIndex = 0
        break
      case 'End':
        e.preventDefault()
        nextIndex = enabledValues.length - 1
        break
      default:
        return
    }

    const nextTabValue = enabledValues[nextIndex]
    handleTabClick(nextTabValue)
    // Focus the next tab
    setTimeout(() => {
      tabRefs.current.get(nextTabValue)?.focus()
    }, 0)
  }

  const variantStyles = {
    line: {
      container: 'border-b border-secondary-200',
      tab: (isActive: boolean) => cn(
        'relative px-4 py-3 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        isActive
          ? 'text-primary-600'
          : 'text-secondary-500 hover:text-secondary-700'
      ),
      indicator: (isActive: boolean) => cn(
        'absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200',
        isActive ? 'bg-primary-600' : 'bg-transparent'
      ),
    },
    enclosed: {
      container: '',
      tab: (isActive: boolean) => cn(
        'px-4 py-2 text-sm font-medium rounded-lg transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        isActive
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-secondary-600 hover:bg-secondary-100'
      ),
      indicator: () => '',
    },
    soft: {
      container: '',
      tab: (isActive: boolean) => cn(
        'px-4 py-2 text-sm font-medium rounded-lg transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-secondary-600 hover:bg-secondary-50'
      ),
      indicator: () => '',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div className={cn(className)}>
      <div
        className={cn(
          'flex',
          styles.container,
          fullWidth && 'w-full',
          variant !== 'line' && 'gap-1'
        )}
        role="tablist"
        aria-label="Tabs"
      >
        {tabs.map((tab) => {
          const isActive = activeValue === tab.value
          return (
            <button
              ref={(el) => { if (el) tabRefs.current.set(tab.value, el) }}
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.value}`}
              id={`tab-${tab.value}`}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.value)}
              onKeyDown={(e) => handleKeyDown(e, tab.value)}
              className={cn(
                styles.tab(isActive),
                tab.disabled && 'opacity-50 cursor-not-allowed',
                fullWidth && 'flex-1'
              )}
              tabIndex={isActive ? 0 : -1}
            >
              <span className="flex items-center gap-2">
                {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    isActive
                      ? variant === 'enclosed' ? 'bg-primary-500/20 text-primary-600' : 'bg-primary-100 text-primary-700'
                      : 'bg-secondary-100 text-secondary-600'
                  )}>
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.value}
          role="tabpanel"
          id={`tabpanel-${tab.value}`}
          aria-labelledby={`tab-${tab.value}`}
          hidden={activeValue !== tab.value}
          className="mt-4 animate-fade-in"
          tabIndex={0}
        >
          {tab.children}
        </div>
      ))}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 200ms ease-out; }
      `}</style>
    </div>
  )
}

// Add children to TabItem
declare module '@/components/ui/Tabs' {
  export interface TabItem {
    children?: React.ReactNode
  }
}