'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  Briefcase,
  MessageSquare,
  Star,
  Eye,
  Settings,
  BarChart2,
  Shield,
  LayoutDashboard,
  ChevronLeft,
  X,
  Menu,
  LogOut,
  Shield as ShieldIcon,
  Search,
  Bell,
  Plus,
  MoreVertical,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/lib/auth/context'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: ReactNode
}

const adminNavItems = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'User Management', icon: Users },
  { href: '/dashboard/admin/providers', label: 'Provider Management', icon: Briefcase },
  { href: '/dashboard/admin/listings', label: 'Listing Moderation', icon: MessageSquare },
  { href: '/dashboard/admin/categories', label: 'Categories', icon: Star },
  { href: '/dashboard/admin/reviews', label: 'Review Moderation', icon: Star },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: Shield },
  { href: '/dashboard/admin/audit-logs', label: 'Audit Logs', icon: Eye },
  { href: '/dashboard/admin/analytics', label: 'Platform Analytics', icon: BarChart2 },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { user, profile, loading, signOut } = useAuth()

  const isAdmin = profile?.role === 'admin'

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  const userMenuOptions = [
    { value: 'profile', label: 'Profile', icon: <User className="w-4 h-4" />, href: '/dashboard/admin/profile' },
    { value: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, href: '/dashboard/admin/settings' },
    { value: 'divider', label: '', divider: true },
    { value: 'logout', label: 'Log out', icon: <LogOut className="w-4 h-4" />, onClick: signOut, danger: true },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200 transform transition-transform duration-300 ease-in-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Admin navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-200">
            <Link href="/dashboard/admin" className="flex items-center gap-2">
              <ShieldIcon className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-secondary-900">Admin</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Admin menu">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-secondary-200">
            <p className="text-xs text-secondary-500 text-center">
              WorkFinder Admin v1.0
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-secondary-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4 sm:mx-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Search users, providers, listings..."
                  className="pl-10 pr-4"
                  onFocus={() => setIsSearchOpen(true)}
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                  aria-label="Search admin"
                />
                {isSearchOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-secondary-200 rounded-lg shadow-lg p-4 z-20">
                    <p className="text-sm text-secondary-500">Search results will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" aria-label="3 unread notifications" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary-100"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <Avatar
                    src={user?.user_metadata?.avatar_url || profile?.avatar_url || undefined}
                    alt={profile?.full_name || user?.email || 'Admin'}
                    size="sm"
                  />
                  <span className="hidden sm:block text-sm font-medium text-secondary-700">
                    {profile?.full_name || 'Admin'}
                  </span>
                  <MoreVertical className="w-4 h-4 text-secondary-400" />
                </button>

                {isUserMenuOpen && (
                  <Dropdown
                    isOpen={isUserMenuOpen}
                    onClose={() => setIsUserMenuOpen(false)}
                    items={userMenuOptions}
                    trigger={<div />}
                    align="end"
                  />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8" role="main">
          {children}
        </main>
      </div>
    </div>
  )
}