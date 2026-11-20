import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProviderJobRequestsPage from '@/components/dashboard/ProviderJobRequestsPage'

export const metadata: Metadata = {
  title: 'Job Requests',
  description: 'View and bid on matching job requests',
}

export default async function ProviderJobRequestsPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/provider/job-requests')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'provider' || profile.status !== 'active') {
    redirect('/dashboard/customer')
  }

  return <ProviderJobRequestsPage userId={user.id} />
}