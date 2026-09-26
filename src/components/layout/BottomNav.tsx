'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, List, Plus, BarChart3, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: List, label: 'Transactions' },
  { href: '/add', icon: Plus, label: 'Add', isCenter: true },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/more', icon: MoreHorizontal, label: 'More' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label, isCenter }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

          if (isCenter) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-14 h-14 bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-rose-200">
                  <Icon size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] text-gray-500 mt-1">{label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center py-2 px-3 min-w-[56px]',
                isActive ? 'text-rose-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={cn('text-[10px] mt-0.5 font-medium', isActive ? 'text-rose-600' : 'text-gray-400')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
