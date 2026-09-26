-- MyLife Money Tracker — Complete Database Schema (idempotent — safe to re-run)

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────
create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('Cash','GCash','Bank','Maya','Credit Card','Other')),
  opening_balance numeric(12,2) not null default 0,
  current_balance numeric(12,2) not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  area text not null check (area in ('Personal','House','Farm','Business','Catering')),
  name text not null,
  type text not null check (type in ('income','expense')),
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  type text not null check (type in ('income','expense','transfer')),
  area text check (area in ('Personal','House','Farm','Business','Catering')),
  category text,
  amount numeric(12,2) not null,
  transaction_date date not null default current_date,
  description text,
  payee text,
  payment_method text check (payment_method in ('Cash','GCash','Bank','Maya','Credit Card','Debit Card','Other')),
  notes text,
  receipt_url text,
  transfer_to_account_id uuid references public.accounts(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  area text check (area in ('Personal','House','Farm','Business','Catering')),
  category text,
  amount numeric(12,2) not null,
  month integer not null check (month between 1 and 12),
  year integer not null,
  created_at timestamptz default now(),
  unique (user_id, area, category, month, year)
);

create table if not exists public.catering_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  event_name text not null,
  client_name text,
  event_date date,
  location text,
  guests integer,
  package text,
  contract_amount numeric(12,2) not null default 0,
  status text not null default 'Inquiry' check (status in ('Inquiry','Reserved','Down Payment','Confirmed','Completed','Fully Paid','Cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.catering_payments (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.catering_events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  payment_date date not null default current_date,
  payment_method text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) not null default 0,
  target_date date,
  created_at timestamptz default now()
);

create table if not exists public.debts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('owed_to_us','we_owe')),
  person text not null,
  amount numeric(12,2) not null,
  paid_amount numeric(12,2) not null default 0,
  due_date date,
  purpose text,
  description text,
  status text not null default 'active' check (status in ('active','paid','cancelled')),
  created_at timestamptz default now()
);

create table if not exists public.recurring_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('income','expense')),
  amount numeric(12,2) not null,
  area text check (area in ('Personal','House','Farm','Business','Catering')),
  category text,
  description text,
  payment_method text,
  frequency text not null check (frequency in ('Daily','Weekly','Monthly','Yearly')),
  next_date date not null,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- SCHEMA MIGRATIONS (patch pre-existing tables)
-- ─────────────────────────────────────────────
alter table public.categories add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.categories add column if not exists area text;
alter table public.categories add column if not exists type text;
alter table public.categories add column if not exists is_default boolean default false;
alter table public.categories add column if not exists created_at timestamptz default now();

-- ─────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
  before update on public.transactions
  for each row execute function update_updated_at();

drop trigger if exists trg_catering_events_updated_at on public.catering_events;
create trigger trg_catering_events_updated_at
  before update on public.catering_events
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.catering_events enable row level security;
alter table public.catering_payments enable row level security;
alter table public.savings_goals enable row level security;
alter table public.debts enable row level security;
alter table public.recurring_transactions enable row level security;

drop policy if exists "accounts_owner" on public.accounts;
create policy "accounts_owner" on public.accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "categories_owner" on public.categories;
create policy "categories_owner" on public.categories for all using (auth.uid() = user_id or user_id is null) with check (auth.uid() = user_id);

