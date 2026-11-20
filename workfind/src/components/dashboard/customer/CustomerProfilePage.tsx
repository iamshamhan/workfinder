'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  MapPin,
  Phone,
  Mail,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Camera,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { SRI_LANKAN_DISTRICTS } from '@/constants/sri-lanka'

interface CustomerProfilePageProps {
  userId: string
}

const districtOptions: SelectOption[] = [
  { value: '', label: 'Select District' },
  ...SRI_LANKAN_DISTRICTS.map(d => ({ value: d.id, label: d.name })),
]

export default function CustomerProfilePage({ userId }: CustomerProfilePageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    district: '',
    city: '',
    address: '',
    preferences: {
      email_notifications: true,
      sms_notifications: false,
      whatsapp_notifications: true,
      marketing_emails: false,
    },
  })

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      if (field.startsWith('preferences.')) {
        const key = field.replace('preferences.', '')
        return {
          ...prev,
          preferences: { ...prev.preferences, [key]: value }
        }
      }
      return { ...prev, [field]: value }
    })
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
  }

  const handleDistrictChange = (district: string) => {
    setFormData(prev => ({ ...prev, district, city: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.district) {
      newErrors.district = 'District is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      addToast('Profile updated successfully!', 'success')
      router.push('/dashboard/customer')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update profile', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Please select an image file', 'error')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast('Image must be less than 5MB', 'error')
        return
      }
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const NotificationPreferenceItem = ({ pref }: { pref: { key: string, label: string, description: string } }) => (
    <div key={pref.key} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
      <div>
        <p className="font-medium text-secondary-900">{pref.label}</p>
        <p className="text-sm text-secondary-600">{pref.description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={formData.preferences[pref.key as keyof typeof formData.preferences]}
          onChange={(e) => handleChange(`preferences.${pref.key}`, e.target.checked)}
        />
        <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
    </div>
  )

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Edit Profile</h1>
            <p className="text-secondary-600 mt-1">Manage your account information and preferences</p>
          </div>
          <Link href="/dashboard/customer">
            <Button variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Profile Photo
                </label>
                <div className="relative">
                  <div
                    className="relative w-full max-w-xs h-48 border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                      border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                        setAvatarPreview(URL.createObjectURL(file))
                      }
                    }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                          setAvatarPreview(URL.createObjectURL(file))
                        }
                      }}
                    />
                    {avatarPreview ? (
                      <div className="relative w-full h-48">
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => { setAvatarPreview(null) }}
                          className="absolute top-2 right-2 w-8 h-8 bg-error-500/90 text-white rounded-full flex items-center justify-center hover:bg-error-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Camera className="w-10 h-10 text-secondary-300" />
                        <p className="text-secondary-500">Drag & drop an image here, or click to select</p>
                        <p className="text-xs text-secondary-400">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  {errors.avatar && <p className="mt-1 text-sm text-error-600">{errors.avatar}</p>}

              <Input
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Your full name"
                error={errors.full_name}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                error={errors.email}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+94 77 123 4567"
              />

              <Input
                label="WhatsApp Number"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="+94 77 123 4567"
                description="Used for quick contact with providers"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="District"
                  options={districtOptions}
                  value={formData.district}
                  onChange={(value) => handleDistrictChange(value)}
                  error={errors.district}
                  required
                />

                <Select
                  label="City (Optional)"
                  options={[
                    { value: '', label: 'Select City' },
                    ...(formData.city ? [{ value: formData.city, label: formData.city }] : []),
                  ]}
                  value={formData.city}
                  onChange={(value) => handleChange('city', value)}
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-secondary-700 mb-1.5"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Your full address for service delivery"
                  rows={3}
                  className="w-full px-4 py-3 text-base text-secondary-900 placeholder:text-secondary-400 bg-white border border-secondary-200 rounded-lg resize-y min-h-[100px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:border-primary-500 focus-visible:ring-primary-500 hover:border-secondary-300"
                ></textarea>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationPreferenceItem pref={{ key: 'email_notifications', label: 'Email Notifications', description: 'Receive enquiry and booking updates via email' }} />
              <NotificationPreferenceItem pref={{ key: 'sms_notifications', label: 'SMS Notifications', description: 'Receive urgent updates via SMS' }} />
              <NotificationPreferenceItem pref={{ key: 'whatsapp_notifications', label: 'WhatsApp Notifications', description: 'Receive updates via WhatsApp' }} />
              <NotificationPreferenceItem pref={{ key: 'marketing_emails', label: 'Marketing Emails', description: 'Receive promotional offers and newsletters' }} />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-secondary-200">
            <Link href="/dashboard/customer">
              <Button variant="outline" size="lg">Cancel</Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}