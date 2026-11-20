'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Shield,
  Star,
  Camera,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { SRI_LANKAN_DISTRICTS } from '@/constants/sri-lanka'

interface ProviderProfilePageProps {
  providerProfile: {
    id: string
    user_id: string
    business_name: string
    business_logo_url: string | null
    cover_image_url: string | null
    short_intro: string | null
    description: string | null
    main_category_id: string | null
    years_experience: number | null
    languages: string[]
    availability: {
      monday: { is_available: boolean; start_time: string | null; end_time: string | null }
      tuesday: { is_available: boolean; start_time: string | null; end_time: string | null }
      wednesday: { is_available: boolean; start_time: string | null; end_time: string | null }
      thursday: { is_available: boolean; start_time: string | null; end_time: string | null }
      friday: { is_available: boolean; start_time: string | null; end_time: string | null }
      saturday: { is_available: boolean; start_time: string | null; end_time: string | null }
      sunday: { is_available: boolean; start_time: string | null; end_time: string | null }
    }
    service_delivery_types: string[]
    verification_status: string
    verified_at: string | null
    verified_by: string | null
    rating: number
    review_count: number
    profile_views: number
    district: string | null
    city: string | null
    created_at: string
    updated_at: string
  } | null
}

const districtOptions = [
  { value: '', label: 'Select District' },
  ...SRI_LANKAN_DISTRICTS.map(d => ({ value: d.id, label: d.name })),
]

const cityOptions = {
  colombo: ['Colombo', 'Dehiwala-Mount Lavinia', 'Moratuwa', 'Sri Jayawardenepura Kotte', 'Kaduwela', 'Maharagama', 'Boralesgamuwa', 'Kesbewa'],
  gampaha: ['Gampaha', 'Negombo', 'Wattala', 'Ja-Ela', 'Katunayake', 'Minuwangoda', 'Divulapitiya', 'Mirigama'],
  // ... other districts can be added
} as Record<string, string[]>

const languageOptions = [
  { value: 'english', label: 'English' },
  { value: 'sinhala', label: 'Sinhala' },
  { value: 'tamil', label: 'Tamil' },
]

const deliveryTypeOptions = [
  { value: 'business_location', label: 'At Business Location' },
  { value: 'customer_location', label: 'At Customer Location' },
  { value: 'remote', label: 'Remote/Online' },
  { value: 'multiple_locations', label: 'Multiple Locations' },
]

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return { value: `${hour}:00`, label: `${hour}:00` }
})

