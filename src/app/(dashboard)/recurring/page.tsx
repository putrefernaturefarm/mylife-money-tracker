import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { RecurringClient } from '@/components/recurring/RecurringClient'
import { getRecurringTransactions } from '@/lib/data'

export default async function RecurringPage() {
  const recurring = await getRecurringTransactions()

  return (
    <>
      <Header title="Recurring" showBack />
      <Suspense>
        <RecurringClient recurring={recurring} />
      </Suspense>
    </>
  )
}
