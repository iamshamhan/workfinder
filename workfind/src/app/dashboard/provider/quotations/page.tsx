import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProviderQuotationsPage from '@/components/dashboard/ProviderQuotationsPage'

export const metadata: Metadata = {
  title: 'Quotations',
  description: 'Manage your sent quotations',
}

export default async function ProviderQuotationsPageWrapper() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/provider/quotations')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'provider' || profile.status !== 'active') {
    redirect('/dashboard/customer')
  }

  return <ProviderQuotationsPage userId={user.id} />
}