import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomerProfilePage from '@/components/dashboard/customer/CustomerProfilePage'

export const metadata: Metadata = {
  title: 'Edit Profile',
  description: 'Manage your customer profile information',
}

export default async function CustomerProfilePageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/customer/profile')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'customer' || profile.status !== 'active') {
    redirect('/dashboard/provider')
  }

  return <CustomerProfilePage userId={user.id} />
}