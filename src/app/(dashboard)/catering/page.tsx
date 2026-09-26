import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { CateringClient } from '@/components/catering/CateringClient'
import { getCateringEvents } from '@/lib/data'

export default async function CateringPage() {
  const events = await getCateringEvents()

  return (
    <>
      <Header title="Catering Events" />
      <Suspense>
        <CateringClient events={events} />
      </Suspense>
    </>
  )
}
