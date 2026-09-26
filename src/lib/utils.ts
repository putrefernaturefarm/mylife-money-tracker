import { format, parseISO } from 'date-fns'

export function formatPeso(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy')
  } catch {
    return dateStr
  }
}

export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1, 1)
  return format(date, 'MMMM yyyy')
}

export function getBudgetStatus(pct: number) {
  if (pct >= 100) return { label: 'Over Budget', color: 'text-red-600', bg: 'bg-red-500', barColor: 'bg-red-500' }
  if (pct >= 90) return { label: 'Near Limit', color: 'text-orange-600', bg: 'bg-orange-100', barColor: 'bg-orange-500' }
  if (pct >= 70) return { label: 'Warning', color: 'text-amber-600', bg: 'bg-amber-100', barColor: 'bg-amber-500' }
  return { label: 'On Track', color: 'text-green-600', bg: 'bg-green-100', barColor: 'bg-green-500' }
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function currentMonthYear() {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}
