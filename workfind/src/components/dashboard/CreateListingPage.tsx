'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
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
  ArrowLeft,
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

interface ProviderProfile {
  business_name: string
  district: string | null
  city: string | null
  service_delivery_types: string[]
}

interface CreateListingPageProps {
  categories: Category[]
  subcategories: Subcategory[]
  providerProfile?: ProviderProfile | null
}

const pricingTypeOptions: SelectOption[] = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'starting_from', label: 'Starting From' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'daily', label: 'Daily Rate' },
  { value: 'negotiable', label: 'Negotiable' },
  { value: 'quotation', label: 'Request Quotation' },
]

const deliveryTypeOptions: SelectOption[] = [
  { value: 'business_location', label: 'At Business Location' },
  { value: 'customer_location', label: 'At Customer Location' },
  { value: 'remote', label: 'Remote/Online' },
  { value: 'multiple_locations', label: 'Multiple Locations' },
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

export default function CreateListingPage({ categories, subcategories, providerProfile }: CreateListingPageProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    pricing_type: 'starting_from',
    price_amount: '',
    price_currency: 'LKR',
    location_type: 'customer_location',
    district: providerProfile?.district || '',
    city: providerProfile?.city || '',
    service_coverage: [] as string[],
    experience_required: '',
    tags: '' as string,
    status: 'draft',
  })

  // Image upload handlers
  const onMainImageDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, main_image: 'Please select an image file' }))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, main_image: 'Image must be less than 5MB' }))
        return
      }
      setMainImage(file)
      setMainImagePreview(URL.createObjectURL(file))
      setErrors(prev => { const next = { ...prev }; delete next.main_image; return next })
    }
  }, [])

  const onAdditionalImagesDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
    if (additionalImages.length + newFiles.length > 10) {
      setErrors(prev => ({ ...prev, additional_images: 'Maximum 10 additional images allowed' }))
      return
    }
    const previews = newFiles.map(f => URL.createObjectURL(f))
    setAdditionalImages(prev => [...prev, ...newFiles])
    setAdditionalImagePreviews(prev => [...prev, ...previews])
    setErrors(prev => { const next = { ...prev }; delete next.additional_images; return next })
  }, [additionalImages.length])

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index))
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

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required'
    }

    if (formData.pricing_type !== 'quotation' && formData.pricing_type !== 'negotiable') {
      if (!formData.price_amount) {
        newErrors.price_amount = 'Price is required'
      } else if (parseFloat(formData.price_amount) <= 0) {
        newErrors.price_amount = 'Price must be greater than 0'
      }
    }

    if (!formData.location_type) {
      newErrors.location_type = 'Service delivery type is required'
    }

    if (!formData.district) {
      newErrors.district = 'District is required'
    }

    if (formData.experience_required && formData.experience_required.length > 500) {
      newErrors.experience_required = 'Experience must be less than 500 characters'
    }

    if (!mainImage) {
      newErrors.main_image = 'Main image is required'
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
      formDataToSubmit.append('category_id', formData.category_id)
      formDataToSubmit.append('subcategory_id', formData.subcategory_id || '')
      formDataToSubmit.append('pricing_type', formData.pricing_type)
      formDataToSubmit.append('price_amount', formData.price_amount)
      formDataToSubmit.append('price_currency', formData.price_currency)
      formDataToSubmit.append('location_type', formData.location_type)
      formDataToSubmit.append('district', formData.district)
      formDataToSubmit.append('city', formData.city || '')
      formDataToSubmit.append('service_coverage', JSON.stringify(formData.service_coverage))
      formDataToSubmit.append('experience_required', formData.experience_required)
      formDataToSubmit.append('tags', formData.tags)
      formDataToSubmit.append('status', formData.status)

      if (mainImage) {
        formDataToSubmit.append('main_image', mainImage)
      }
      additionalImages.forEach((file, index) => {
        formDataToSubmit.append(`additional_images`, file)
      })

      const response = await fetch('/api/provider/listings', {
        method: 'POST',
        body: formDataToSubmit,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing')
      }

      router.push(`/dashboard/provider/listings/${data.listing.id}/edit`)
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to create listing' })
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
            <Link href="/dashboard/provider/listings" className="text-secondary-500 hover:text-secondary-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Create New Listing</h1>
              <p className="text-secondary-600">Fill in the details to create your service listing</p>
            </div>
          </div>
          <Link href="/dashboard/provider/listings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Listings
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Basic Information */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Listing Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Complete Home Electrical Wiring"
                error={errors.title}
                required
                maxLength={100}
              />

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your service in detail. Include what you offer, your process, materials used, etc."
                rows={6}
                error={errors.description}
                required
                maxLength={5000}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Pricing Type"
                  options={pricingTypeOptions}
                  value={formData.pricing_type}
                  onChange={(value) => handleChange('pricing_type', value)}
                  required
                />

                {formData.pricing_type !== 'quotation' && formData.pricing_type !== 'negotiable' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Price Amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_amount}
                      onChange={(e) => handleChange('price_amount', e.target.value)}
                      placeholder="0.00"
                      error={errors.price_amount}
                      required={formData.pricing_type !== 'quotation' && formData.pricing_type !== 'negotiable'}
                    />
                    <Select
                      label="Currency"
                      options={[{ value: 'LKR', label: 'LKR - Sri Lankan Rupee' }]}
                      value={formData.price_currency}
                      onChange={(value) => handleChange('price_currency', value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Delivery & Location */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Service Delivery & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                label="Service Delivery Type"
                options={deliveryTypeOptions}
                value={formData.location_type}
                onChange={(value) => handleChange('location_type', value)}
                error={errors.location_type}
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
                    ...(providerProfile?.city ? [{ value: providerProfile.city, label: providerProfile.city }] : []),
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
                  {districtOptions.filter(d => d.value).map((d) => (
                    <label key={d.value} className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-50 border border-secondary-200 rounded-lg cursor-pointer hover:bg-primary-50 hover:border-primary-200 transition-colors">
                      <input
                        type="checkbox"
                        value={d.value}
                        checked={formData.service_coverage.includes(d.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange('service_coverage', [...formData.service_coverage, e.target.value])
                          } else {
                            handleChange('service_coverage', formData.service_coverage.filter(id => id !== e.target.value))
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

              <Input
                label="Experience Required (Optional)"
                value={formData.experience_required}
                onChange={(e) => handleChange('experience_required', e.target.value)}
                placeholder="e.g., Licensed electrician with 5+ years experience"
                maxLength={500}
                error={errors.experience_required}
              />

              <Input
                label="Tags (Optional, comma-separated)"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="e.g., wiring, rewiring, new construction, renovation, certified"
                maxLength={500}
              />
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
                  Main Image <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                      'border-secondary-200 hover:border-primary-300'
                    )}
                    onClick={() => document.getElementById('main-image-input')?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                        setMainImage(file)
                        setMainImagePreview(URL.createObjectURL(file))
                      }
                    }}
                  >
                    <input
                      id="main-image-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                          setMainImage(file)
                          setMainImagePreview(URL.createObjectURL(file))
                        }
                      }}
                    />
                    {mainImagePreview ? (
                      <div className="relative w-full h-48">
                        <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => { setMainImage(null); setMainImagePreview(null) }}
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
                  {errors.main_image && <p className="mt-1 text-sm text-error-600">{errors.main_image}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Additional Images (Optional, up to 10)
                  </label>
                  <div className="relative">
                    <div
                      className={cn(
                        'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                        'border-secondary-200 hover:border-primary-300'
                      )}
                      onClick={() => document.getElementById('additional-images-input')?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const files = Array.from(e.dataTransfer.files)
                        const validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
                        if (additionalImages.length + validFiles.length > 10) {
                          setErrors(prev => ({ ...prev, additional_images: 'Maximum 10 additional images allowed' }))
                          return
                        }
                        const previews = validFiles.map(f => URL.createObjectURL(f))
                        setAdditionalImages(prev => [...prev, ...validFiles])
                        setAdditionalImagePreviews(prev => [...prev, ...previews])
                      }}
                    >
                      <input
                        id="additional-images-input"
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          const validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
                          if (additionalImages.length + validFiles.length > 10) {
                            setErrors(prev => ({ ...prev, additional_images: 'Maximum 10 additional images allowed' }))
                            return
                          }
                          const previews = validFiles.map(f => URL.createObjectURL(f))
                          setAdditionalImages(prev => [...prev, ...validFiles])
                          setAdditionalImagePreviews(prev => [...prev, ...previews])
                        }}
                      />
                      {additionalImages.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {additionalImagePreviews.map((preview, index) => (
                            <div key={index} className="relative w-24 h-24">
                              <img src={preview} alt={`Additional ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeAdditionalImage(index)}
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
                    {errors.additional_images && <p className="mt-1 text-sm text-error-600">{errors.additional_images}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publish Options */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Publish Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Status"
                options={[
                  { value: 'draft', label: 'Draft - Save for later' },
                  { value: 'pending_approval', label: 'Submit for Approval' },
                ]}
                value={formData.status}
                onChange={(value) => handleChange('status', value)}
              />

              <div className="p-4 bg-secondary-50 rounded-xl">
                <h4 className="font-medium text-secondary-900 mb-2">Before Publishing</h4>
                <ul className="space-y-1 text-sm text-secondary-600">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-500" /> Title is clear and descriptive</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-500" /> Description explains your service well</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-500" /> Pricing is accurate</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-500" /> Main image is uploaded</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-500" /> District is selected</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-secondary-200">
            <Link href="/dashboard/provider/listings">
              <Button variant="outline" size="lg">Cancel</Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={formData.status === 'draft' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.63 9-11.622 0-1.042-.13-2.052-.382-3.016z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            >
              {formData.status === 'draft' ? 'Save as Draft' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}