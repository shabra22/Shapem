-- ═══════════════════════════════════════════════════════════════
-- GieesK Recipes — Shopping List Schema
-- ───────────────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor.
--
-- NOTE: I could not inspect your live Supabase database from this
-- session — SETUP.md records that a shopping_list_items table was
-- already created, but not its exact columns. This migration is
-- written defensively (IF NOT EXISTS everywhere) so it's safe to
-- run whether the table is empty, already matches, or has different
-- columns — it will only ADD what's missing, never drop data.
--
-- If your existing table uses different column names than below
-- (e.g. "item_name" instead of "name"), tell me the real columns
-- and I'll adjust js/dashboard.js to match exactly instead.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS shopping_list_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  amount       TEXT,
  category     TEXT DEFAULT 'Other',
  recipe_id    TEXT,
  recipe_title TEXT,
  checked      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Safe to re-run: adds any columns missing from an existing table
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS name         TEXT;
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS amount       TEXT;
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS category     TEXT DEFAULT 'Other';
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS recipe_id    TEXT;
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS recipe_title TEXT;
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS checked      BOOLEAN DEFAULT FALSE;
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT now();

-- Row Level Security — each user can only see/edit their own items
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own shopping items" ON shopping_list_items;
CREATE POLICY "Users manage own shopping items"
  ON shopping_list_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_shopping_list_user ON shopping_list_items(user_id);


-- ═══════════════════════════════════════════════════════════════
-- Also verifying saved_recipes has what the dashboard now needs
-- (saved_at, for showing "Saved 3 days ago" on each card).
-- SETUP.md confirms this table exists; this just ensures the
-- column is there without touching anything else.
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE saved_recipes ADD COLUMN IF NOT EXISTS saved_at TIMESTAMPTZ DEFAULT now();
