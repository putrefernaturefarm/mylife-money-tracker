-- MyLife Money Tracker — Demo Seed Data
-- Instructions:
--   1. Sign up in the app first to create your user account
--   2. Go to Supabase Dashboard > SQL Editor
--   3. Replace YOUR_USER_ID below with your actual user ID from auth.users
--   4. Run this script
--
-- To find your user ID: Supabase Dashboard > Authentication > Users > copy your user's ID

DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID'; -- ← REPLACE THIS
  v_cash_id UUID;
  v_gcash_id UUID;
  v_bank_id UUID;
  v_evt1_id UUID;
  v_evt2_id UUID;
BEGIN

-- ─────────────────────────────────────────────
-- ACCOUNTS
-- ─────────────────────────────────────────────
INSERT INTO public.accounts (id, user_id, name, type, opening_balance, current_balance)
VALUES
  (uuid_generate_v4(), v_user_id, 'Cash on Hand', 'Cash', 5000, 5000),
  (uuid_generate_v4(), v_user_id, 'GCash', 'GCash', 2500, 2500),
  (uuid_generate_v4(), v_user_id, 'BDO Savings', 'Bank', 45000, 45000)
RETURNING id INTO v_cash_id;

SELECT id INTO v_cash_id FROM public.accounts WHERE user_id = v_user_id AND name = 'Cash on Hand';
SELECT id INTO v_gcash_id FROM public.accounts WHERE user_id = v_user_id AND name = 'GCash';
SELECT id INTO v_bank_id FROM public.accounts WHERE user_id = v_user_id AND name = 'BDO Savings';

