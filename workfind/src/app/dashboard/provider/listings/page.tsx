import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProviderListingsPage from '@/components/dashboard/ProviderListingsPage'

export const metadata: Metadata = {
  title: 'My Listings',
  description: 'Manage your service listings',
}

export default async function ProviderListingsPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/provider/listings')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'provider' || profile.status !== 'active') {
    redirect('/dashboard/customer')
  }

  const { data: listings } = await supabase
    .from('service_listings')
    .select('*')
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  return <ProviderListingsPage listings={listings || []} />
}