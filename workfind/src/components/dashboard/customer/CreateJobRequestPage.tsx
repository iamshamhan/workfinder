'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  X,
  Image,
  MapPin,
  DollarSign,
  Clock,
  Truck,
  Home,
  Globe,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Camera,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
}

interface Subcategory {
  id: string
  name: string
  slug: string
  category_id: string
}

interface CreateJobRequestPageProps {
  categories: Category[]
  subcategories: Subcategory[]
}

const urgencyOptions: SelectOption[] = [
  { value: 'low', label: 'Low - Flexible timeline' },
  { value: 'normal', label: 'Normal - Within a few weeks' },
  { value: 'high', label: 'High - Within a week' },
  { value: 'urgent', label: 'Urgent - ASAP / Emergency' },
]

const districtOptions: SelectOption[] = [
  { value: '', label: 'Select District' },
  { value: 'colombo', label: 'Colombo' },
  { value: 'gampaha', label: 'Gampaha' },
  { value: 'kalutara', label: 'Kalutara' },
  { value: 'kandy', label: 'Kandy' },
  { value: 'matale', label: 'Matale' },
  { value: 'nuwara_eliya', label: 'Nuwara Eliya' },
  { value: 'galle', label: 'Galle' },
  { value: 'matara', label: 'Matara' },
  { value: 'hambantota', label: 'Hambantota' },
  { value: 'jaffna', label: 'Jaffna' },
  { value: 'kilinochchi', label: 'Kilinochchi' },
  { value: 'mannar', label: 'Mannar' },
  { value: 'vavuniya', label: 'Vavuniya' },
  { value: 'mullaitivu', label: 'Mullaitivu' },
  { value: 'batticaloa', label: 'Batticaloa' },
  { value: 'ampara', label: 'Ampara' },
  { value: 'trincomalee', label: 'Trincomalee' },
  { value: 'kurunegala', label: 'Kurunegala' },
  { value: 'puttalam', label: 'Puttalam' },
  { value: 'anuradhapura', label: 'Anuradhapura' },
  { value: 'polonnaruwa', label: 'Polonnaruwa' },
  { value: 'badulla', label: 'Badulla' },
  { value: 'monaragala', label: 'Monaragala' },
  { value: 'ratnapura', label: 'Ratnapura' },
  { value: 'kegalle', label: 'Kegalle' },
]

const contactPreferenceOptions: SelectOption[] = [
  { value: 'call', label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'in_app', label: 'In-App Message' },
]

const deliveryTypeOptions: SelectOption[] = [
  { value: 'customer_location', label: 'At My Location' },
  { value: 'business_location', label: 'At Provider\'s Location' },
  { value: 'remote', label: 'Remote/Online' },
  { value: 'multiple_locations', label: 'Multiple Locations' },
]

