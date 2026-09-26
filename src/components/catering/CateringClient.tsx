'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, ChefHat, Calendar, Users, DollarSign } from 'lucide-react'
import { formatPeso, formatDate } from '@/lib/utils'
import { createCateringEvent, addCateringPayment } from '@/lib/actions'
import { CATERING_STATUSES, PAYMENT_METHODS } from '@/lib/constants'

interface CateringEvent {
  id: string
  event_name: string
  client_name: string | null
  event_date: string | null
  location: string | null
  guests: number | null
  package: string | null
  contract_amount: number
  amount_paid: number | null
  status: string
  notes: string | null
}

interface Props {
  events: CateringEvent[]
}

const STATUS_COLORS: Record<string, string> = {
  Inquiry: 'bg-gray-100 text-gray-600',
  Reserved: 'bg-blue-100 text-blue-600',
  'Down Payment': 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-green-100 text-green-700',
  'Fully Paid': 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-600',
}

export function CateringClient({ events }: Props) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [showPayment, setShowPayment] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const totalContracts = events.reduce((s, e) => s + (e.contract_amount ?? 0), 0)
  const totalPaid = events.reduce((s, e) => s + (e.amount_paid ?? 0), 0)

  function handleAddEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createCateringEvent(formData)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setShowAdd(false)
        router.refresh()
      }
    })
  }

  function handlePayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addCateringPayment(formData)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setShowPayment(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Total Contracts</p>
          <p className="text-sm font-bold text-purple-700">{formatPeso(totalContracts)}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Collected</p>
          <p className="text-sm font-bold text-emerald-700">{formatPeso(totalPaid)}</p>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => { setShowAdd(true); setError('') }}
        className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl text-sm font-medium"
      >
        <Plus size={16} /> New Catering Event
      </button>

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ChefHat size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No catering events yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const balance = (event.contract_amount ?? 0) - (event.amount_paid ?? 0)
            const paidPct = event.contract_amount > 0 ? Math.min(((event.amount_paid ?? 0) / event.contract_amount) * 100, 100) : 0
            return (
              <div key={event.id} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{event.event_name}</p>
                    {event.client_name && <p className="text-xs text-gray-500">{event.client_name}</p>}
                  </div>
                  <span className={`flex-shrink-0 ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[event.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {event.status}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500 mb-3">
                  {event.event_date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {formatDate(event.event_date)}
                    </span>
                  )}
                  {event.guests && (
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {event.guests} pax
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium text-gray-700">{formatPeso(event.amount_paid ?? 0)} / {formatPeso(event.contract_amount)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paidPct}%` }} />
                </div>
                {balance > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Balance: {formatPeso(balance)}</span>
                    <button
                      onClick={() => { setShowPayment(event.id); setError('') }}
                      className="text-xs text-purple-600 font-medium flex items-center gap-1"
                    >
                      <DollarSign size={12} /> Add Payment
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Event modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">New Catering Event</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-3">
              {[
                { name: 'event_name', label: 'Event Name *', placeholder: 'Wedding, Debut, Birthday...', required: true },
                { name: 'client_name', label: 'Client Name', placeholder: 'Client full name', required: false },
                { name: 'location', label: 'Location', placeholder: 'Venue or address', required: false },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">{f.label}</label>
                  <input
                    name={f.name}
                    required={f.required}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Event Date</label>
                  <input type="date" name="event_date"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Guests (pax)</label>
                  <input type="number" name="guests" min="1" placeholder="100"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Package</label>
                <input name="package" placeholder="e.g. Package A — ₱500/pax"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Contract Amount (₱) *</label>
                <input type="number" name="contract_amount" step="0.01" min="0" required defaultValue="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Status</label>
                <select name="status"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50">
                  {CATERING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Notes</label>
                <textarea name="notes" rows={2} placeholder="Additional notes..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 resize-none" />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={isPending}
                className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Save Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Add Payment</h3>
              <button onClick={() => setShowPayment(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <input type="hidden" name="event_id" value={showPayment} />
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Amount (₱) *</label>
                <input type="number" name="amount" step="0.01" min="0.01" required placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Payment Date</label>
                <input type="date" name="payment_date" defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Payment Method</label>
                <select name="payment_method"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50">
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={isPending}
                className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Record Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
