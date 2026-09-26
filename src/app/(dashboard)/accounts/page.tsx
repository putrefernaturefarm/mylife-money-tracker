import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { AccountsClient } from '@/components/accounts/AccountsClient'
import { getAccounts } from '@/lib/data'

export default async function AccountsPage() {
  const accounts = await getAccounts()

  return (
    <>
      <Header title="Accounts & Wallet" />
      <Suspense>
        <AccountsClient accounts={accounts} />
      </Suspense>
    </>
  )
}
