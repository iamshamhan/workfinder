import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a provider
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'provider') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get provider profile
    const { data: providerProfile } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!providerProfile) {
      return NextResponse.json({
        overall: 0,
        items: [
          {
            id: 'basic_info',
            label: 'Basic Information',
            description: 'Add your business name, category, and description',
            iconId: 'building',
            completed: false,
            required: true,
            actionUrl: '/dashboard/provider/profile',
            actionLabel: 'Add Info',
          },
        ],
      })
    }

    // Check each completion item
    const items = [
      {
        id: 'business_name',
        label: 'Business Name',
        description: 'Your business name is displayed on all listings',
        iconId: 'building',
        completed: !!providerProfile.business_name?.trim(),
        required: true,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Edit Profile',
      },
      {
        id: 'short_intro',
        label: 'Short Introduction',
        description: 'Brief intro shown on listing cards and search results',
        iconId: 'briefcase',
        completed: !!providerProfile.short_intro?.trim(),
        required: true,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Edit Profile',
      },
      {
        id: 'description',
        label: 'Detailed Description',
        description: 'Full description of your services and expertise',
        iconId: 'briefcase',
        completed: !!providerProfile.description?.trim(),
        required: true,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Edit Profile',
      },
      {
        id: 'main_category',
        label: 'Main Category',
        description: 'Select your primary service category',
        iconId: 'briefcase',
        completed: !!providerProfile.main_category_id,
        required: true,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Edit Profile',
      },
      {
        id: 'location',
        label: 'Location & Coverage',
        description: 'Set your district and service coverage areas',
        iconId: 'map_pin',
        completed: !!providerProfile.district && (!!providerProfile.service_coverage?.length || !!providerProfile.city),
        required: true,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Edit Profile',
      },
      {
        id: 'availability',
        label: 'Weekly Availability',
        description: 'Set your working hours so customers know when you\'re available',
        iconId: 'clock',
        completed: Object.values(providerProfile.availability || {}).some((day: any) => day?.is_available),
        required: true,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Edit Profile',
      },
      {
        id: 'delivery_types',
        label: 'Service Delivery Types',
        description: 'Specify how you deliver your services',
        iconId: 'building',
        completed: !!(providerProfile.service_delivery_types?.length),
        required: true,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Edit Profile',
      },
      {
        id: 'languages',
        label: 'Languages Spoken',
        description: 'Add languages you can communicate in',
        iconId: 'star',
        completed: !!(providerProfile.languages?.length),
        required: true,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Edit Profile',
      },
      {
        id: 'profile_image',
        label: 'Profile Image',
        description: 'Upload a professional photo to build trust',
        iconId: 'image',
        completed: !!providerProfile.cover_image_url,
        required: false,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Upload Image',
      },
      {
        id: 'business_logo',
        label: 'Business Logo',
        description: 'Add your business logo for brand recognition',
        iconId: 'image',
        completed: !!providerProfile.business_logo_url,
        required: false,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Upload Logo',
      },
      {
        id: 'experience',
        label: 'Years of Experience',
        description: 'Show your expertise with years of experience',
        iconId: 'star',
        completed: !!(providerProfile.years_experience && providerProfile.years_experience > 0),
        required: false,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Edit Profile',
      },
      {
        id: 'verification',
        label: 'Business Verification',
        description: 'Get verified to build customer trust',
        iconId: 'shield',
        completed: providerProfile.verification_status === 'verified',
        required: false,
        actionUrl: '/dashboard/provider/profile',
        actionLabel: 'Request Verification',
      },
    ]

    const requiredItems = items.filter(i => i.required)
    const optionalItems = items.filter(i => !i.required)
    const completedRequired = requiredItems.filter(i => i.completed).length
    const completedOptional = optionalItems.filter(i => i.completed).length

    // Weight: 70% required, 30% optional
    const requiredPercentage = requiredItems.length > 0 ? (completedRequired / requiredItems.length) * 70 : 70
    const optionalPercentage = optionalItems.length > 0 ? (completedOptional / optionalItems.length) * 30 : 30
    const overall = Math.round(requiredPercentage + optionalPercentage)

    return NextResponse.json({
      overall,
      items,
    })
  } catch (error) {
    console.error('Error fetching profile completion:', error)
    return NextResponse.json({ error: 'Failed to fetch profile completion' }, { status: 500 })
  }
}