'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Building,
  Briefcase,
  MapPin,
  Clock,
  Image,
  Star,
  Shield,
  Loader2,
  ChevronRight,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface ProviderProfileCompletionPageProps {
  userId: string
}

interface CompletionItem {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  completed: boolean
  required: boolean
  actionUrl?: string
  actionLabel?: string
}

interface CompletionData {
  overall: number
  items: CompletionItem[]
}

export default function ProviderProfileCompletionPage({ userId }: ProviderProfileCompletionPageProps) {
  const [completion, setCompletion] = useState<CompletionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([])

  useEffect(() => {
    fetchCompletion()
  }, [userId])

  const fetchCompletion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/provider/profile/completion')
      if (response.ok) {
        const data = await response.json()
        // Convert icon components from server
        const itemsWithIcons = data.items.map((item: any) => ({
          ...item,
          icon: getIconComponent(item.id),
        }))
        setCompletion({ ...data, items: itemsWithIcons })
      }
    } catch (error) {
      console.error('Failed to fetch profile completion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIconComponent = (id: string) => {
    switch (id) {
      case 'business_name':
      case 'short_intro':
      case 'description':
      case 'main_category':
      case 'experience':
        return <Briefcase className="w-5 h-5" />
      case 'location':
      case 'service_coverage':
        return <MapPin className="w-5 h-5" />
      case 'availability':
        return <Clock className="w-5 h-5" />
      case 'delivery_types':
        return <Building className="w-5 h-5" />
      case 'languages':
      case 'experience':
        return <Star className="w-5 h-5" />
      case 'profile_image':
      case 'business_logo':
        return <Image className="w-5 h-5" />
      case 'verification':
        return <Shield className="w-5 h-5" />
      default:
        return <HelpCircle className="w-5 h-5" />
    }
  }

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success-500'
    if (percentage >= 50) return 'bg-warning-500'
    return 'bg-error-500'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div>
              <div className="h-8 bg-secondary-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-secondary-200 rounded w-1/4" />
            </div>
            <Card variant="outlined">
              <CardHeader>
                <div className="h-6 bg-secondary-200 rounded w-1/2" />
                <div className="h-4 bg-secondary-200 rounded w-1/3 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-secondary-200 rounded w-full" />
              </CardContent>
            </Card>
            {[1, 2, 3, 4].map(i => (
              <Card key={i} variant="outlined">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-secondary-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-secondary-200 rounded w-1/2" />
                    </div>
                    <div className="w-20 h-8 bg-secondary-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!completion) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-error-500" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Unable to load profile completion</h3>
            <p className="text-secondary-500 mb-4">Please try again later</p>
            <Link href="/dashboard/provider">
              <Button variant="primary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Profile Completion</h1>
            <p className="text-secondary-600 mt-1">Complete your profile to get more visibility and trust from customers</p>
          </div>
          <Link href="/dashboard/provider">
            <Button variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Overall Progress */}
        <Card variant="outlined" className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>Complete all required sections to reach 100%</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary-900">{completion.overall}%</div>
                <div className="text-sm text-secondary-500">Complete</div>
              </div>
            </div>
            <Progress value={completion.overall} className={cn('mt-4 h-4', getProgressColor(completion.overall))} />
          </CardHeader>
          <CardContent>
            {completion.overall < 100 && (
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-900">Complete your profile to unlock benefits</p>
                    <p className="text-sm text-primary-700">
                      Providers with 100% complete profiles get 3x more enquiries and higher trust scores
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Required Items */}
        <Card variant="outlined" className="mb-8">
          <CardHeader>
            <CardTitle>Required Sections</CardTitle>
            <CardDescription>These sections must be completed to publish listings</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {completion.items.filter(item => item.required).map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl transition-colors',
                    item.completed ? 'bg-success-50 border border-success-200' : 'bg-error-50 border border-error-200'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    item.completed
                      ? 'bg-success-100 text-success-600'
                      : 'bg-error-100 text-error-600'
                  )}>
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <p className="font-medium text-secondary-900">{item.label}</p>
                      <Badge variant="error" size="xs">Required</Badge>
                    </div>
                    <p className="text-sm text-secondary-600 mt-1">{item.description}</p>
                  </div>
                  {!item.completed && item.actionUrl && (
                    <Link href={item.actionUrl}>
                      <Button variant="primary" size="sm">
                        {item.actionLabel || 'Complete'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                  {item.completed && (
                    <Badge variant="success" className="w-20 text-center">Complete</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Optional Items */}
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Optional Enhancements</CardTitle>
            <CardDescription>Complete these to further improve your profile and trust score</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {completion.items.filter(item => !item.required).map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl transition-colors',
                    item.completed ? 'bg-success-50 border border-success-200' : 'bg-warning-50 border border-warning-200'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    item.completed
                      ? 'bg-success-100 text-success-600'
                      : 'bg-warning-100 text-warning-600'
                  )}>
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <HelpCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <p className="font-medium text-secondary-900">{item.label}</p>
                      <Badge variant="secondary" size="xs">Optional</Badge>
                    </div>
                    <p className="text-sm text-secondary-600 mt-1">{item.description}</p>
                  </div>
                  {!item.completed && item.actionUrl && (
                    <Link href={item.actionUrl}>
                      <Button variant="outline" size="sm">
                        {item.actionLabel || 'Complete'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                  {item.completed && (
                    <Badge variant="success" className="w-20 text-center">Complete</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}