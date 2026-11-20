'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      const next = searchParams.get('next') || '/'
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        setStatus('error')
        setMessage(errorDescription || 'Authentication failed')
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('No authorization code received')
        return
      }

      try {
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, next }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed')
        }

        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')

        if (data.email) setEmail(data.email)

        setTimeout(() => {
          router.push(next)
          router.refresh()
        }, 2000)
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Verification failed')
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-secondary-200 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">Verifying Your Email</h2>
            <p className="text-secondary-600">Please wait while we verify your account...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-error-200 bg-error-50 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-error-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-error-500" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-error-700 mb-2">Verification Failed</h2>
            <p className="text-error-600 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link href="/auth/login" className="text-center">
                <Button variant="outline">Try Signing In</Button>
              </Link>
              <Link href="/auth/register" className="text-center">
                <Button variant="secondary">Create New Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-success-200 bg-success-50 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-success-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success-500" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-success-700 mb-2">Email Verified!</h2>
          <p className="text-success-600 mb-2">{message}</p>
          {email && (
            <p className="text-sm text-success-500 mb-6">
              Verified: <strong>{email}</strong>
            </p>
          )}
          <p className="text-sm text-success-500 mb-6">Redirecting you to your dashboard...</p>
          <Link href="/dashboard/customer" className="inline-block">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-secondary-200 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Verifying Your Email</h2>
          <p className="text-secondary-600">Please wait while we verify your account...</p>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
}