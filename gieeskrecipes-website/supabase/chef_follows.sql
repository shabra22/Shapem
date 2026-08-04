-- ═══════════════════════════════════════════════════════════════
-- GieesK Recipes — Chef Follows Schema
-- ───────────────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor, alongside the other
-- migrations (community.sql, shopping_list_items.sql, meal_plans.sql).
--
-- Backs the "Follow" button on chef profile pages, which previously
-- only toggled button text with zero persistence — the follower
-- count shown everywhere was also a static fake number, unrelated
-- to this button at all. This makes both real.
--
-- chef_name is used as the identifier (not a foreign key) since
-- CHEFS are curated editorial personas defined in data.js, not rows
-- in a database table.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS chef_follows (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chef_name  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, chef_name)
);

ALTER TABLE chef_follows ADD COLUMN IF NOT EXISTS user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE chef_follows ADD COLUMN IF NOT EXISTS chef_name  TEXT;
ALTER TABLE chef_follows ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE chef_follows ENABLE ROW LEVEL SECURITY;

-- Anyone can read follow counts (needed to show real numbers publicly),
-- but only the user themself can create/remove their own follow row.
DROP POLICY IF EXISTS "Anyone can view follows" ON chef_follows;
CREATE POLICY "Anyone can view follows"
  ON chef_follows FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users manage own follows" ON chef_follows;
CREATE POLICY "Users manage own follows"
  ON chef_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users remove own follows" ON chef_follows;
CREATE POLICY "Users remove own follows"
  ON chef_follows FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chef_follows_chef ON chef_follows(chef_name);
CREATE INDEX IF NOT EXISTS idx_chef_follows_user ON chef_follows(user_id);
