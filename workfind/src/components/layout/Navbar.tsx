'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, PlusCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { CategoryIcon } from '@/components/marketplace/CategoryIcon'
import { mockCategories } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth/context'
import NotificationBell from '@/components/messaging/NotificationBell'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Browse services', href: '/browse' },
  { name: 'How it works', href: '/how-it-works' },
]

const categories = mockCategories
  .filter((category) => category.is_active)
  .slice(0, 10)
  .map((category) => ({
    name: category.name,
    href: `/categories/${category.slug}`,
    slug: category.slug,
  }))

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isDesktopCategoriesOpen, setIsDesktopCategoriesOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const categoriesButtonRef = useRef<HTMLButtonElement>(null)
  const desktopCategoriesRef = useRef<HTMLDivElement>(null)
  const { user, profile, loading } = useAuth()

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false)
          categoriesButtonRef.current?.focus()
        }
        if (isCategoriesOpen) {
          setIsCategoriesOpen(false)
        }
        if (isDesktopCategoriesOpen) {
          setIsDesktopCategoriesOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen, isCategoriesOpen, isDesktopCategoriesOpen])

  // Close desktop categories when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopCategoriesRef.current && !desktopCategoriesRef.current.contains(e.target as Node)) {
        setIsDesktopCategoriesOpen(false)
      }
    }

    if (isDesktopCategoriesOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDesktopCategoriesOpen])

  // Focus trap for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      const focusableElements = mobileMenuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

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

      document.addEventListener('keydown', handleTabKey)
      firstElement?.focus()

      return () => document.removeEventListener('keydown', handleTabKey)
    }
  }, [isMobileMenuOpen])

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-secondary-200 bg-white/95 backdrop-blur-sm">
      <nav className="container" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary-700" aria-label="WorkFind home">
            <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M8 12h16M8 16h12M8 20h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-secondary-900">WorkFind</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-secondary-600 hover:text-primary-700">
              Home
            </Link>
            <Link href="/browse" className="text-sm font-medium text-secondary-600 hover:text-primary-700">
              Browse services
            </Link>
            <div
              className="relative"
              ref={desktopCategoriesRef}
              onMouseEnter={() => setIsDesktopCategoriesOpen(true)}
              onMouseLeave={() => setIsDesktopCategoriesOpen(false)}
              onFocusWithin={() => setIsDesktopCategoriesOpen(true)}
              onBlur={(e) => {
                // Only close if focus is moving outside the dropdown
                setTimeout(() => {
                  if (!desktopCategoriesRef.current?.contains(document.activeElement)) {
                    setIsDesktopCategoriesOpen(false)
                  }
                }, 0)
              }}
            >
              <Link
                href="/categories"
                className="flex items-center gap-1 text-sm font-medium text-secondary-600 hover:text-primary-700"
                aria-expanded={isDesktopCategoriesOpen}
                aria-haspopup="true"
              >
                Categories
                <ChevronDown className={cn('h-4 w-4 transition-transform', isDesktopCategoriesOpen && 'rotate-180')} aria-hidden="true" />
              </Link>
              {isDesktopCategoriesOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-secondary-200 bg-white py-2 shadow-lg" role="menu">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={category.href}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700"
                      role="menuitem"
                    >
                      <CategoryIcon slug={category.slug} className="h-4 w-4" aria-hidden="true" />
                      {category.name}
                    </Link>
                  ))}
                  <Link href="/categories" className="block px-4 py-2 text-sm font-medium text-primary-700" role="menuitem">
                    All categories
                  </Link>
                </div>
              )}
            </div>
            <Link href="/how-it-works" className="text-sm font-medium text-secondary-600 hover:text-primary-700">
              How it works
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {!user ? (
              <>
                <Button href="/auth/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button href="/auth/register?role=customer" variant="secondary" size="sm">
                  Register
                </Button>
                <Button href="/auth/register?role=provider" size="sm" leftIcon={<PlusCircle className="h-4 w-4" aria-hidden="true" />}>
                  Post a service
                </Button>
              </>
            ) : (
              <>
                {profile?.role === 'provider' ? (
                  <Link href="/dashboard/provider" className="text-sm font-medium text-secondary-600 hover:text-primary-700">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/dashboard/customer" className="text-sm font-medium text-secondary-600 hover:text-primary-700">
                    Dashboard
                  </Link>
                )}
                {!loading && user && <NotificationBell userId={user.id} />}
              </>
            )}
          </div>

          <button
            ref={categoriesButtonRef}
            className="rounded-lg p-2 text-secondary-700 hover:bg-secondary-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className={cn('md:hidden', isMobileMenuOpen ? 'pb-4 animate-slide-down' : 'hidden')}
          role="navigation"
          aria-label="Mobile menu"
        >
          <div className="space-y-1 border-t border-secondary-100 pt-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-lg px-2 py-2 text-base font-medium text-secondary-700 hover:bg-primary-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <button
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-base font-medium text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              onClick={() => setIsCategoriesOpen((open) => !open)}
              aria-expanded={isCategoriesOpen}
              aria-controls="mobile-categories"
            >
              Categories
              <ChevronDown className={cn('h-5 w-5 transition-transform', isCategoriesOpen && 'rotate-180')} aria-hidden="true" />
            </button>
            {isCategoriesOpen && (
              <div id="mobile-categories" className="space-y-1 pl-4 animate-fade-in" role="menu">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={category.href}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-secondary-600 hover:bg-primary-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                    role="menuitem"
                  >
                    <CategoryIcon slug={category.slug} className="h-4 w-4" aria-hidden="true" />
                    {category.name}
                  </Link>
                ))}
                <Link
                  href="/categories"
                  className="block rounded-lg px-2 py-2 text-sm font-medium text-primary-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                  role="menuitem"
                >
                  All categories
                </Link>
              </div>
            )}
            {!user ? (
              <div className="space-y-3 border-t border-secondary-100 pt-4">
                <Button href="/auth/login" variant="outline" fullWidth>
                  Log in
                </Button>
                <Button href="/auth/register?role=customer" variant="secondary" fullWidth>
                  Register
                </Button>
                <Button href="/auth/register?role=provider" fullWidth leftIcon={<PlusCircle className="h-4 w-4" />}>
                  Post a service
                </Button>
              </div>
            ) : (
              <div className="space-y-3 border-t border-secondary-100 pt-4">
                {profile?.role === 'provider' ? (
                  <Link
                    href="/dashboard/provider"
                    className="block rounded-lg px-2 py-2 text-base font-medium text-secondary-700 hover:bg-primary-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/customer"
                    className="block rounded-lg px-2 py-2 text-base font-medium text-secondary-700 hover:bg-primary-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <div className="pt-2">
                  {!loading && user && <NotificationBell userId={user.id} />}
                </div>
              </div>
            )}
          </div>
        </div>
        <style jsx global>{`
          @keyframes slide-down {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-slide-down { animation: slide-down 200ms ease-out; }
          .animate-fade-in { animation: fade-in 150ms ease-out; }
        `}</style>
      </nav>
    </header>
  )
}
