import { redirect } from 'next/navigation'
import { getDashboardData } from '@/lib/data'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const data = await getDashboardData()
  if (!data) redirect('/login')
  return <DashboardClient data={data} />
}
