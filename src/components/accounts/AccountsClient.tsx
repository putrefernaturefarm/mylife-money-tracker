'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ArrowLeftRight, Wallet, CreditCard, Banknote, Smartphone, X, Loader2 } from 'lucide-react'
import { formatPeso } from '@/lib/utils'
import { createAccount, transferFunds } from '@/lib/actions'
import { ACCOUNT_TYPES } from '@/lib/constants'
import type { Account } from '@/types/database'

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  Cash: Banknote,
  GCash: Smartphone,
  Bank: CreditCard,
  Maya: Smartphone,
  'Credit Card': CreditCard,
  Other: Wallet,
}

interface Props {
  accounts: Account[]
}

export function AccountsClient({ accounts }: Props) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const totalBalance = accounts.reduce((s, a) => s + (a.current_balance ?? 0), 0)

  function handleAddAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createAccount(formData)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setShowAdd(false)
        router.refresh()
      }
    })
  }

  function handleTransfer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    if (formData.get('from_account_id') === formData.get('to_account_id')) {
      setError('Cannot transfer to the same account')
      return
    }
    startTransition(async () => {
      const result = await transferFunds(formData)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setShowTransfer(false)
        router.refresh()
      }
    })
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Total balance card */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white">
        <p className="text-sm text-rose-100 mb-1">Total Balance</p>
        <p className="text-3xl font-bold">{formatPeso(totalBalance)}</p>
        <p className="text-xs text-rose-200 mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => { setShowAdd(true); setError('') }}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl text-sm font-medium"
        >
          <Plus size={16} /> Add Account
        </button>
        {accounts.length >= 2 && (
          <button
            onClick={() => { setShowTransfer(true); setError('') }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium"
          >
            <ArrowLeftRight size={16} /> Transfer
          </button>
        )}
      </div>

      {/* Accounts list */}
      {accounts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Wallet size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No accounts yet</p>
          <p className="text-xs mt-1">Add your cash, GCash, or bank accounts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map(account => {
            const IconComponent = ACCOUNT_ICONS[account.type] ?? Wallet
            return (
              <div key={account.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                    <IconComponent size={20} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{account.name}</p>
                    <p className="text-xs text-gray-400">{account.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${(account.current_balance ?? 0) >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
                    {formatPeso(account.current_balance ?? 0)}
                  </p>
                  {account.opening_balance !== account.current_balance && (
                    <p className="text-xs text-gray-400">
                      Started: {formatPeso(account.opening_balance ?? 0)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Account modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Add Account</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Account Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. BDO Savings, My GCash"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Type *</label>
                <select
                  name="type"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50"
                >
                  {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Opening Balance (₱)</label>
                <input
                  name="opening_balance"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue="0"
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
                Add Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transfer modal */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Transfer Funds</h3>
              <button onClick={() => setShowTransfer(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">From Account</label>
                <select
                  name="from_account_id"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} — {formatPeso(a.current_balance ?? 0)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">To Account</label>
                <select
                  name="to_account_id"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} — {formatPeso(a.current_balance ?? 0)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Amount (₱) *</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Notes</label>
                <input
                  name="notes"
                  placeholder="Optional notes"
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
                Transfer Funds
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
