import { Header } from '@/components/layout/Header'
import { MoreClient } from '@/components/more/MoreClient'
import { createClient } from '@/lib/supabase/server'

export default async function MorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <Header title="More" />
      <MoreClient userEmail={user?.email ?? ''} />
    </>
  )
}
