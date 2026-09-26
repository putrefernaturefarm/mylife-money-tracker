import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { SavingsClient } from '@/components/savings/SavingsClient'
import { getSavingsGoals } from '@/lib/data'

export default async function SavingsPage() {
  const goals = await getSavingsGoals()

  return (
    <>
      <Header title="Savings Goals" showBack />
      <Suspense>
        <SavingsClient goals={goals} />
      </Suspense>
    </>
  )
}
