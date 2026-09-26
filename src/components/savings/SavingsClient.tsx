'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, PiggyBank } from 'lucide-react'
import { formatPeso, formatDate } from '@/lib/utils'
import { createSavingsGoal, updateSavingsGoal } from '@/lib/actions'

interface SavingsGoal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  created_at: string
}

interface Props {
  goals: SavingsGoal[]
}

export function SavingsClient({ goals }: Props) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createSavingsGoal(formData)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setShowAdd(false)
        router.refresh()
      }
    })
  }

  function handleAddMoney(goalId: string, currentAmount: number) {
    if (!addAmount || parseFloat(addAmount) <= 0) return
    setError('')
    const formData = new FormData()
    formData.set('current_amount', String(currentAmount + parseFloat(addAmount)))
    startTransition(async () => {
      const result = await updateSavingsGoal(goalId, formData)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setAddingTo(null)
        setAddAmount('')
        router.refresh()
      }
    })
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Summary */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-100">
        <p className="text-xs text-gray-500 mb-1">Total Saved</p>
        <p className="text-2xl font-bold text-rose-600">{formatPeso(totalSaved)}</p>
        <p className="text-xs text-gray-400 mt-0.5">of {formatPeso(totalTarget)} target across {goals.length} goal{goals.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Add button */}
      <button
        onClick={() => { setShowAdd(true); setError('') }}
        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl text-sm font-medium"
      >
        <Plus size={16} /> New Savings Goal
      </button>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <PiggyBank size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No savings goals yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(goal => {
            const pct = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0
            const remaining = Math.max(goal.target_amount - goal.current_amount, 0)
            const isComplete = goal.current_amount >= goal.target_amount
            return (
              <div key={goal.id} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{goal.name}</p>
                    {goal.target_date && (
                      <p className="text-xs text-gray-400">Target: {formatDate(goal.target_date)}</p>
                    )}
                  </div>
                  {isComplete && (
                    <span className="flex-shrink-0 ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      Completed! 🎉
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">{formatPeso(goal.current_amount)} saved</span>
                  <span className="font-medium text-gray-700">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {isComplete ? 'Goal reached!' : `${formatPeso(remaining)} to go · target ${formatPeso(goal.target_amount)}`}
                  </p>
                  {!isComplete && (
                    addingTo === goal.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={addAmount}
                          onChange={e => setAddAmount(e.target.value)}
                          placeholder="₱"
                          className="w-20 px-2 py-1 rounded-lg border border-gray-200 text-xs"
                        />
                        <button
                          onClick={() => handleAddMoney(goal.id, goal.current_amount)}
                          disabled={isPending}
                          className="text-xs text-white bg-rose-500 px-2.5 py-1 rounded-lg disabled:opacity-60"
                        >
                          Add
                        </button>
                        <button onClick={() => { setAddingTo(null); setAddAmount('') }} className="text-xs text-gray-400">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingTo(goal.id)}
                        className="text-xs text-rose-600 font-medium"
                      >
                        + Add Money
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Goal modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">New Savings Goal</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Goal Name *</label>
                <input name="name" required placeholder="e.g. Emergency Fund, New Laptop"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Target Amount (₱) *</label>
                <input type="number" name="target_amount" step="0.01" min="1" required placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Current Savings (₱)</label>
                <input type="number" name="current_amount" step="0.01" min="0" defaultValue="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Target Date</label>
                <input type="date" name="target_date"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50" />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={isPending}
                className="w-full py-3.5 bg-rose-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
