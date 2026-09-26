import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { DebtsClient } from '@/components/debts/DebtsClient'
import { getDebts } from '@/lib/data'

export default async function DebtsPage() {
  const debts = await getDebts()

  return (
    <>
      <Header title="Debts & Lending" showBack />
      <Suspense>
        <DebtsClient debts={debts} />
      </Suspense>
    </>
  )
}
