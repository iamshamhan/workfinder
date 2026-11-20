import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProviderProfileCompletionPage from '@/components/dashboard/ProviderProfileCompletionPage'

export const metadata: Metadata = {
  title: 'Profile Completion',
  description: 'Complete your provider profile to get more visibility',
}

export default async function ProviderProfileCompletionPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/provider/profile-completion')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'provider' || profile.status !== 'active') {
    redirect('/dashboard/customer')
  }

  return <ProviderProfileCompletionPage userId={user.id} />
}