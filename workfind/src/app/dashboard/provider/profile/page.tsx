import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProviderProfilePage from '@/components/dashboard/ProviderProfilePage'

export const metadata: Metadata = {
  title: 'Edit Provider Profile',
  description: 'Manage your provider profile information',
}

export default async function ProviderProfilePageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/provider/profile')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'provider' || profile.status !== 'active') {
    redirect('/dashboard/customer')
  }

  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return <ProviderProfilePage providerProfile={providerProfile} />
}