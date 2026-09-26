export type TransactionType = 'income' | 'expense' | 'transfer'
export type Area = 'Personal' | 'House' | 'Farm' | 'Business' | 'Catering' | 'Other'
export type PaymentMethod = 'Cash' | 'GCash' | 'Bank' | 'Maya' | 'Credit Card' | 'Debit Card' | 'Other'
export type Frequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'
export type CateringStatus = 'Inquiry' | 'Reserved' | 'Down Payment' | 'Confirmed' | 'Completed' | 'Fully Paid' | 'Cancelled'
export type DebtType = 'owed_to_us' | 'we_owe'

export interface Account {
  id: string
  user_id: string
  name: string
  type: string
  opening_balance: number
  current_balance: number
  created_at: string
}

export interface Category {
  id: string
  user_id: string | null
  area: Area
  name: string
  type: 'income' | 'expense'
  is_default: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string | null
  type: TransactionType
  area: Area | null
  category: string | null
  amount: number
  transaction_date: string
  description: string | null
  payee: string | null
  payment_method: PaymentMethod | null
  notes: string | null
  receipt_url: string | null
  transfer_to_account_id: string | null
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  area: Area | null
  category: string | null
  amount: number
  month: number
  year: number
  created_at: string
}

export interface CateringEvent {
  id: string
  user_id: string
  event_name: string
  client_name: string | null
  event_date: string | null
  location: string | null
  guests: number | null
  package: string | null
  contract_amount: number
  status: CateringStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CateringPayment {
  id: string
  event_id: string
  user_id: string
  amount: number
  payment_date: string
  payment_method: string | null
  notes: string | null
  created_at: string
}

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  created_at: string
}

export interface Debt {
  id: string
  user_id: string
  type: DebtType
  person: string
  amount: number
  paid_amount: number
  due_date: string | null
  purpose: string | null
  description: string | null
  status: 'active' | 'paid' | 'cancelled'
  created_at: string
}

export interface RecurringTransaction {
  id: string
  user_id: string
  type: 'income' | 'expense'
  amount: number
  area: Area | null
  category: string | null
  description: string | null
  payment_method: string | null
  frequency: Frequency
  next_date: string
  active: boolean
  created_at: string
}

export interface AreaSummary {
  area: Area
  income: number
  expenses: number
  balance: number
}

export interface DashboardData {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  availableBalance: number
  monthIncome: number
  monthExpenses: number
  monthNet: number
  areaSummaries: AreaSummary[]
  recentTransactions: Transaction[]
}
