'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { TrendingUp, TrendingDown, Plus, Utensils, Sprout } from 'lucide-react'
import { formatPeso, getGreeting } from '@/lib/utils'
import { AREA_ICONS, AREA_BG, AREA_ACCENT, type Area } from '@/lib/constants'
import type { DashboardData, Transaction } from '@/types/database'

interface Props {
  data: NonNullable<Awaited<ReturnType<typeof import('@/lib/data').getDashboardData>>>
}

export function DashboardClient({ data }: Props) {
  const { monthIncome, monthExpenses, monthNet, availableBalance, areaSummaries, recentTransactions, user } = data
  const now = new Date()
  const greeting = getGreeting()
  const userName = (user.user_metadata?.full_name as string)?.split(' ')[0] ?? 'there'

  return (
    <div className="px-4 pt-6 pb-4 space-y-6">
      {/* Header greeting */}
      <div>
        <p className="text-sm text-gray-500">{greeting} ❤️</p>
        <h2 className="text-lg font-semibold text-gray-900">{userName}</h2>
        <p className="text-sm text-gray-400">{format(now, 'MMMM yyyy')}</p>
      </div>

      {/* Main balance card */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg shadow-rose-100">
        <p className="text-rose-100 text-sm mb-1">Available Balance</p>
        <p className="text-3xl font-bold mb-4">{formatPeso(availableBalance)}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/15 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-green-300" />
              <p className="text-xs text-rose-100">Income</p>
            </div>
            <p className="text-base font-semibold">{formatPeso(monthIncome)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={14} className="text-red-300" />
              <p className="text-xs text-rose-100">Expenses</p>
            </div>
            <p className="text-base font-semibold">{formatPeso(monthExpenses)}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center">
          <p className="text-xs text-rose-100">This month's net</p>
          <p className={`text-sm font-semibold ${monthNet >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {monthNet >= 0 ? '+' : ''}{formatPeso(monthNet)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: '/add?type=expense', label: '+ Expense', color: 'bg-red-50 text-red-600' },
            { href: '/add?type=income', label: '+ Income', color: 'bg-green-50 text-green-600' },
            { href: '/catering/new', label: '+ Catering', color: 'bg-purple-50 text-purple-600' },
            { href: '/add?type=income&area=Farm', label: '+ Farm', color: 'bg-green-50 text-green-700' },
          ].map(({ href, label, color }) => (
            <Link
              key={href}
              href={href}
              className={`${color} rounded-xl p-2 text-center text-xs font-medium leading-tight active:scale-95 transition-transform`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Area summaries */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Where Did The Money Go?</p>
        <div className="space-y-2">
          {areaSummaries.map(({ area, income, expenses, balance }) => (
            <Link
              key={area}
              href={`/transactions?area=${area}`}
              className={`flex items-center justify-between p-3.5 rounded-xl border ${AREA_BG[area as Area]} active:scale-[0.99] transition-transform`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{AREA_ICONS[area as Area]}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{area}</p>
                  <p className="text-xs text-gray-400">In: {formatPeso(income)} · Out: {formatPeso(expenses)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${AREA_ACCENT[area as Area]}`}>{formatPeso(expenses)}</p>
                <p className="text-xs text-gray-400">spent</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      {recentTransactions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</p>
            <Link href="/transactions" className="text-xs text-rose-600 font-medium">See all</Link>
          </div>
          <div className="space-y-2">
            {recentTransactions.map(tx => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        </div>
      )}

      {recentTransactions.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-sm font-medium">No transactions yet</p>
          <p className="text-xs mt-1">Tap + to record your first transaction</p>
        </div>
      )}
    </div>
  )
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === 'income'
  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-50">
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isIncome ? 'bg-green-50' : 'bg-red-50'}`}>
          <span className="text-sm">{AREA_ICONS[tx.area as Area] ?? '💰'}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 leading-tight">{tx.description ?? tx.category ?? 'Transaction'}</p>
          <p className="text-xs text-gray-400">{tx.category} · {tx.area}</p>
        </div>
      </div>
      <p className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}{formatPeso(tx.amount)}
      </p>
    </div>
  )
}
