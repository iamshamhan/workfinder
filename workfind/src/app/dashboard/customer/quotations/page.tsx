import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomerQuotationsPage from '@/components/dashboard/customer/CustomerQuotationsPage'

export const metadata: Metadata = {
  title: 'Quotations',
  description: 'Compare and manage quotations for your job requests',
}

export default async function CustomerQuotationsPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/customer/quotations')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'customer' || profile.status !== 'active') {
    redirect('/dashboard/provider')
  }

  return <CustomerQuotationsPage userId={user.id} />
}