import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProviderAvailabilityPage from '@/components/dashboard/ProviderAvailabilityPage'

export const metadata: Metadata = {
  title: 'Manage Availability',
  description: 'Set your weekly availability schedule',
}

export default async function ProviderAvailabilityPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/provider/availability')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'provider' || profile.status !== 'active') {
    redirect('/dashboard/customer')
  }

  return <ProviderAvailabilityPage userId={user.id} />
}