-- ─────────────────────────────────────────────
-- TRANSACTIONS — Current Month
-- ─────────────────────────────────────────────
INSERT INTO public.transactions (user_id, account_id, type, area, category, amount, transaction_date, description, payment_method)
VALUES
  -- Personal Income
  (v_user_id, v_bank_id, 'income', 'Personal', 'Salary', 35000, date_trunc('month', current_date)::date + 4, 'Monthly salary', 'Bank'),
  (v_user_id, v_gcash_id, 'income', 'Personal', 'Freelance', 8500, date_trunc('month', current_date)::date + 11, 'Web design project', 'GCash'),
  -- Personal Expenses
  (v_user_id, v_cash_id, 'expense', 'Personal', 'Transportation', 450, date_trunc('month', current_date)::date + 1, 'Jeepney fare', 'Cash'),
  (v_user_id, v_cash_id, 'expense', 'Personal', 'Food', 320, date_trunc('month', current_date)::date + 2, 'Lunch at Jollibee', 'Cash'),
  (v_user_id, v_gcash_id, 'expense', 'Personal', 'Mobile Load', 299, date_trunc('month', current_date)::date + 3, 'Globe monthly promo', 'GCash'),
  (v_user_id, v_cash_id, 'expense', 'Personal', 'Medical', 850, date_trunc('month', current_date)::date + 7, 'Doctor consultation', 'Cash'),
  (v_user_id, v_gcash_id, 'expense', 'Personal', 'Shopping', 1200, date_trunc('month', current_date)::date + 9, 'Shopee haul', 'GCash'),
  (v_user_id, v_cash_id, 'expense', 'Personal', 'Personal Care', 580, date_trunc('month', current_date)::date + 12, 'Haircut + products', 'Cash'),
  -- House Income
  (v_user_id, v_bank_id, 'income', 'House', 'Rental', 6500, date_trunc('month', current_date)::date + 5, 'Room rental from tenant', 'Bank'),
  -- House Expenses
  (v_user_id, v_gcash_id, 'expense', 'House', 'Electricity', 2850, date_trunc('month', current_date)::date + 8, 'Meralco bill', 'GCash'),
  (v_user_id, v_gcash_id, 'expense', 'House', 'Water', 420, date_trunc('month', current_date)::date + 8, 'Water bill', 'GCash'),
  (v_user_id, v_gcash_id, 'expense', 'House', 'Internet', 1299, date_trunc('month', current_date)::date + 10, 'PLDT Fibr monthly', 'GCash'),
  (v_user_id, v_cash_id, 'expense', 'House', 'Groceries', 3500, date_trunc('month', current_date)::date + 6, 'Weekly groceries SM', 'Cash'),
  (v_user_id, v_cash_id, 'expense', 'House', 'Groceries', 2800, date_trunc('month', current_date)::date + 13, 'Weekly groceries', 'Cash'),
  (v_user_id, v_cash_id, 'expense', 'House', 'School', 1500, date_trunc('month', current_date)::date + 5, 'School supplies', 'Cash'),
  -- Farm Income
  (v_user_id, v_cash_id, 'income', 'Farm', 'Crop Sales', 12000, date_trunc('month', current_date)::date + 15, 'Ube harvest sale', 'Cash'),
  (v_user_id, v_cash_id, 'income', 'Farm', 'Coconut', 4500, date_trunc('month', current_date)::date + 10, 'Copra sale', 'Cash'),
  -- Farm Expenses
  (v_user_id, v_cash_id, 'expense', 'Farm', 'Fertilizer', 1800, date_trunc('month', current_date)::date + 3, 'NPK fertilizer', 'Cash'),
  (v_user_id, v_cash_id, 'expense', 'Farm', 'Labor', 3500, date_trunc('month', current_date)::date + 14, 'Harvest labor 7 days', 'Cash'),
  (v_user_id, v_cash_id, 'expense', 'Farm', 'Fuel', 680, date_trunc('month', current_date)::date + 6, 'Diesel for pump', 'Cash'),
  (v_user_id, v_cash_id, 'expense', 'Farm', 'Packaging', 350, date_trunc('month', current_date)::date + 14, 'Sacks and packaging', 'Cash'),
  -- Business Income
  (v_user_id, v_bank_id, 'income', 'Business', 'Product Sales', 18500, date_trunc('month', current_date)::date + 7, 'Online store sales', 'Bank'),
  (v_user_id, v_gcash_id, 'income', 'Business', 'Online Sales', 6200, date_trunc('month', current_date)::date + 12, 'Shopee business sales', 'GCash'),
  -- Business Expenses
  (v_user_id, v_bank_id, 'expense', 'Business', 'Inventory', 8500, date_trunc('month', current_date)::date + 2, 'Product restocking', 'Bank'),
  (v_user_id, v_gcash_id, 'expense', 'Business', 'Packaging', 950, date_trunc('month', current_date)::date + 4, 'Bubble wrap, boxes', 'GCash'),
  (v_user_id, v_gcash_id, 'expense', 'Business', 'Marketing', 1500, date_trunc('month', current_date)::date + 8, 'Facebook ads', 'GCash'),
  (v_user_id, v_cash_id, 'expense', 'Business', 'Transportation', 800, date_trunc('month', current_date)::date + 11, 'Delivery to LBC', 'Cash'),
  -- Catering Income
  (v_user_id, v_cash_id, 'income', 'Catering', 'Down Payment', 15000, date_trunc('month', current_date)::date + 3, 'Santos wedding DP', 'Cash'),
  (v_user_id, v_gcash_id, 'income', 'Catering', 'Full Payment', 38000, date_trunc('month', current_date)::date + 16, 'Reyes debut full payment', 'GCash'),
  -- Catering Expenses
  (v_user_id, v_cash_id, 'expense', 'Catering', 'Ingredients', 12500, date_trunc('month', current_date)::date + 15, 'Ingredients for Reyes debut', 'Cash'),
  (v_user_id, v_cash_id, 'expense', 'Catering', 'Labor', 5000, date_trunc('month', current_date)::date + 16, 'Staff for Reyes debut', 'Cash'),
  (v_user_id, v_cash_id, 'expense', 'Catering', 'Gas', 800, date_trunc('month', current_date)::date + 15, 'LPG tanks', 'Cash'),
  (v_user_id, v_cash_id, 'expense', 'Catering', 'Transportation', 600, date_trunc('month', current_date)::date + 16, 'Vehicle rental', 'Cash');

