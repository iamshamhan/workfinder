'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Building,
  MapPin,
  Clock,
  Image,
  Star,
  Shield,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'

interface ProfileCompletionProps {
  userId: string
  className?: string
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

export default function ProviderProfileCompletion({ userId, className }: ProfileCompletionProps) {
  const [completion, setCompletion] = useState<CompletionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCompletion()
  }, [userId])

  const fetchCompletion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/provider/profile/completion`)
      if (response.ok) {
        const data = await response.json()
        setCompletion(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile completion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card variant="outlined" className={className}>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>Complete your profile to get more visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-3">
                <div className="w-10 h-10 bg-secondary-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-secondary-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-secondary-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!completion) {
    return null
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success-500'
    if (percentage >= 50) return 'bg-warning-500'
    return 'bg-error-500'
  }

  return (
    <Card variant="outlined" className={cn(className, 'overflow-hidden')}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>Complete your profile to get more visibility and trust from customers</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-secondary-900">{completion.overall}%</div>
            <div className="text-sm text-secondary-500">Complete</div>
          </div>
        </div>
        <Progress value={completion.overall} className={cn('mt-4 h-3', getProgressColor(completion.overall))} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {completion.items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl transition-colors',
                item.completed ? 'bg-success-50 border border-success-200' : 'bg-secondary-50 border border-secondary-200'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                item.completed
                  ? 'bg-success-100 text-success-600'
                  : item.required
                  ? 'bg-error-100 text-error-600'
                  : 'bg-warning-100 text-warning-600'
              )}>
                {item.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : item.required ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <HelpCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-secondary-900">{item.icon}</span>
                  <p className="font-medium text-secondary-900">{item.label}</p>
                  {item.required && !item.completed && (
                    <Badge variant="error" size="xs">Required</Badge>
                  )}
                  {!item.required && !item.completed && (
                    <Badge variant="secondary" size="xs">Optional</Badge>
                  )}
                  {item.completed && (
                    <Badge variant="success" size="xs">Complete</Badge>
                  )}
                </div>
                <p className="text-sm text-secondary-600 mt-1">{item.description}</p>
              </div>
              {!item.completed && item.actionUrl && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.location.href = item.actionUrl}
                >
                  {item.actionLabel || 'Complete'}
                </Button>
              )}
              {item.completed && (
                <Badge variant="success" className="w-20 text-center">Done</Badge>
              )}
            </div>
          ))}
        </div>
        {completion.overall < 100 && (
          <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
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
  )
}