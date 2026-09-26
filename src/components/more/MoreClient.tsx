'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Wallet, ChefHat, PiggyBank, HandCoins, RefreshCw,
  BarChart3, LogOut, User, ChevronRight, Tractor, Loader2,
  Download, Moon, Sun
} from 'lucide-react'
import { signOut, exportTransactions } from '@/lib/actions'
import { useTheme } from '@/components/layout/ThemeProvider'

interface Props {
  userEmail: string
}

interface MenuSection {
  title: string
  items: {
    href?: string
    icon: React.ElementType
    label: string
    sublabel?: string
    color: string
    onClick?: () => void
    isButton?: boolean
    badge?: string
  }[]
}

export function MoreClient({ userEmail }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isDownloading, startDownload] = useTransition()
  const { theme, toggle } = useTheme()

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  function handleDownload() {
    startDownload(async () => {
      const result = await exportTransactions()
      if ('error' in result) return
      if (!result.csv) {
        alert('No transactions to export.')
        return
      }
      const blob = new Blob([result.csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  const sections: MenuSection[] = [
    {
      title: 'Finance Tools',
      items: [
        { href: '/accounts', icon: Wallet, label: 'Accounts & Wallet', sublabel: 'Manage your accounts and transfers', color: 'text-blue-500 bg-blue-50' },
        { href: '/budget', icon: BarChart3, label: 'Budget Planner', sublabel: 'Set monthly budgets by area', color: 'text-amber-500 bg-amber-50' },
        { href: '/savings', icon: PiggyBank, label: 'Savings Goals', sublabel: 'Track your savings progress', color: 'text-rose-500 bg-rose-50' },
        { href: '/debts', icon: HandCoins, label: 'Debts & Lending', sublabel: 'Track money owed and borrowed', color: 'text-red-500 bg-red-50' },
        { href: '/recurring', icon: RefreshCw, label: 'Recurring Transactions', sublabel: 'Manage regular income & expenses', color: 'text-indigo-500 bg-indigo-50' },
      ],
    },
    {
      title: 'Business Areas',
      items: [
        { href: '/catering', icon: ChefHat, label: 'Catering Events', sublabel: 'Events, contracts, and payments', color: 'text-purple-500 bg-purple-50' },
        { href: '/transactions?area=Farm', icon: Tractor, label: 'Farm Finances', sublabel: 'Farm income and expenses', color: 'text-green-500 bg-green-50' },
      ],
    },
    {
      title: 'Data & Settings',
      items: [
        {
          icon: Download,
          label: 'Download Data',
          sublabel: 'Export all transactions as CSV',
          color: 'text-teal-500 bg-teal-50',
          isButton: true,
          onClick: handleDownload,
        },
        {
          icon: theme === 'dark' ? Sun : Moon,
          label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
          sublabel: `Currently ${theme} mode`,
          color: theme === 'dark' ? 'text-yellow-500 bg-yellow-50' : 'text-slate-500 bg-slate-100',
          isButton: true,
          onClick: toggle,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: LogOut,
          label: 'Sign Out',
          sublabel: userEmail,
          color: 'text-gray-500 bg-gray-100',
          isButton: true,
          onClick: handleSignOut,
        },
      ],
    },
  ]

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Profile card */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 flex items-center gap-3 text-white">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <User size={22} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold">My Account</p>
          <p className="text-sm text-rose-100 truncate">{userEmail}</p>
        </div>
      </div>

      {/* Menu sections */}
      {sections.map(section => (
        <div key={section.title}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{section.title}</p>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {section.items.map((item, i) => {
              const Icon = item.icon
              const isThisDownloading = item.label === 'Download Data' && isDownloading
              const isThisSigningOut = item.label === 'Sign Out' && isPending

              const inner = (
                <>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    {item.sublabel && <p className="text-xs text-gray-400 truncate">{item.sublabel}</p>}
                  </div>
                  {(isThisDownloading || isThisSigningOut) ? (
                    <Loader2 size={16} className="text-gray-300 animate-spin" />
                  ) : item.isButton ? (
                    <ChevronRight size={16} className="text-gray-300" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-300" />
                  )}
                </>
              )

              if (item.isButton) {
                return (
                  <button
                    key={i}
                    onClick={item.onClick}
                    disabled={isThisDownloading || isThisSigningOut}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left disabled:opacity-60"
                  >
                    {inner}
                  </button>
                )
              }

              return (
                <Link key={i} href={item.href!} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
                  {inner}
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      {/* App info */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-300">MyLife Money Tracker</p>
        <p className="text-xs text-gray-300">Built with ❤️ for your family</p>
      </div>
    </div>
  )
}
