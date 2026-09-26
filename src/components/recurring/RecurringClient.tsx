'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, RefreshCw } from 'lucide-react'
import { formatPeso } from '@/lib/utils'
import { AREAS, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, FREQUENCIES, type Area } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

interface Recurring {
  id: string
  type: string
  area: string
  category: string
  amount: number
  description: string | null
  frequency: string
  next_date: string | null
  active: boolean
  payment_method: string | null
}

interface Props {
  recurring: Recurring[]
}

export function RecurringClient({ recurring }: Props) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [area, setArea] = useState<Area>('House')
  const [category, setCategory] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const categories = type === 'income' ? INCOME_CATEGORIES[area] : EXPENSE_CATEGORIES[area]

  async function handleToggle(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('recurring_transactions').update({ active: !current }).eq('id', id)
    router.refresh()
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!category) { setError('Please select a category'); return }
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not logged in'); return }
      const { error: err } = await supabase.from('recurring_transactions').insert({
        user_id: user.id,
        type,
        area,
        category,
        amount: parseFloat(String(formData.get('amount') ?? '0')),
        description: String(formData.get('description') ?? '') || null,
        frequency: String(formData.get('frequency') ?? 'Monthly'),
        next_date: String(formData.get('next_date') ?? '') || new Date().toISOString().split('T')[0],
        payment_method: String(formData.get('payment_method') ?? '') || null,
        active: true,
      })
      if (err) {
        setError(err.message)
      } else {
        setShowAdd(false)
        router.refresh()
      }
    })
  }

  const active = recurring.filter(r => r.active)
  const inactive = recurring.filter(r => !r.active)

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={() => { setShowAdd(true); setError('') }}
        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl text-sm font-medium"
      >
        <Plus size={16} /> Add Recurring Transaction
      </button>

      {recurring.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <RefreshCw size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No recurring transactions</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active ({active.length})</p>
              <div className="space-y-2">
                {active.map(r => (
                  <RecurringRow key={r.id} r={r} onToggle={handleToggle} />
                ))}
              </div>
            </div>
          )}
          {inactive.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Paused ({inactive.length})</p>
              <div className="space-y-2 opacity-60">
                {inactive.map(r => (
                  <RecurringRow key={r.id} r={r} onToggle={handleToggle} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Add Recurring Transaction</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex rounded-xl bg-gray-100 p-1">
                {(['expense', 'income'] as const).map(t => (
                  <button key={t} type="button" onClick={() => { setType(t); setCategory('') }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      type === t ? t === 'expense' ? 'bg-red-500 text-white' : 'bg-green-500 text-white' : 'text-gray-500'
                    }`}>
                    {t === 'expense' ? '- Expense' : '+ Income'}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Amount (₱) *</label>
                <input type="number" name="amount" step="0.01" min="0.01" required placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Area</label>
                <div className="grid grid-cols-5 gap-1">
                  {AREAS.map(a => (
                    <button key={a} type="button" onClick={() => { setArea(a); setCategory('') }}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${area === a ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {a.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Category *</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {categories.slice(0, 9).map(cat => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`py-2 px-1 rounded-xl text-xs font-medium text-center leading-tight transition-all ${
                        category === cat ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Description</label>
                <input name="description" placeholder="What is this recurring charge?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Frequency</label>
                  <select name="frequency"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50">
                    {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Next Date</label>
                  <input type="date" name="next_date"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Payment Method</label>
                <select name="payment_method"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50">
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={isPending}
                className="w-full py-3.5 bg-rose-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Save Recurring
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function RecurringRow({ r, onToggle }: { r: Recurring; onToggle: (id: string, current: boolean) => void }) {
  return (
    <div className="bg-white rounded-xl p-3.5 border border-gray-100 flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 truncate">{r.description ?? r.category}</p>
        <p className="text-xs text-gray-400">{r.area} · {r.category} · {r.frequency}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
        <p className={`text-sm font-semibold ${r.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
          {r.type === 'income' ? '+' : '-'}{formatPeso(r.amount)}
        </p>
        <button
          onClick={() => onToggle(r.id, r.active ?? true)}
          className={`w-10 h-6 rounded-full transition-all ${r.active ? 'bg-rose-500' : 'bg-gray-200'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow transition-all mx-auto ${r.active ? 'translate-x-2' : '-translate-x-2'}`} />
        </button>
      </div>
    </div>
  )
}
