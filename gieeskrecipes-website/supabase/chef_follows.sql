-- ═══════════════════════════════════════════════════════════════
-- GieesK Recipes — Chef Follows Schema
-- ───────────────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor, alongside community.sql.
--
-- Uses BIGSERIAL to match the convention used by every other table
-- in your database. The original draft used UUID — you weren't sure
-- whether that version had already been run, so this starts with a
-- DROP TABLE IF EXISTS as a safety net; since this table is brand
-- new either way, there's no real data at risk.
--
-- chef_name is used as the identifier (not a foreign key) since
-- CHEFS are curated editorial personas defined in data.js, not rows
-- in a database table.
-- ═══════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS chef_follows CASCADE;

CREATE TABLE chef_follows (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chef_name  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, chef_name)
);

ALTER TABLE chef_follows ENABLE ROW LEVEL SECURITY;

-- Anyone can read follow counts (needed to show real numbers publicly),
-- but only the user themself can create/remove their own follow row.
CREATE POLICY "Anyone can view follows"
  ON chef_follows FOR SELECT
  USING (true);

CREATE POLICY "Users manage own follows"
  ON chef_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove own follows"
  ON chef_follows FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_chef_follows_chef ON chef_follows(chef_name);
CREATE INDEX idx_chef_follows_user ON chef_follows(user_id);
