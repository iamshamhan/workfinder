import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProviderAnalyticsPage from '@/components/dashboard/ProviderAnalyticsPage'

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'View your business analytics and performance metrics',
}

export default async function ProviderAnalyticsPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/provider/analytics')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'provider' || profile.status !== 'active') {
    redirect('/dashboard/customer')
  }

  return <ProviderAnalyticsPage userId={user.id} />
}