drop policy if exists "transactions_owner" on public.transactions;
create policy "transactions_owner" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "budgets_owner" on public.budgets;
create policy "budgets_owner" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "catering_events_owner" on public.catering_events;
create policy "catering_events_owner" on public.catering_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "catering_payments_owner" on public.catering_payments;
create policy "catering_payments_owner" on public.catering_payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "savings_goals_owner" on public.savings_goals;
create policy "savings_goals_owner" on public.savings_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "debts_owner" on public.debts;
create policy "debts_owner" on public.debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "recurring_owner" on public.recurring_transactions;
create policy "recurring_owner" on public.recurring_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- DEFAULT CATEGORIES SEED (safe — skips duplicates)
-- ─────────────────────────────────────────────
insert into public.categories (user_id, area, name, type, is_default) values
(null,'Personal','Clothing','expense',true),
(null,'Personal','Personal Care','expense',true),
(null,'Personal','Mobile Load','expense',true),
(null,'Personal','Transportation','expense',true),
(null,'Personal','Food','expense',true),
(null,'Personal','Medical','expense',true),
(null,'Personal','Education','expense',true),
(null,'Personal','Entertainment','expense',true),
(null,'Personal','Shopping','expense',true),
(null,'Personal','Hobbies','expense',true),
(null,'Personal','Gifts','expense',true),
(null,'Personal','Other','expense',true),
(null,'Personal','Salary','income',true),
(null,'Personal','Allowance','income',true),
(null,'Personal','Freelance','income',true),
(null,'Personal','Other','income',true),
(null,'House','Groceries','expense',true),
(null,'House','Electricity','expense',true),
(null,'House','Water','expense',true),
(null,'House','Internet','expense',true),
(null,'House','Rent','expense',true),
(null,'House','Home Repair','expense',true),
(null,'House','Furniture','expense',true),
(null,'House','Appliances','expense',true),
(null,'House','Household Supplies','expense',true),
(null,'House','School','expense',true),
(null,'House','Children''s Expenses','expense',true),
(null,'House','Transportation','expense',true),
(null,'House','Food','expense',true),
(null,'House','Other','expense',true),
(null,'House','Rental','income',true),
(null,'House','Household Contribution','income',true),
(null,'House','Other','income',true),
(null,'Farm','Seeds','expense',true),
(null,'Farm','Fertilizer','expense',true),
(null,'Farm','Organic Inputs','expense',true),
(null,'Farm','Pesticides','expense',true),
(null,'Farm','Labor','expense',true),
(null,'Farm','Machinery','expense',true),
(null,'Farm','Fuel','expense',true),
(null,'Farm','Irrigation','expense',true),
(null,'Farm','Animal Feed','expense',true),
(null,'Farm','Livestock','expense',true),
(null,'Farm','Farm Tools','expense',true),
(null,'Farm','Transportation','expense',true),
(null,'Farm','Land Rental','expense',true),
(null,'Farm','Harvesting','expense',true),
(null,'Farm','Packaging','expense',true),
(null,'Farm','Farm Maintenance','expense',true),
(null,'Farm','Other','expense',true),
(null,'Farm','Crop Sales','income',true),
(null,'Farm','Livestock Sales','income',true),
(null,'Farm','Farm Products','income',true),
(null,'Farm','Coconut','income',true),
(null,'Farm','Ube','income',true),
(null,'Farm','Other Farm Income','income',true),
(null,'Business','Inventory','expense',true),
(null,'Business','Supplies','expense',true),
(null,'Business','Equipment','expense',true),
(null,'Business','Rent','expense',true),
(null,'Business','Utilities','expense',true),
(null,'Business','Transportation','expense',true),
(null,'Business','Marketing','expense',true),
(null,'Business','Packaging','expense',true),
(null,'Business','Labor','expense',true),
(null,'Business','Salaries','expense',true),
(null,'Business','Permits','expense',true),
(null,'Business','Internet','expense',true),
(null,'Business','Software','expense',true),
(null,'Business','Repairs','expense',true),
(null,'Business','Other','expense',true),
(null,'Business','Product Sales','income',true),
(null,'Business','Service Income','income',true),
(null,'Business','Online Sales','income',true),
(null,'Business','Other','income',true),
(null,'Catering','Ingredients','expense',true),
(null,'Catering','Meat','expense',true),
(null,'Catering','Vegetables','expense',true),
(null,'Catering','Rice','expense',true),
(null,'Catering','Drinks','expense',true),
(null,'Catering','Packaging','expense',true),
(null,'Catering','Utensils','expense',true),
(null,'Catering','Gas','expense',true),
(null,'Catering','Fuel','expense',true),
(null,'Catering','Transportation','expense',true),
(null,'Catering','Delivery','expense',true),
(null,'Catering','Labor','expense',true),
(null,'Catering','Staff','expense',true),
(null,'Catering','Equipment Rental','expense',true),
(null,'Catering','Event Rental','expense',true),
(null,'Catering','Marketing','expense',true),
(null,'Catering','Cleaning','expense',true),
(null,'Catering','Other','expense',true),
(null,'Catering','Catering Package','income',true),
(null,'Catering','Food Orders','income',true),
(null,'Catering','Event','income',true),
(null,'Catering','Delivery','income',true),
(null,'Catering','Down Payment','income',true),
(null,'Catering','Full Payment','income',true),
(null,'Catering','Other','income',true)
on conflict do nothing;