export default function ProviderProfilePage({ providerProfile }: { providerProfile: ProviderProfilePageProps['providerProfile'] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    business_name: providerProfile?.business_name || '',
    short_intro: providerProfile?.short_intro || '',
    description: providerProfile?.description || '',
    main_category_id: providerProfile?.main_category_id || '',
    years_experience: providerProfile?.years_experience?.toString() || '',
    languages: providerProfile?.languages || ['english'],
    availability: providerProfile?.availability || {
      monday: { is_available: true, start_time: '09:00', end_time: '17:00' },
      tuesday: { is_available: true, start_time: '09:00', end_time: '17:00' },
      wednesday: { is_available: true, start_time: '09:00', end_time: '17:00' },
      thursday: { is_available: true, start_time: '09:00', end_time: '17:00' },
      friday: { is_available: true, start_time: '09:00', end_time: '17:00' },
      saturday: { is_available: true, start_time: '09:00', end_time: '13:00' },
      sunday: { is_available: false, start_time: null, end_time: null },
    },
    service_delivery_types: providerProfile?.service_delivery_types || ['customer_location'],
    district: providerProfile?.district || '',
    city: providerProfile?.city || '',
    service_coverage: (providerProfile as any)?.service_coverage || [] as string[],
  })

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
  }

  const handleDistrictChange = (district: string) => {
    setFormData(prev => ({ ...prev, district, city: '' }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required'
    }

    if (!formData.main_category_id) {
      newErrors.main_category_id = 'Main category is required'
    }

    if (!formData.district) {
      newErrors.district = 'District is required'
    }

    if (!formData.service_delivery_types.length) {
      newErrors.service_delivery_types = 'At least one delivery type is required'
    }

    if (!formData.languages.length) {
      newErrors.languages = 'At least one language is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/provider/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      router.push('/dashboard/provider')
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleAvailabilityChange = (day: string, field: 'is_available' | 'start_time' | 'end_time', value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...(prev.availability as Record<string, any>)[day],
          [field]: value,
        },
      },
    }))
  }

  const handleLanguageChange = (lang: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      languages: checked
        ? [...prev.languages, lang]
        : prev.languages.filter(l => l !== lang),
    }))
  }

  const handleDeliveryTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      service_delivery_types: checked
        ? [...prev.service_delivery_types, type]
        : prev.service_delivery_types.filter(t => t !== type),
    }))
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Edit Profile</h1>
            <p className="text-secondary-600 mt-1">Manage your provider profile information</p>
          </div>
          <Link href="/dashboard/provider">
            <Button variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Basic Information */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Basic details about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Business Name"
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                placeholder="Your business name"
                error={errors.business_name}
                required
              />

              <Input
                label="Main Category"
                value={formData.main_category_id}
                onChange={(e) => handleChange('main_category_id', e.target.value)}
                placeholder="Select main category"
                error={errors.main_category_id}
                required
              />

              <Textarea
                label="Short Introduction"
                value={formData.short_intro}
                onChange={(e) => handleChange('short_intro', e.target.value)}
                placeholder="Brief introduction shown on listing cards"
                rows={2}
                maxLength={200}
              />

              <Textarea
                label="Detailed Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed description of your services, experience, and what makes you unique"
                rows={6}
              />

              <Input
                label="Years of Experience"
                type="number"
                value={formData.years_experience}
                onChange={(e) => handleChange('years_experience', e.target.value)}
                placeholder="0"
                min="0"
                max="100"
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map(lang => (
                    <label key={lang.value} className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-50 border border-secondary-200 rounded-lg cursor-pointer hover:bg-primary-50 hover:border-primary-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(lang.value)}
                        onChange={(e) => handleLanguageChange(lang.value, e.target.checked)}
                        className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-secondary-700">{lang.label}</span>
                    </label>
                  ))}
                  {errors.languages && <p className="mt-1 text-sm text-error-600">{errors.languages}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Delivery */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Service Delivery & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Service Delivery Types</label>
                <div className="flex flex-wrap gap-2">
                  {deliveryTypeOptions.map(type => (
                    <label key={type.value} className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-50 border border-secondary-200 rounded-lg cursor-pointer hover:bg-primary-50 hover:border-primary-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.service_delivery_types.includes(type.value)}
                        onChange={(e) => handleDeliveryTypeChange(type.value, e.target.checked)}
                        className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-secondary-700">{type.label}</span>
                    </label>
                  ))}
                </div>
                {errors.service_delivery_types && <p className="mt-1 text-sm text-error-600">{errors.service_delivery_types}</p>}
              </div>

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

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Service Coverage Areas <span className="text-error-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {districtOptions.filter(d => d.value).map(d => (
                      <label key={d.value} className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-50 border border-secondary-200 rounded-lg cursor-pointer hover:bg-primary-50 hover:border-primary-200 transition-colors">
                        <input
                          type="checkbox"
                          value={d.value}
                          checked={formData.service_coverage.includes(d.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleChange('service_coverage', [...formData.service_coverage, e.target.value])
                            } else {
                              handleChange('service_coverage', formData.service_coverage.filter((id: string) => id !== e.target.value))
                            }
                          }}
                          className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-secondary-700">{d.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.service_coverage && <p className="mt-1 text-sm text-error-600">{errors.service_coverage}</p>}
                </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {daysOfWeek.map(day => {
                  const avail = formData.availability[day.key]
                  return (
                    <div key={day.key} className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                      <label className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          checked={avail.is_available}
                          onChange={(e) => handleAvailabilityChange(day.key, 'is_available', e.target.checked)}
                          className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="font-medium text-secondary-900 capitalize">{day.label}</span>
                      </label>
                      {avail.is_available && (
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            options={timeOptions}
                            value={avail.start_time || ''}
                            placeholder="Start"
                            onChange={(value) => handleAvailabilityChange(day.key, 'start_time', value)}
                          />
                          <Select
                            options={timeOptions}
                            value={avail.end_time || ''}
                            placeholder="End"
                            onChange={(value) => handleAvailabilityChange(day.key, 'end_time', value)}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Profile Image <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className="relative w-full h-48 border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
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
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Cover Image (Optional)
                </label>
                <div className="relative">
                  <div
                    className="relative w-full h-48 border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                      border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                      setCoverPreview(URL.createObjectURL(file))
                    }
                  }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                        setCoverPreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                  {coverPreview ? (
                    <div className="relative w-full h-48">
                      <img src={coverPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => { setCoverPreview(null) }}
                        className="absolute top-2 right-2 w-8 h-8 bg-error-500/90 text-white rounded-full flex items-center justify-center hover:bg-error-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Image className="w-10 h-10 text-secondary-300" />
                      <p className="text-secondary-500">Drag & drop an image here, or click to select</p>
                      <p className="text-xs text-secondary-400">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Business Logo (Optional)
                  </label>
                  <div className="relative">
                    <div
                      className="relative w-32 h-32 border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
                        border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                        setLogoPreview(URL.createObjectURL(file))
                      }
                    }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    >
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                            setLogoPreview(URL.createObjectURL(file))
                          }
                        }}
                    />
                    {logoPreview ? (
                      <div className="relative w-32 h-32">
                        <img src={logoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => { setLogoPreview(null) }}
                          className="absolute top-1 right-1 w-6 h-6 bg-error-500/90 text-white rounded-full flex items-center justify-center hover:bg-error-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Camera className="w-8 h-8 text-secondary-300" />
                        <p className="text-secondary-500">Drag & drop or click</p>
                        <p className="text-xs text-secondary-400">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-secondary-200">
            <Link href="/dashboard/provider">
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