import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProviderReviewsPage from '@/components/dashboard/ProviderReviewsPage'

export const metadata: Metadata = {
  title: 'Reviews',
  description: 'Manage and respond to customer reviews',
}

export default async function ProviderReviewsPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/provider/reviews')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'provider' || profile.status !== 'active') {
    redirect('/dashboard/customer')
  }

  return <ProviderReviewsPage userId={user.id} />
}