'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Target } from 'lucide-react'
import { formatPeso } from '@/lib/utils'
import { AREAS, EXPENSE_CATEGORIES, AREA_ICONS, type Area } from '@/lib/constants'
import { saveBudget } from '@/lib/actions'
import type { Transaction } from '@/types/database'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface Budget {
  id: string
  area: string | null
  category: string | null
  amount: number
  month: number
  year: number
}

interface Props {
  budgets: Budget[]
  report: { income: number; expenses: number; net: number; expenseByCategory: Record<string, number>; transactions: Transaction[] } | null
  month: number
  year: number
}

function getBudgetStatus(pct: number) {
  if (pct >= 100) return { label: 'Over Budget', bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50 border-red-200' }
  if (pct >= 90) return { label: 'Near Limit', bar: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' }
  if (pct >= 70) return { label: 'Getting Close', bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' }
  return { label: 'On Track', bar: 'bg-green-500', text: 'text-green-600', bg: 'bg-white border-gray-100' }
}

export function BudgetClient({ budgets, report, month, year }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [showForm, setShowForm] = useState(false)
  const [formArea, setFormArea] = useState<Area>('House')
  const [formCategory, setFormCategory] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function navigate(delta: number) {
    let m = month + delta
    let y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    router.push(`${pathname}?month=${m}&year=${y}`)
  }

  const actual = report?.expenseByCategory ?? {}

  // Build area-level budget items
  const areaBudgets = AREAS.map(area => {
    const budget = budgets.find(b => b.area === area && !b.category)
    const transactions = report?.transactions ?? []
    const spent = transactions.filter(t => t.type === 'expense' && t.area === area).reduce((s, t) => s + t.amount, 0)
    return { area, budget: budget?.amount ?? 0, spent }
  }).filter(a => a.budget > 0)

  // Category-level budgets
  const catBudgets = budgets
    .filter(b => b.category)
    .map(b => ({
      ...b,
      spent: actual[b.category!] ?? 0,
    }))

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    formData.set('month', String(month))
    formData.set('year', String(year))
    if (formCategory) {
      formData.set('category', formCategory)
    }
    startTransition(async () => {
      const result = await saveBudget(formData)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setShowForm(false)
        router.refresh()
      }
    })
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Month navigator */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-gray-100">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <p className="font-semibold text-gray-900">{MONTHS[month - 1]} {year}</p>
        <button onClick={() => navigate(1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Add budget button */}
      <button
        onClick={() => { setShowForm(true); setError('') }}
        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl text-sm font-medium"
      >
        <Plus size={16} /> Set Budget
      </button>

      {/* Area budgets */}
      {areaBudgets.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">By Area</p>
          <div className="space-y-2">
            {areaBudgets.map(({ area, budget, spent }) => {
              const pct = budget > 0 ? Math.min((spent / budget) * 100, 110) : 0
              const status = getBudgetStatus((spent / budget) * 100)
              return (
                <div key={area} className={`rounded-xl p-3.5 border ${status.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{AREA_ICONS[area as Area]}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{area}</p>
                        <p className={`text-xs ${status.text}`}>{status.label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">{formatPeso(spent)}</p>
                      <p className="text-xs text-gray-400">of {formatPeso(budget)}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${status.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {formatPeso(Math.max(budget - spent, 0))} remaining
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Category budgets */}
      {catBudgets.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">By Category</p>
          <div className="space-y-2">
            {catBudgets.map(b => {
              const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0
              const status = getBudgetStatus(pct)
              return (
                <div key={b.id} className={`rounded-xl p-3.5 border ${status.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{b.category}</p>
                      <p className="text-xs text-gray-400">{b.area}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">{formatPeso(b.spent)}</p>
                      <p className="text-xs text-gray-400">of {formatPeso(b.amount)}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${status.bar} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {areaBudgets.length === 0 && catBudgets.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Target size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No budgets set for this month</p>
          <p className="text-xs mt-1">Tap "Set Budget" to get started</p>
        </div>
      )}

      {/* Budget form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Set Budget</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Area *</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {AREAS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => { setFormArea(a); setFormCategory('') }}
                      className={`py-2 rounded-xl text-xs font-medium text-center transition-all ${
                        formArea === a ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {AREA_ICONS[a]}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="area" value={formArea} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Category (optional)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormCategory('')}
                    className={`py-2 px-1 rounded-xl text-xs font-medium text-center transition-all ${
                      formCategory === '' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    All {formArea}
                  </button>
                  {EXPENSE_CATEGORIES[formArea].slice(0, 11).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={`py-2 px-1 rounded-xl text-xs font-medium text-center leading-tight transition-all ${
                        formCategory === cat ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Budget Amount (₱) *</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-rose-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Save Budget
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
