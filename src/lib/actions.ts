'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { z } from 'zod'

const TransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  area: z.enum(['Personal', 'House', 'Farm', 'Business', 'Catering']),
  category: z.string().min(1),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  transaction_date: z.string().min(1),
  description: z.string().optional(),
  payee: z.string().optional(),
  payment_method: z.enum(['Cash', 'GCash', 'Bank', 'Maya', 'Credit Card', 'Debit Card', 'Other']).optional(),
  notes: z.string().optional(),
  account_id: z.string().optional(),
})

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = TransactionSchema.safeParse({
    type: formData.get('type'),
    area: formData.get('area'),
    category: formData.get('category'),
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description') || undefined,
    payee: formData.get('payee') || undefined,
    payment_method: formData.get('payment_method') || undefined,
    notes: formData.get('notes') || undefined,
    account_id: formData.get('account_id') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { data: tx, error } = await supabase.from('transactions').insert({
    ...parsed.data,
    user_id: user.id,
  }).select().single()

  if (error) return { error: error.message }

  // Update account balance if account selected
  if (parsed.data.account_id) {
    const delta = parsed.data.type === 'income' ? parsed.data.amount : -parsed.data.amount
    await supabase.rpc('update_account_balance' as never, {
      p_account_id: parsed.data.account_id,
      p_delta: delta,
    } as never)
  }

  revalidatePath('/')
  revalidatePath('/transactions')
  return { success: true, id: tx.id }
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = TransactionSchema.safeParse({
    type: formData.get('type'),
    area: formData.get('area'),
    category: formData.get('category'),
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description') || undefined,
    payee: formData.get('payee') || undefined,
    payment_method: formData.get('payment_method') || undefined,
    notes: formData.get('notes') || undefined,
  })

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  const { error } = await supabase.from('transactions')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/transactions')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/transactions')
  return { success: true }
}

// Accounts
export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const name = String(formData.get('name') ?? '').trim()
  const type = String(formData.get('type') ?? '')
  const opening_balance = parseFloat(String(formData.get('opening_balance') ?? '0'))

  if (!name || !type) return { error: 'Name and type are required' }

  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name,
    type,
    opening_balance,
    current_balance: opening_balance,
  })

  if (error) return { error: error.message }
  revalidatePath('/accounts')
  revalidatePath('/')
  return { success: true }
}

export async function transferFunds(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const from_id = String(formData.get('from_account_id') ?? '')
  const to_id = String(formData.get('to_account_id') ?? '')
  const amount = parseFloat(String(formData.get('amount') ?? '0'))
  const notes = String(formData.get('notes') ?? '')

  if (!from_id || !to_id || !amount || from_id === to_id) return { error: 'Invalid transfer details' }

  // Record transfer transaction
  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'transfer',
    amount,
    account_id: from_id,
    transfer_to_account_id: to_id,
    transaction_date: new Date().toISOString().split('T')[0],
    notes: notes || 'Account transfer',
    description: 'Transfer',
  })

  if (error) return { error: error.message }

  // Update balances
  await supabase.from('accounts').update({ current_balance: (await supabase.from('accounts').select('current_balance').eq('id', from_id).single()).data!.current_balance - amount }).eq('id', from_id)
  await supabase.from('accounts').update({ current_balance: (await supabase.from('accounts').select('current_balance').eq('id', to_id).single()).data!.current_balance + amount }).eq('id', to_id)

  revalidatePath('/accounts')
  revalidatePath('/')
  return { success: true }
}

// Catering
export async function createCateringEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const event_name = String(formData.get('event_name') ?? '').trim()
  if (!event_name) return { error: 'Event name is required' }

  const { data, error } = await supabase.from('catering_events').insert({
    user_id: user.id,
    event_name,
    client_name: String(formData.get('client_name') ?? '') || null,
    event_date: String(formData.get('event_date') ?? '') || null,
    location: String(formData.get('location') ?? '') || null,
    guests: parseInt(String(formData.get('guests') ?? '0')) || null,
    package: String(formData.get('package') ?? '') || null,
    contract_amount: parseFloat(String(formData.get('contract_amount') ?? '0')),
    status: String(formData.get('status') ?? 'Inquiry'),
    notes: String(formData.get('notes') ?? '') || null,
  }).select().single()

  if (error) return { error: error.message }

  revalidatePath('/catering')
  return { success: true, id: data.id }
}

export async function addCateringPayment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const event_id = String(formData.get('event_id') ?? '')
  const amount = parseFloat(String(formData.get('amount') ?? '0'))

  if (!event_id || !amount) return { error: 'Event and amount required' }

  const { error } = await supabase.from('catering_payments').insert({
    event_id,
    user_id: user.id,
    amount,
    payment_date: String(formData.get('payment_date') ?? new Date().toISOString().split('T')[0]),
    payment_method: String(formData.get('payment_method') ?? '') || null,
    notes: String(formData.get('notes') ?? '') || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/catering')
  return { success: true }
}

// Budget
export async function saveBudget(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const area = String(formData.get('area') ?? '') || null
  const category = String(formData.get('category') ?? '') || null
  const amount = parseFloat(String(formData.get('amount') ?? '0'))
  const month = parseInt(String(formData.get('month') ?? new Date().getMonth() + 1))
  const year = parseInt(String(formData.get('year') ?? new Date().getFullYear()))

  const { error } = await supabase.from('budgets').upsert({
    user_id: user.id,
    area,
    category,
    amount,
    month,
    year,
  }, { onConflict: 'user_id,area,category,month,year' })

  if (error) return { error: error.message }

  revalidatePath('/budget')
  return { success: true }
}

// Savings Goals
export async function createSavingsGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const name = String(formData.get('name') ?? '').trim()
  if (!name) return { error: 'Goal name required' }

  const { error } = await supabase.from('savings_goals').insert({
    user_id: user.id,
    name,
    target_amount: parseFloat(String(formData.get('target_amount') ?? '0')),
    current_amount: parseFloat(String(formData.get('current_amount') ?? '0')),
    target_date: String(formData.get('target_date') ?? '') || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/savings')
  return { success: true }
}

export async function updateSavingsGoal(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('savings_goals')
    .update({ current_amount: parseFloat(String(formData.get('current_amount') ?? '0')) })
    .eq('id', id).eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/savings')
  return { success: true }
}

// Debts
export async function createDebt(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('debts').insert({
    user_id: user.id,
    type: String(formData.get('type') ?? 'we_owe'),
    person: String(formData.get('person') ?? '').trim(),
    amount: parseFloat(String(formData.get('amount') ?? '0')),
    purpose: String(formData.get('purpose') ?? '') || null,
    due_date: String(formData.get('due_date') ?? '') || null,
    description: String(formData.get('description') ?? '') || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/debts')
  return { success: true }
}

// Logout
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
