-- ═══════════════════════════════════════════════════════════
--  SHAPEM — Supabase Database Setup
--  Run this entire file in your Supabase SQL Editor once.
--  Supabase → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════════════════

-- ── 1. User Profiles ──────────────────────────────────────
-- Extends Supabase's built-in auth.users table
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  full_name     text,
  username      text unique,
  avatar_url    text,
  bio           text,
  role          text default 'user' check (role in ('user', 'chef', 'admin')),
  premium       boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. Saved Recipes ──────────────────────────────────────
create table if not exists public.saved_recipes (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  recipe_id   text not null,
  collection  text default 'Saved',
  saved_at    timestamptz default now(),
  unique (user_id, recipe_id)
);

-- ── 3. Meal Plans ─────────────────────────────────────────
create table if not exists public.meal_plans (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null default 'My Meal Plan',
  start_date  date,
  end_date    date,
  created_at  timestamptz default now()
);

create table if not exists public.meal_plan_items (
  id            bigserial primary key,
  plan_id       bigint references public.meal_plans(id) on delete cascade,
  recipe_id     text not null,
  day_of_week   int check (day_of_week between 0 and 6),
  meal_type     text check (meal_type in ('breakfast','lunch','dinner','snack')),
  servings      int default 1
);

-- ── 4. Reviews ────────────────────────────────────────────
create table if not exists public.reviews (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  recipe_id   text not null,
  rating      smallint not null check (rating between 1 and 5),
  body        text,
  created_at  timestamptz default now(),
  unique (user_id, recipe_id)
);

-- ── 5. Shopping Lists ─────────────────────────────────────
create table if not exists public.shopping_list_items (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  ingredient  text not null,
  amount      text,
  checked     boolean default false,
  recipe_id   text,
  created_at  timestamptz default now()
);

-- ── 6. Row Level Security (RLS) ───────────────────────────
-- Users can only read/write their own data

alter table public.profiles           enable row level security;
alter table public.saved_recipes      enable row level security;
alter table public.meal_plans         enable row level security;
alter table public.meal_plan_items    enable row level security;
alter table public.reviews            enable row level security;
alter table public.shopping_list_items enable row level security;

-- Profiles: users can read their own, update their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Saved recipes: full CRUD for own rows
create policy "Users can manage saved recipes"
  on public.saved_recipes for all using (auth.uid() = user_id);

-- Meal plans: full CRUD for own rows
create policy "Users can manage meal plans"
  on public.meal_plans for all using (auth.uid() = user_id);

-- Reviews: users can write own, everyone can read
create policy "Anyone can read reviews"
  on public.reviews for select using (true);
create policy "Users can write own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews"
  on public.reviews for update using (auth.uid() = user_id);

-- Shopping list: full CRUD for own rows
create policy "Users can manage shopping list"
  on public.shopping_list_items for all using (auth.uid() = user_id);

-- ── Done! ─────────────────────────────────────────────────
-- Your Shapem database is ready.
-- Next: configure Auth providers in Supabase Dashboard →
--       Authentication → Providers
