import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomerEnquiriesPage from '@/components/dashboard/customer/CustomerEnquiriesPage'

export const metadata: Metadata = {
  title: 'My Enquiries',
  description: 'Manage your enquiries with service providers',
}

export default async function CustomerEnquiriesPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/customer/enquiries')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'customer' || profile.status !== 'active') {
    redirect('/dashboard/provider')
  }

  return <CustomerEnquiriesPage userId={user.id} />
}