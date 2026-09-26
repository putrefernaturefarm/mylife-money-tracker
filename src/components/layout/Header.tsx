'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title: string
  showBack?: boolean
  action?: React.ReactNode
}

export function Header({ title, showBack, action }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f8]/90 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  )
}