-- ─────────────────────────────────────────────
-- TRANSACTIONS — Last Month
-- ─────────────────────────────────────────────
INSERT INTO public.transactions (user_id, account_id, type, area, category, amount, transaction_date, description, payment_method)
VALUES
  (v_user_id, v_bank_id, 'income', 'Personal', 'Salary', 35000, date_trunc('month', current_date)::date - 26, 'Monthly salary', 'Bank'),
  (v_user_id, v_gcash_id, 'expense', 'House', 'Electricity', 3100, date_trunc('month', current_date)::date - 22, 'Meralco bill', 'GCash'),
  (v_user_id, v_gcash_id, 'expense', 'House', 'Internet', 1299, date_trunc('month', current_date)::date - 20, 'PLDT monthly', 'GCash'),
  (v_user_id, v_cash_id, 'expense', 'House', 'Groceries', 7800, date_trunc('month', current_date)::date - 18, 'Monthly groceries', 'Cash'),
  (v_user_id, v_cash_id, 'income', 'Farm', 'Livestock Sales', 8500, date_trunc('month', current_date)::date - 15, 'Chicken sold', 'Cash'),
  (v_user_id, v_cash_id, 'expense', 'Farm', 'Animal Feed', 2200, date_trunc('month', current_date)::date - 25, 'Chicken feeds', 'Cash'),
  (v_user_id, v_bank_id, 'income', 'Business', 'Product Sales', 22000, date_trunc('month', current_date)::date - 12, 'Month sales', 'Bank'),
  (v_user_id, v_bank_id, 'expense', 'Business', 'Inventory', 11000, date_trunc('month', current_date)::date - 20, 'Restocking', 'Bank'),
  (v_user_id, v_gcash_id, 'income', 'Catering', 'Catering Package', 25000, date_trunc('month', current_date)::date - 8, 'Birthday party', 'GCash'),
  (v_user_id, v_cash_id, 'expense', 'Catering', 'Ingredients', 9500, date_trunc('month', current_date)::date - 9, 'Birthday party prep', 'Cash');

-- ─────────────────────────────────────────────
-- CATERING EVENTS
-- ─────────────────────────────────────────────
INSERT INTO public.catering_events (id, user_id, event_name, client_name, event_date, location, guests, package, contract_amount, status, notes)
VALUES
  (uuid_generate_v4(), v_user_id, 'Santos Wedding Reception', 'Mario & Leni Santos', current_date + 45, 'Barangay Hall, Camiguin', 150, 'Buffet Package B — ₱450/pax', 67500, 'Down Payment', 'Need 2 extra staff'),
  (uuid_generate_v4(), v_user_id, 'Reyes Debut 18th Birthday', 'Familia Reyes', current_date - 1, 'Heritage Hotel Function Hall', 80, 'Cocktail + Dinner Package', 38000, 'Fully Paid', 'Completed successfully'),
  (uuid_generate_v4(), v_user_id, 'Garcia Company Outing', 'ABC Corporation', current_date + 20, 'Camiguin Beach Resort', 50, 'Lunch Buffet Package A', 22500, 'Reserved', NULL)
RETURNING id INTO v_evt1_id;

SELECT id INTO v_evt1_id FROM public.catering_events WHERE user_id = v_user_id AND event_name = 'Santos Wedding Reception';
SELECT id INTO v_evt2_id FROM public.catering_events WHERE user_id = v_user_id AND event_name = 'Reyes Debut 18th Birthday';

INSERT INTO public.catering_payments (event_id, user_id, amount, payment_date, payment_method, notes)
VALUES
  (v_evt1_id, v_user_id, 15000, date_trunc('month', current_date)::date + 3, 'Cash', 'Down payment received'),
  (v_evt2_id, v_user_id, 10000, date_trunc('month', current_date)::date - 14, 'GCash', 'Reservation payment'),
  (v_evt2_id, v_user_id, 28000, date_trunc('month', current_date)::date + 16, 'GCash', 'Full balance paid');

