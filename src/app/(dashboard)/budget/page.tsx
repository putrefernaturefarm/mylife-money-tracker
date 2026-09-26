import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { BudgetClient } from '@/components/budget/BudgetClient'
import { getBudgets, getMonthlyReport } from '@/lib/data'

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const month = parseInt(params.month ?? String(now.getMonth() + 1))
  const year = parseInt(params.year ?? String(now.getFullYear()))

  const [budgets, report] = await Promise.all([
    getBudgets(month, year),
    getMonthlyReport(month, year),
  ])

  return (
    <>
      <Header title="Budget" />
      <Suspense>
        <BudgetClient budgets={budgets} report={report} month={month} year={year} />
      </Suspense>
    </>
  )
}
