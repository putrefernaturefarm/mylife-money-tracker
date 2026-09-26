import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { ReportsClient } from '@/components/reports/ReportsClient'
import { getMonthlyReport } from '@/lib/data'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const month = parseInt(params.month ?? String(now.getMonth() + 1))
  const year = parseInt(params.year ?? String(now.getFullYear()))

  const report = await getMonthlyReport(month, year)

  return (
    <>
      <Header title="Reports" />
      <Suspense>
        <ReportsClient report={report} month={month} year={year} />
      </Suspense>
    </>
  )
}
