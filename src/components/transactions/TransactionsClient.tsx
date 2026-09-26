'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Trash2, Pencil, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPeso, formatDate } from '@/lib/utils'
import { AREAS, AREA_ICONS, type Area } from '@/lib/constants'
import { deleteTransaction } from '@/lib/actions'
import type { Transaction } from '@/types/database'
import { AddTransactionForm } from './AddTransactionForm'

interface Props {
  transactions: Transaction[]
  total: number
  page: number
  limit: number
  filters: { area?: string; type?: string; search?: string }
}

export function TransactionsClient({ transactions, total, page, limit, filters }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState(filters.search ?? '')
  const [showFilters, setShowFilters] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams()
    if (filters.area && key !== 'area') params.set('area', filters.area)
    if (filters.type && key !== 'type') params.set('type', filters.type)
    if (search && key !== 'search') params.set('search', search)
    if (value) params.set(key, value)
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateFilter('search', search)
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this transaction?')) return
    startTransition(async () => {
      await deleteTransaction(id)
      router.refresh()
    })
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
        />
      </form>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => updateFilter('area', '')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            !filters.area ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          All Areas
        </button>
        {AREAS.map(area => (
          <button
            key={area}
            onClick={() => updateFilter('area', area)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filters.area === area ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {AREA_ICONS[area]} {area}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2">
        {(['', 'income', 'expense'] as const).map(t => (
          <button
            key={t}
            onClick={() => updateFilter('type', t)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              (filters.type ?? '') === t
                ? t === 'income' ? 'bg-green-500 text-white'
                : t === 'expense' ? 'bg-red-500 text-white'
                : 'bg-rose-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t === '' ? 'All' : t === 'income' ? '+ Income' : '- Expense'}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">{total} transaction{total !== 1 ? 's' : ''}</p>

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between bg-white rounded-xl p-3.5 border border-gray-50 group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <span className="text-base">{AREA_ICONS[tx.area as Area] ?? '💰'}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {tx.description ?? tx.category ?? 'Transaction'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(tx.transaction_date)} · {tx.area} · {tx.category}
                  </p>
                  {tx.payment_method && (
                    <p className="text-xs text-gray-300">{tx.payment_method}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <p className={`text-sm font-semibold flex-shrink-0 mr-1 ${
                  tx.type === 'income' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{formatPeso(tx.amount)}
                </p>
                <button
                  onClick={() => setEditingTx(tx)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-blue-400 transition-all"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(tx.id)}
                  disabled={isPending}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              const params = new URLSearchParams(filters as Record<string, string>)
              params.set('page', String(page - 1))
              router.push(`${pathname}?${params.toString()}`)
            }}
            disabled={page <= 1}
            className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-30"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => {
              const params = new URLSearchParams(filters as Record<string, string>)
              params.set('page', String(page + 1))
              router.push(`${pathname}?${params.toString()}`)
            }}
            disabled={page >= totalPages}
            className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-30"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Edit bottom sheet */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditingTx(null)}
          />
          <div className="relative bg-white rounded-t-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Edit Transaction</h2>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-4 pb-8">
              <AddTransactionForm
                accounts={[]}
                transaction={editingTx}
                onSuccess={() => setEditingTx(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
