import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomerSavedPage from '@/components/dashboard/customer/CustomerSavedPage'

export const metadata: Metadata = {
  title: 'Saved Providers',
  description: 'Manage your saved service providers',
}

export default async function CustomerSavedPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/customer/saved')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'customer' || profile.status !== 'active') {
    redirect('/dashboard/provider')
  }

  return <CustomerSavedPage userId={user.id} />
}