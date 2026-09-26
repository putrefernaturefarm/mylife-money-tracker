'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, HandCoins, TrendingUp } from 'lucide-react'
import { formatPeso, formatDate } from '@/lib/utils'
import { createDebt } from '@/lib/actions'

interface Debt {
  id: string
  type: string
  person: string
  amount: number
  purpose: string | null
  due_date: string | null
  status: string
  description: string | null
  created_at: string
}

interface Props {
  debts: Debt[]
}

export function DebtsClient({ debts }: Props) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [debtType, setDebtType] = useState<'we_owe' | 'owed_to_us'>('we_owe')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const weOwe = debts.filter(d => d.type === 'we_owe' && d.status === 'active')
  const oweUs = debts.filter(d => d.type === 'owed_to_us' && d.status === 'active')
  const paid = debts.filter(d => d.status === 'paid')

  const totalWeOwe = weOwe.reduce((s, d) => s + d.amount, 0)
  const totalOweUs = oweUs.reduce((s, d) => s + d.amount, 0)

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createDebt(formData)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setShowAdd(false)
        router.refresh()
      }
    })
  }

  function DebtCard({ debt }: { debt: Debt }) {
    return (
      <div className="bg-white rounded-xl p-3.5 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-800 truncate">{debt.person}</p>
            {debt.purpose && <p className="text-xs text-gray-500 truncate">{debt.purpose}</p>}
            {debt.due_date && <p className="text-xs text-gray-400 mt-0.5">Due: {formatDate(debt.due_date)}</p>}
          </div>
          <p className={`font-semibold ml-3 flex-shrink-0 ${debt.type === 'we_owe' ? 'text-red-500' : 'text-green-600'}`}>
            {formatPeso(debt.amount)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <HandCoins size={16} className="text-red-400 mx-auto mb-1" />
          <p className="text-[10px] text-gray-500 mb-0.5">We Owe</p>
          <p className="text-sm font-bold text-red-500">{formatPeso(totalWeOwe)}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <TrendingUp size={16} className="text-green-500 mx-auto mb-1" />
          <p className="text-[10px] text-gray-500 mb-0.5">Owed to Us</p>
          <p className="text-sm font-bold text-green-600">{formatPeso(totalOweUs)}</p>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => { setShowAdd(true); setError('') }}
        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl text-sm font-medium"
      >
        <Plus size={16} /> Add Debt Record
      </button>

      {/* We Owe */}
      {weOwe.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">We Owe ({weOwe.length})</p>
          <div className="space-y-2">
            {weOwe.map(d => <DebtCard key={d.id} debt={d} />)}
          </div>
        </div>
      )}

      {/* Owed to Us */}
      {oweUs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Owed to Us ({oweUs.length})</p>
          <div className="space-y-2">
            {oweUs.map(d => <DebtCard key={d.id} debt={d} />)}
          </div>
        </div>
      )}

      {weOwe.length === 0 && oweUs.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <HandCoins size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No active debts</p>
        </div>
      )}

      {/* Paid debts */}
      {paid.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Settled ({paid.length})</p>
          <div className="space-y-2">
            {paid.map(d => (
              <div key={d.id} className="bg-gray-50 rounded-xl p-3.5 opacity-60">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600 line-through">{d.person}</p>
                  <p className="text-sm text-gray-500 line-through">{formatPeso(d.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Debt modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Add Debt Record</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex rounded-xl bg-gray-100 p-1">
                {(['we_owe', 'owed_to_us'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDebtType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      debtType === t
                        ? t === 'we_owe' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                        : 'text-gray-500'
                    }`}
                  >
                    {t === 'we_owe' ? 'We Owe' : 'Owed to Us'}
                  </button>
                ))}
              </div>
              <input type="hidden" name="type" value={debtType} />
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                  {debtType === 'we_owe' ? 'Creditor (Who we owe)' : 'Debtor (Who owes us)'} *
                </label>
                <input name="person" required placeholder="Name of person or company"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Amount (₱) *</label>
                <input type="number" name="amount" step="0.01" min="0.01" required placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Purpose</label>
                <input name="purpose" placeholder="What is this for?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Due Date</label>
                <input type="date" name="due_date"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={isPending}
                className="w-full py-3.5 bg-rose-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
