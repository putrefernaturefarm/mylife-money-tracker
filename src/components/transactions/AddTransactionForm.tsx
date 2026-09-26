'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createTransaction } from '@/lib/actions'
import { AREAS, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, type Area } from '@/lib/constants'
import { format } from 'date-fns'
import type { Account } from '@/types/database'

interface Props {
  accounts: Account[]
}

export function AddTransactionForm({ accounts }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = (searchParams.get('type') as 'income' | 'expense') ?? 'expense'
  const initialArea = (searchParams.get('area') as Area) ?? 'House'

  const [type, setType] = useState<'income' | 'expense'>(initialType)
  const [area, setArea] = useState<Area>(initialArea)
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [description, setDescription] = useState('')
  const [payee, setPayee] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [notes, setNotes] = useState('')
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const categories = type === 'income' ? INCOME_CATEGORIES[area] : EXPENSE_CATEGORIES[area]

  function handleAreaChange(newArea: Area) {
    setArea(newArea)
    setCategory('')
  }

  function handleTypeChange(newType: 'income' | 'expense') {
    setType(newType)
    setCategory('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!category) {
      setError('Please select a category')
      return
    }

    const formData = new FormData()
    formData.set('type', type)
    formData.set('area', area)
    formData.set('category', category)
    formData.set('amount', amount)
    formData.set('transaction_date', date)
    if (description) formData.set('description', description)
    if (payee) formData.set('payee', payee)
    formData.set('payment_method', paymentMethod)
    if (notes) formData.set('notes', notes)
    if (accountId) formData.set('account_id', accountId)

    startTransition(async () => {
      const result = await createTransaction(formData)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        router.push('/')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type toggle */}
      <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              type === t
                ? t === 'expense'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-green-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'expense' ? '- Expense' : '+ Income'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="text-center">
        <label className="block text-sm text-gray-500 mb-2">Amount (₱)</label>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          min="0.01"
          step="0.01"
          required
          className="w-full text-3xl font-bold text-center bg-transparent border-b-2 border-gray-200 focus:border-rose-400 outline-none pb-2 text-gray-900 placeholder:text-gray-200"
        />
      </div>

      {/* Area */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Area</label>
        <div className="grid grid-cols-5 gap-1.5">
          {AREAS.map(a => (
            <button
              key={a}
              type="button"
              onClick={() => handleAreaChange(a)}
              className={`py-2 rounded-xl text-xs font-medium text-center transition-all ${
                area === a ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {a === 'Catering' ? 'Catering' : a}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Category *</label>
        <div className="grid grid-cols-3 gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`py-2 px-1 rounded-xl text-xs font-medium text-center leading-tight transition-all ${
                category === cat ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Date *</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What is this for?"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50"
        />
      </div>

      {/* Payee / Vendor */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
          {type === 'income' ? 'Source' : 'Vendor / Person'}
        </label>
        <input
          type="text"
          value={payee}
          onChange={e => setPayee(e.target.value)}
          placeholder={type === 'income' ? 'Where did this come from?' : 'Who did you pay?'}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50"
        />
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50"
        >
          {PAYMENT_METHODS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Account (if any) */}
      {accounts.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Account</label>
          <select
            value={accountId}
            onChange={e => setAccountId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50"
          >
            <option value="">None</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
            ))}
          </select>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50 resize-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
          type === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {isPending && <Loader2 size={18} className="animate-spin" />}
        Save {type === 'expense' ? 'Expense' : 'Income'}
      </button>
    </form>
  )
}
