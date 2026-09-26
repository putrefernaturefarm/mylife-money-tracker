import { Suspense } from 'react'
import { AddTransactionForm } from '@/components/transactions/AddTransactionForm'
import { getAccounts } from '@/lib/data'
import { Header } from '@/components/layout/Header'

export default async function AddPage() {
  const accounts = await getAccounts()
  return (
    <>
      <Header title="Add Transaction" showBack />
      <div className="px-4 py-4">
        <Suspense>
          <AddTransactionForm accounts={accounts} />
        </Suspense>
      </div>
    </>
  )
}
