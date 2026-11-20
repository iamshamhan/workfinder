import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomerJobRequestsPage from '@/components/dashboard/customer/CustomerJobRequestsPage'

export const metadata: Metadata = {
  title: 'My Job Requests',
  description: 'Manage your job requests and received quotations',
}

export default async function CustomerJobRequestsPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/customer/job-requests')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'customer' || profile.status !== 'active') {
    redirect('/dashboard/provider')
  }

  return <CustomerJobRequestsPage userId={user.id} />
}