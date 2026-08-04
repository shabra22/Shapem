-- ═══════════════════════════════════════════════════════════════
-- GieesK Recipes — Meal Planner Schema
-- ───────────────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor, same as shopping_list_items.sql
-- and community.sql before it.
--
-- Uses an absolute plan_date (not a "week offset" relative to today)
-- — the previous in-memory version keyed slots as "monday-breakfast-0",
-- where "0" meant "this week" at the moment of viewing. That breaks
-- the instant it's persisted: come back next week and "offset 0"
-- silently refers to a different real week. An actual calendar date
-- has no such ambiguity.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS meal_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date    DATE NOT NULL,
  meal_slot    TEXT NOT NULL,   -- 'breakfast' | 'lunch' | 'dinner' | 'snack'
  recipe_id    TEXT NOT NULL,
  recipe_title TEXT NOT NULL,
  recipe_emoji TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, plan_date, meal_slot)   -- one recipe per slot; adding a
                                          -- new one to a filled slot replaces it
);

ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS plan_date    DATE;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS meal_slot    TEXT;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS recipe_id    TEXT;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS recipe_title TEXT;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS recipe_emoji TEXT;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT now();

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own meal plan" ON meal_plans;
CREATE POLICY "Users manage own meal plan"
  ON meal_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, plan_date);
