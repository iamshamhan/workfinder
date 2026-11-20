import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProviderEnquiriesPage from '@/components/dashboard/ProviderEnquiriesPage'

export const metadata: Metadata = {
  title: 'Enquiries',
  description: 'Manage incoming enquiries from customers',
}

export default async function ProviderEnquiriesPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/provider/enquiries')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'provider' || profile.status !== 'active') {
    redirect('/dashboard/customer')
  }

  return <ProviderEnquiriesPage userId={user.id} />
}