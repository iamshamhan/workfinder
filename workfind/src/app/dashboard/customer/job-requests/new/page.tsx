import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateJobRequestPage from '@/components/dashboard/customer/CreateJobRequestPage'

export const metadata: Metadata = {
  title: 'Create Job Request',
  description: 'Post a new job request and receive quotes from verified providers',
}

export default async function CreateJobRequestPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/customer/job-requests/new')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'customer' || profile.status !== 'active') {
    redirect('/dashboard/provider')
  }

  // Fetch categories and subcategories for the form
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('display_order')

  const { data: subcategories } = await supabase
    .from('subcategories')
    .select('id, name, slug, category_id')
    .eq('is_active', true)
    .order('display_order')

  return <CreateJobRequestPage
    categories={categories || []}
    subcategories={subcategories || []}
  />
}