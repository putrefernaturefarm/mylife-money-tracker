import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { TransactionsClient } from '@/components/transactions/TransactionsClient'
import { getTransactions } from '@/lib/data'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; type?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const limit = 20
  const offset = (page - 1) * limit

  const { data, count } = await getTransactions({
    area: params.area as never,
    type: params.type as never,
    search: params.search,
    limit,
    offset,
  })

  return (
    <>
      <Header title="Transactions" />
      <Suspense>
        <TransactionsClient
          transactions={data}
          total={count}
          page={page}
          limit={limit}
          filters={params}
        />
      </Suspense>
    </>
  )
}
