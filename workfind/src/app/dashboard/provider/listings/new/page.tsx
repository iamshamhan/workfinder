import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateListingPage from '@/components/dashboard/CreateListingPage'

export const metadata: Metadata = {
  title: 'Create New Listing',
  description: 'Create a new service listing for your business',
}

export default async function CreateListingPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/provider/listings/new')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'provider' || profile.status !== 'active') {
    redirect('/dashboard/customer')
  }

  // Fetch categories for the form
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('display_order')

  // Fetch subcategories
  const { data: subcategories } = await supabase
    .from('subcategories')
    .select('id, name, slug, category_id')
    .eq('is_active', true)
    .order('display_order')

  // Fetch provider profile for defaults
  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('business_name, district, city, service_delivery_types')
    .eq('user_id', user.id)
    .single()

  return <CreateListingPage
    categories={categories || []}
    subcategories={subcategories || []}
    providerProfile={providerProfile}
  />
}