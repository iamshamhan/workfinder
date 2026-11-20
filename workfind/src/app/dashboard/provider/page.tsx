import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import ProviderDashboard from '@/components/dashboard/ProviderDashboard'

export const metadata: Metadata = {
  title: 'Provider Dashboard',
  description: 'Manage your business, listings, and enquiries',
}

export default async function ProviderDashboardPage() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/provider')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'provider' || profile.status !== 'active') {
    redirect('/dashboard/customer')
  }

  return <ProviderDashboard userId={user.id} />
}