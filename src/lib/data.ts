import { createClient } from './supabase/server'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import type { AreaSummary, Transaction } from '@/types/database'
import { AREAS, type Area } from './constants'

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  // Fetch all transactions (for total balance) and current month
  const [allTx, monthTx, accounts] = await Promise.all([
    supabase.from('transactions').select('*').eq('user_id', user.id).neq('type', 'transfer'),
    supabase.from('transactions').select('*').eq('user_id', user.id).neq('type', 'transfer')
      .gte('transaction_date', monthStart).lte('transaction_date', monthEnd),
    supabase.from('accounts').select('*').eq('user_id', user.id),
  ])

  const all = (allTx.data ?? []) as Transaction[]
  const month = (monthTx.data ?? []) as Transaction[]

  const totalIncome = all.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const monthIncome = month.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthExpenses = month.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const availableBalance = (accounts.data ?? []).reduce((s: number, a) => s + (a.current_balance ?? 0), 0)

  const areaSummaries: AreaSummary[] = AREAS.map(area => {
    const areaAll = all.filter(t => t.area === area)
    const income = areaAll.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expenses = areaAll.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { area, income, expenses, balance: income - expenses }
  })

  const recentTransactions = all
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 5)

  return {
    totalIncome,
    totalExpenses,
    netCashFlow: totalIncome - totalExpenses,
    availableBalance,
    monthIncome,
    monthExpenses,
    monthNet: monthIncome - monthExpenses,
    areaSummaries,
    recentTransactions,
    user,
  }
}

export async function getTransactions(filters?: {
  area?: Area
  type?: 'income' | 'expense'
  search?: string
  startDate?: string
  endDate?: string
  paymentMethod?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], count: 0 }

  let query = supabase.from('transactions').select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .neq('type', 'transfer')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.area) query = query.eq('area', filters.area)
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.startDate) query = query.gte('transaction_date', filters.startDate)
  if (filters?.endDate) query = query.lte('transaction_date', filters.endDate)
  if (filters?.paymentMethod) query = query.eq('payment_method', filters.paymentMethod)
  if (filters?.search) {
    query = query.or(`description.ilike.%${filters.search}%,category.ilike.%${filters.search}%,payee.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
  }
  if (filters?.limit) query = query.limit(filters.limit)
  if (filters?.offset) query = query.range(filters.offset, (filters.offset + (filters.limit ?? 20)) - 1)

  const { data, count } = await query
  return { data: (data ?? []) as Transaction[], count: count ?? 0 }
}

export async function getMonthlyReport(month: number, year: number, area?: Area) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const monthStr = String(month).padStart(2, '0')
  const startDate = `${year}-${monthStr}-01`
  const endDate = `${year}-${monthStr}-31`

  let query = supabase.from('transactions').select('*')
    .eq('user_id', user.id)
    .neq('type', 'transfer')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)

  if (area) query = query.eq('area', area)

  const { data } = await query
  const transactions = (data ?? []) as Transaction[]

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const expenseByCategory: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category ?? 'Other'
    expenseByCategory[cat] = (expenseByCategory[cat] ?? 0) + t.amount
  })

  return { income, expenses, net: income - expenses, expenseByCategory, transactions }
}

export async function getAccounts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('accounts').select('*').eq('user_id', user.id).order('created_at')
  return data ?? []
}

export async function getCateringEvents() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const [eventsRes, paymentsRes] = await Promise.all([
    supabase.from('catering_events').select('*').eq('user_id', user.id).order('event_date', { ascending: false }),
    supabase.from('catering_payments').select('event_id, amount').eq('user_id', user.id),
  ])
  const events = eventsRes.data ?? []
  const payments = paymentsRes.data ?? []
  return events.map(e => ({
    ...e,
    amount_paid: payments.filter(p => p.event_id === e.id).reduce((s: number, p) => s + p.amount, 0),
  }))
}

export async function getBudgets(month: number, year: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('budgets').select('*')
    .eq('user_id', user.id).eq('month', month).eq('year', year)
  return data ?? []
}

export async function getSavingsGoals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('savings_goals').select('*').eq('user_id', user.id).order('created_at')
  return data ?? []
}

export async function getDebts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('debts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  return data ?? []
}

export async function getRecurringTransactions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('recurring_transactions').select('*').eq('user_id', user.id).order('created_at')
  return data ?? []
}
