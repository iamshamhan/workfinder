import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomerDashboard from '@/components/dashboard/customer/CustomerDashboard'

export const metadata: Metadata = {
  title: 'Customer Dashboard',
  description: 'Manage your profile, saved providers, enquiries, and job requests',
}

export default async function CustomerDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/customer')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'customer' || profile.status !== 'active') {
    redirect('/dashboard/provider')
  }

  return <CustomerDashboard userId={user.id} />
}