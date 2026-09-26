'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatPeso } from '@/lib/utils'
import { AREAS, AREA_ICONS, type Area } from '@/lib/constants'
import type { Transaction } from '@/types/database'

const AREA_HEX: Record<Area, string> = {
  Personal: '#f43f5e',
  House: '#3b82f6',
  Farm: '#22c55e',
  Business: '#f59e0b',
  Catering: '#a855f7',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface Report {
  income: number
  expenses: number
  net: number
  expenseByCategory: Record<string, number>
  transactions: Transaction[]
}

interface Props {
  report: Report | null
  month: number
  year: number
}

export function ReportsClient({ report, month, year }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function navigate(delta: number) {
    let m = month + delta
    let y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    router.push(`${pathname}?month=${m}&year=${y}`)
  }

  const transactions = report?.transactions ?? []

  const areaData = AREAS.map(area => ({
    name: area,
    icon: AREA_ICONS[area],
    income: transactions.filter(t => t.type === 'income' && t.area === area).reduce((s, t) => s + t.amount, 0),
    expense: transactions.filter(t => t.type === 'expense' && t.area === area).reduce((s, t) => s + t.amount, 0),
    color: AREA_HEX[area],
  }))

  const pieData = areaData.filter(a => a.expense > 0).map(a => ({
    name: a.name,
    value: a.expense,
    color: a.color,
    icon: a.icon,
  }))

  const topCategories = Object.entries(report?.expenseByCategory ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const maxCat = topCategories[0]?.[1] ?? 1

  const income = report?.income ?? 0
  const expenses = report?.expenses ?? 0
  const net = report?.net ?? 0

  return (
    <div className="px-4 py-4 space-y-5 pb-6">
      {/* Month navigator */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-gray-100">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-gray-900">{MONTHS[month - 1]} {year}</p>
        </div>
        <button
          onClick={() => navigate(1)}
          disabled={month === new Date().getMonth() + 1 && year === new Date().getFullYear()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <TrendingUp size={16} className="text-green-500 mx-auto mb-1" />
          <p className="text-[10px] text-gray-500 mb-0.5">Income</p>
          <p className="text-sm font-bold text-green-600">{formatPeso(income)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <TrendingDown size={16} className="text-red-500 mx-auto mb-1" />
          <p className="text-[10px] text-gray-500 mb-0.5">Expenses</p>
          <p className="text-sm font-bold text-red-500">{formatPeso(expenses)}</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${net >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <Minus size={16} className={`mx-auto mb-1 ${net >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
          <p className="text-[10px] text-gray-500 mb-0.5">Net</p>
          <p className={`text-sm font-bold ${net >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>{net >= 0 ? '+' : ''}{formatPeso(net)}</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm">No transactions this month</p>
        </div>
      ) : (
        <>
          {/* Income vs Expenses by Area bar chart */}
          {areaData.some(a => a.income > 0 || a.expense > 0) && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Income vs Expenses by Area</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={areaData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="icon" tick={{ fontSize: 16 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip
                    formatter={(v, name) => [formatPeso(Number(v ?? 0)), name === 'income' ? 'Income' : 'Expense']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f3f4f6' }}
                  />
                  <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs text-gray-500">Expenses</span>
                </div>
              </div>
            </div>
          )}

          {/* Expense by Area donut */}
          {pieData.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Expenses by Area</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatPeso(Number(v ?? 0))} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 min-w-0">
                  {pieData.map(entry => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                        <span className="text-xs text-gray-600 truncate">{entry.icon} {entry.name}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-800 ml-2 flex-shrink-0">{formatPeso(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top spending categories */}
          {topCategories.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Expense Categories</h3>
              <div className="space-y-3">
                {topCategories.map(([cat, amount]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">{cat}</span>
                      <span className="text-gray-800 font-semibold">{formatPeso(amount)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400 rounded-full transition-all"
                        style={{ width: `${(amount / maxCat) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
