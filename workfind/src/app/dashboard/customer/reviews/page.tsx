import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomerReviewsPage from '@/components/dashboard/customer/CustomerReviewsPage'

export const metadata: Metadata = {
  title: 'My Reviews',
  description: 'Manage your reviews for service providers',
}

export default async function CustomerReviewsPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/customer/reviews')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'customer' || profile.status !== 'active') {
    redirect('/dashboard/provider')
  }

  return <CustomerReviewsPage userId={user.id} />
}