export default function CreateJobRequestPage({ categories, subcategories }: CreateJobRequestPageProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [referenceImages, setReferenceImages] = useState<File[]>([])
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_service: '',
    category_id: '',
    subcategory_id: '',
    district: '',
    city: '',
    budget_min: '',
    budget_max: '',
    budget_currency: 'LKR',
    preferred_date: '',
    urgency: 'normal',
    reference_images: [] as string[],
    contact_preferences: ['whatsapp', 'email'] as string[],
    preferred_delivery_type: 'customer_location',
  })

  // Image upload handlers
  const onReferenceImagesDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
    if (referenceImages.length + newFiles.length > 10) {
      setErrors(prev => ({ ...prev, reference_images: 'Maximum 10 reference images allowed' }))
      return
    }
    const previews = newFiles.map(f => URL.createObjectURL(f))
    setReferenceImages(prev => [...prev, ...newFiles])
    setReferenceImagePreviews(prev => [...prev, ...previews])
    setErrors(prev => { const next = { ...prev }; delete next.reference_images; return next })
  }, [referenceImages.length])

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index))
    setReferenceImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
  }

  const handleDistrictChange = (district: string) => {
    setFormData(prev => ({ ...prev, district, city: '' }))
  }

  // Category/Subcategory handling
  const filteredSubcategories = subcategories.filter(s => s.category_id === selectedCategory)

  useEffect(() => {
    if (selectedCategory && !filteredSubcategories.find(s => s.id === selectedSubcategory)) {
      setSelectedSubcategory('')
      setFormData(prev => ({ ...prev, subcategory_id: '' }))
    }
  }, [selectedCategory, filteredSubcategories])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters'
    }

    if (!formData.required_service.trim()) {
      newErrors.required_service = 'Required service is required'
    } else if (formData.required_service.length < 10) {
      newErrors.required_service = 'Required service must be at least 10 characters'
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required'
    }

    if (!formData.district) {
      newErrors.district = 'District is required'
    }

    if (formData.budget_min && formData.budget_max) {
      if (parseFloat(formData.budget_min) > parseFloat(formData.budget_max)) {
        newErrors.budget_max = 'Maximum budget must be greater than minimum budget'
      }
    }

    if (formData.budget_min && parseFloat(formData.budget_min) <= 0) {
      newErrors.budget_min = 'Minimum budget must be greater than 0'
    }

    if (formData.budget_max && parseFloat(formData.budget_max) <= 0) {
      newErrors.budget_max = 'Maximum budget must be greater than 0'
    }

    if (!formData.contact_preferences.length) {
      newErrors.contact_preferences = 'At least one contact preference is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const formDataToSubmit = new FormData()
      formDataToSubmit.append('title', formData.title)
      formDataToSubmit.append('description', formData.description)
      formDataToSubmit.append('required_service', formData.required_service)
      formDataToSubmit.append('category_id', formData.category_id)
      formDataToSubmit.append('subcategory_id', formData.subcategory_id || '')
      formDataToSubmit.append('district', formData.district)
      formDataToSubmit.append('city', formData.city || '')
      formDataToSubmit.append('budget_min', formData.budget_min)
      formDataToSubmit.append('budget_max', formData.budget_max)
      formDataToSubmit.append('budget_currency', formData.budget_currency)
      formDataToSubmit.append('preferred_date', formData.preferred_date)
      formDataToSubmit.append('urgency', formData.urgency)
      formDataToSubmit.append('reference_images', JSON.stringify(formData.reference_images))
      formDataToSubmit.append('contact_preferences', JSON.stringify(formData.contact_preferences))
      formDataToSubmit.append('preferred_delivery_type', formData.preferred_delivery_type)

      referenceImages.forEach((file, index) => {
        formDataToSubmit.append(`reference_images`, file)
      })

      const response = await fetch('/api/customer/job-requests', {
        method: 'POST',
        body: formDataToSubmit,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job request')
      }

      router.push(`/dashboard/customer/job-requests/${data.jobRequest.id}`)
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to create job request' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/customer/job-requests" className="text-secondary-500 hover:text-secondary-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Create Job Request</h1>
              <p className="text-secondary-600">Describe what you need and receive quotes from verified providers</p>
            </div>
          </div>
          <Link href="/dashboard/customer/job-requests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job Requests
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Basic Information */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Job Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Kitchen Renovation - Modern Style"
                error={errors.title}
                required
                maxLength={100}
              />

              <Textarea
                label="Job Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your job in detail. Include scope, materials preferred, specific requirements, etc."
                rows={6}
                error={errors.description}
                required
                maxLength={5000}
              />

              <Textarea
                label="Specific Service Required"
                value={formData.required_service}
                onChange={(e) => handleChange('required_service', e.target.value)}
                placeholder="e.g., Complete kitchen renovation with modern cabinets, quartz countertops, and island installation"
                rows={3}
                error={errors.required_service}
                required
                maxLength={1000}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Category"
                  placeholder="Select Category"
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                  value={selectedCategory}
                  onChange={(value) => {
                    setSelectedCategory(value)
                    handleChange('category_id', value)
                  }}
                  error={errors.category_id}
                  required
                />

                <Select
                  label="Subcategory (Optional)"
                  placeholder="Select Subcategory"
                  options={subcategories.filter(s => s.category_id === selectedCategory).map(s => ({ value: s.id, label: s.name }))}
                  value={selectedSubcategory}
                  onChange={(value) => {
                    setSelectedSubcategory(value)
                    handleChange('subcategory_id', value)
                  }}
                  disabled={!selectedCategory}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Delivery */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Location & Service Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                label="Preferred Service Delivery"
                options={deliveryTypeOptions}
                value={formData.preferred_delivery_type}
                onChange={(value) => handleChange('preferred_delivery_type', value)}
                required
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
                    // Cities would be dynamically loaded based on district
                  ]}
                  value={formData.city}
                  onChange={(value) => handleChange('city', value)}
                  disabled={!formData.district}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget & Timeline */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Budget & Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Minimum Budget (LKR)"
                  type="number"
                  step="1000"
                  min="0"
                  value={formData.budget_min}
                  onChange={(e) => handleChange('budget_min', e.target.value)}
                  placeholder="0"
                  error={errors.budget_min}
                />

                <Input
                  label="Maximum Budget (LKR)"
                  type="number"
                  step="1000"
                  min="0"
                  value={formData.budget_max}
                  onChange={(e) => handleChange('budget_max', e.target.value)}
                  placeholder="0"
                  error={errors.budget_max}
                />

                <Select
                  label="Currency"
                  options={[{ value: 'LKR', label: 'LKR - Sri Lankan Rupee' }]}
                  value={formData.budget_currency}
                  onChange={(value) => handleChange('budget_currency', value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Preferred Date (Optional)"
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => handleChange('preferred_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />

                <Select
                  label="Urgency"
                  options={urgencyOptions}
                  value={formData.urgency}
                  onChange={(value) => handleChange('urgency', value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Preferences */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Contact Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">How would you like providers to contact you?</label>
                <div className="flex flex-wrap gap-2">
                  {contactPreferenceOptions.map(pref => (
                    <label key={pref.value} className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-50 border border-secondary-200 rounded-lg cursor-pointer hover:bg-primary-50 hover:border-primary-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.contact_preferences.includes(pref.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange('contact_preferences', [...formData.contact_preferences, pref.value])
                          } else {
                            handleChange('contact_preferences', formData.contact_preferences.filter(p => p !== pref.value))
                          }
                        }}
                        className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-secondary-700">{pref.label}</span>
                    </label>
                  ))}
                  {errors.contact_preferences && <p className="mt-1 text-sm text-error-600">{errors.contact_preferences}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reference Images */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Reference Images (Optional, up to 10)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Upload reference images, sketches, or inspiration photos
                </label>
                <div className="relative">
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                      'border-secondary-200 hover:border-primary-300'
                    )}
                    onClick={() => document.getElementById('reference-images-input')?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault()
                      const files = Array.from(e.dataTransfer.files)
                      const validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
                      if (referenceImages.length + validFiles.length > 10) {
                        setErrors(prev => ({ ...prev, reference_images: 'Maximum 10 reference images allowed' }))
                        return
                      }
                      const previews = validFiles.map(f => URL.createObjectURL(f))
                      setReferenceImages(prev => [...prev, ...validFiles])
                      setReferenceImagePreviews(prev => [...prev, ...previews])
                    }}
                  >
                    <input
                      id="reference-images-input"
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        const validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
                        if (referenceImages.length + validFiles.length > 10) {
                          setErrors(prev => ({ ...prev, reference_images: 'Maximum 10 reference images allowed' }))
                          return
                        }
                        const previews = validFiles.map(f => URL.createObjectURL(f))
                        setReferenceImages(prev => [...prev, ...validFiles])
                        setReferenceImagePreviews(prev => [...prev, ...previews])
                      }}
                    />
                    {referenceImages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {referenceImagePreviews.map((preview, index) => (
                          <div key={index} className="relative w-24 h-24">
                            <img src={preview} alt={`Reference ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeReferenceImage(index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-error-500/90 text-white rounded-full flex items-center justify-center hover:bg-error-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Image className="w-10 h-10 text-secondary-300" />
                        <p className="text-secondary-500">Drag & drop images here, or click to select</p>
                        <p className="text-xs text-secondary-400">PNG, JPG up to 5MB each. Max 10 images.</p>
                      </div>
                    )}
                  </div>
                  {errors.reference_images && <p className="mt-1 text-sm text-error-600">{errors.reference_images}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-secondary-200">
            <Link href="/dashboard/customer/job-requests">
              <Button variant="outline" size="lg">Cancel</Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>}
            >
              Post Job Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}