'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { useAuth } from '@/lib/auth/context'

export default function AuthTestPage() {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth()
  const router = useRouter()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'customer' | 'provider'>('customer')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (isLogin) {
      const result = await signIn(email, password)
      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess('Logged in successfully!')
        setTimeout(() => router.refresh(), 1000)
      }
    } else {
      const result = await signUp(email, password, fullName, role)
      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess('Account created! Check your email to verify.')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card variant="elevated" padding="lg">
          <CardHeader className="text-center mb-8">
            <CardTitle className="text-2xl">Auth Test Page</CardTitle>
            <CardDescription>
              Test authentication functionality
            </CardDescription>
          </CardHeader>

          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                  <p className="font-medium text-success-700">Logged in as:</p>
                  <p className="text-success-600">{user.email}</p>
                  <p className="text-sm text-success-500">Role: {profile?.role || 'unknown'}</p>
                  <p className="text-sm text-success-500">User ID: {user.id.slice(0, 8)}...</p>
                </div>
                <Button onClick={signOut} variant="outline" className="w-full">
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={isLogin ? 'primary' : 'outline'}
                    className="flex-1"
                    onClick={() => setIsLogin(true)}
                  >
                    Login
                  </Button>
                  <Button
                    variant={!isLogin ? 'primary' : 'outline'}
                    className="flex-1"
                    onClick={() => setIsLogin(false)}
                  >
                    Register
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <Input
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required={!isLogin}
                      disabled={isLogin}
                    />
                  )}

                  {!isLogin && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={role === 'customer' ? 'primary' : 'outline'}
                        className="flex-1"
                        onClick={() => setRole('customer')}
                      >
                        Customer
                      </Button>
                      <Button
                        type="button"
                        variant={role === 'provider' ? 'primary' : 'outline'}
                        className="flex-1"
                        onClick={() => setRole('provider')}
                      >
                        Provider
                      </Button>
                    </div>
                  )}

                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                  />

                  {error && (
                    <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-success-50 border border-success-200 rounded-lg text-success-600 text-sm">
                      {success}
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg">
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}