-- ─────────────────────────────────────────────
-- BUDGETS (current month)
-- ─────────────────────────────────────────────
INSERT INTO public.budgets (user_id, area, category, amount, month, year)
VALUES
  (v_user_id, 'House', NULL, 15000, EXTRACT(MONTH FROM current_date)::int, EXTRACT(YEAR FROM current_date)::int),
  (v_user_id, 'Personal', NULL, 8000, EXTRACT(MONTH FROM current_date)::int, EXTRACT(YEAR FROM current_date)::int),
  (v_user_id, 'House', 'Groceries', 7000, EXTRACT(MONTH FROM current_date)::int, EXTRACT(YEAR FROM current_date)::int),
  (v_user_id, 'House', 'Electricity', 3500, EXTRACT(MONTH FROM current_date)::int, EXTRACT(YEAR FROM current_date)::int),
  (v_user_id, 'Personal', 'Food', 2000, EXTRACT(MONTH FROM current_date)::int, EXTRACT(YEAR FROM current_date)::int),
  (v_user_id, 'Business', NULL, 15000, EXTRACT(MONTH FROM current_date)::int, EXTRACT(YEAR FROM current_date)::int);

-- ─────────────────────────────────────────────
-- SAVINGS GOALS
-- ─────────────────────────────────────────────
INSERT INTO public.savings_goals (user_id, name, target_amount, current_amount, target_date)
VALUES
  (v_user_id, 'Emergency Fund', 50000, 18500, current_date + 180),
  (v_user_id, 'New Refrigerator', 25000, 8000, current_date + 90),
  (v_user_id, 'Farm Equipment', 80000, 35000, current_date + 365),
  (v_user_id, 'Family Vacation - Bohol', 30000, 12000, current_date + 150);

-- ─────────────────────────────────────────────
-- DEBTS
-- ─────────────────────────────────────────────
INSERT INTO public.debts (user_id, type, person, amount, paid_amount, due_date, purpose, status)
VALUES
  (v_user_id, 'we_owe', 'Tito Rodrigo', 10000, 0, current_date + 60, 'Farm equipment loan', 'active'),
  (v_user_id, 'we_owe', 'Cooperative Loan', 25000, 5000, current_date + 120, 'Business capital', 'active'),
  (v_user_id, 'owed_to_us', 'Kuya Dante', 3500, 0, current_date + 30, 'Personal loan', 'active'),
  (v_user_id, 'owed_to_us', 'Ate Maria', 1500, 0, NULL, 'Cash advance', 'active');

-- ─────────────────────────────────────────────
-- RECURRING TRANSACTIONS
-- ─────────────────────────────────────────────
INSERT INTO public.recurring_transactions (user_id, type, area, category, amount, description, frequency, next_date, active, payment_method)
VALUES
  (v_user_id, 'income', 'Personal', 'Salary', 35000, 'Monthly salary', 'Monthly', date_trunc('month', current_date + interval '1 month')::date + 4, true, 'Bank'),
  (v_user_id, 'expense', 'House', 'Electricity', 2800, 'Meralco bill', 'Monthly', date_trunc('month', current_date + interval '1 month')::date + 8, true, 'GCash'),
  (v_user_id, 'expense', 'House', 'Internet', 1299, 'PLDT Fibr', 'Monthly', date_trunc('month', current_date + interval '1 month')::date + 10, true, 'GCash'),
  (v_user_id, 'expense', 'House', 'Water', 400, 'Water bill', 'Monthly', date_trunc('month', current_date + interval '1 month')::date + 8, true, 'GCash'),
  (v_user_id, 'expense', 'Personal', 'Mobile Load', 299, 'Globe monthly promo', 'Monthly', date_trunc('month', current_date + interval '1 month')::date + 3, true, 'GCash'),
  (v_user_id, 'income', 'House', 'Rental', 6500, 'Room rental income', 'Monthly', date_trunc('month', current_date + interval '1 month')::date + 5, true, 'Cash');

END $$;
