export const AREAS = ['Personal', 'House', 'Farm', 'Business', 'Catering', 'Other'] as const
export type Area = typeof AREAS[number]

export const AREA_ICONS: Record<Area, string> = {
  Personal: '👩',
  House: '🏠',
  Farm: '🌱',
  Business: '💼',
  Catering: '🍽',
  Other: '📦',
}

export const AREA_COLORS: Record<Area, string> = {
  Personal: 'rose',
  House: 'blue',
  Farm: 'green',
  Business: 'amber',
  Catering: 'purple',
  Other: 'gray',
}

export const AREA_BG: Record<Area, string> = {
  Personal: 'bg-rose-50 border-rose-200',
  House: 'bg-blue-50 border-blue-200',
  Farm: 'bg-green-50 border-green-200',
  Business: 'bg-amber-50 border-amber-200',
  Catering: 'bg-purple-50 border-purple-200',
  Other: 'bg-gray-50 border-gray-200',
}

export const AREA_ACCENT: Record<Area, string> = {
  Personal: 'text-rose-600',
  House: 'text-blue-600',
  Farm: 'text-green-600',
  Business: 'text-amber-600',
  Catering: 'text-purple-600',
  Other: 'text-gray-600',
}

export const PAYMENT_METHODS = ['Cash', 'GCash', 'Bank', 'Maya', 'Credit Card', 'Debit Card', 'Other'] as const
export type PaymentMethod = typeof PAYMENT_METHODS[number]

export const ACCOUNT_TYPES = ['Cash', 'GCash', 'Bank', 'Maya', 'Credit Card', 'Other'] as const

export const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Yearly'] as const

export const CATERING_STATUSES = ['Inquiry', 'Reserved', 'Down Payment', 'Confirmed', 'Completed', 'Fully Paid', 'Cancelled'] as const

export const EXPENSE_CATEGORIES: Record<Area, string[]> = {
  Personal: ['Clothing', 'Personal Care', 'Mobile Load', 'Transportation', 'Food', 'Medical', 'Education', 'Entertainment', 'Shopping', 'Hobbies', 'Gifts', 'Other'],
  House: ['Groceries', 'Electricity', 'Water', 'Internet', 'Rent', 'Home Repair', 'Furniture', 'Appliances', 'Household Supplies', 'School', "Children's Expenses", 'Transportation', 'Food', 'Other'],
  Farm: ['Seeds', 'Fertilizer', 'Organic Inputs', 'Pesticides', 'Labor', 'Machinery', 'Fuel', 'Irrigation', 'Animal Feed', 'Livestock', 'Farm Tools', 'Transportation', 'Land Rental', 'Harvesting', 'Packaging', 'Farm Maintenance', 'Other'],
  Business: ['Inventory', 'Supplies', 'Equipment', 'Rent', 'Utilities', 'Transportation', 'Marketing', 'Packaging', 'Labor', 'Salaries', 'Permits', 'Internet', 'Software', 'Repairs', 'Other'],
  Catering: ['Ingredients', 'Meat', 'Vegetables', 'Rice', 'Drinks', 'Packaging', 'Utensils', 'Gas', 'Fuel', 'Transportation', 'Delivery', 'Labor', 'Staff', 'Equipment Rental', 'Event Rental', 'Marketing', 'Cleaning', 'Other'],
  Other: ['Miscellaneous', 'One-time Expense', 'Unexpected', 'Other'],
}

export const INCOME_CATEGORIES: Record<Area, string[]> = {
  Personal: ['Salary', 'Allowance', 'Freelance', 'Other'],
  House: ['Rental', 'Household Contribution', 'Other'],
  Farm: ['Crop Sales', 'Livestock Sales', 'Farm Products', 'Coconut', 'Ube', 'Other Farm Income'],
  Business: ['Product Sales', 'Service Income', 'Online Sales', 'Other'],
  Catering: ['Catering Package', 'Food Orders', 'Event', 'Delivery', 'Down Payment', 'Full Payment', 'Other'],
  Other: ['Miscellaneous Income', 'Gift', 'Refund', 'Other'],
}

export const BUDGET_WARNING = {
  normal: { max: 70, label: 'On Track', color: 'text-green-600', bg: 'bg-green-500' },
  warning: { min: 70, max: 90, label: 'Getting Close', color: 'text-amber-600', bg: 'bg-amber-500' },
  near: { min: 90, max: 100, label: 'Near Limit', color: 'text-orange-600', bg: 'bg-orange-500' },
  over: { min: 100, label: 'Over Budget', color: 'text-red-600', bg: 'bg-red-500' },
}
