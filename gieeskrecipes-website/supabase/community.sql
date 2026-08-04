-- ═══════════════════════════════════════════════════════════════
-- GieesK Recipes — Community Schema
-- ───────────────────────────────────────────────────────────────
-- Replaces the entirely fake, hardcoded community feed (4 fictional
-- posts, likes that only existed in a JS variable, a comment count
-- with no way to actually comment, "Ends in 5 days" text that never
-- changed) with real, persisted, per-user data.
--
-- Uses BIGSERIAL primary keys to match the convention already used
-- by every other table in your database (saved_recipes, meal_plans,
-- meal_plan_items, reviews, shopping_list_items) — the original
-- draft of this file used UUID, inconsistent with the rest of your
-- schema. You confirmed this hasn't been run yet, so there's no
-- data to lose — the DROP statements below are a safety net in case
-- an earlier attempt did partially run.
--
-- user_id columns stay UUID — those reference auth.users(id), which
-- Supabase always keys by UUID. Only the tables' OWN ids change.
--
-- Run this in the Supabase SQL Editor. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS challenge_entries CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;

-- ── Posts ─────────────────────────────────────────────────────
CREATE TABLE community_posts (
  id             BIGSERIAL PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name    TEXT NOT NULL,
  author_avatar  TEXT,
  text           TEXT NOT NULL,
  -- If sharing one of the site's real recipes, recipe_id links back to
  -- it (matches an ID in data/index.json). If sharing an original
  -- creation, recipe_id is null and the recipe_* fields below carry
  -- the user's own entry instead.
  recipe_id      TEXT,
  recipe_title   TEXT,
  recipe_emoji   TEXT,
  recipe_cuisine TEXT,
  recipe_time    INT,
  recipe_cal     INT,
  tags           TEXT[] DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users insert own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_posts_created ON community_posts(created_at DESC);


-- ── Likes ─────────────────────────────────────────────────────
CREATE TABLE post_likes (
  id         BIGSERIAL PRIMARY KEY,
  post_id    BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)   -- one like per user per post — no double-liking
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read likes"  ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users like posts"       ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike own likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_likes_post ON post_likes(post_id);


-- ── Comments ──────────────────────────────────────────────────
CREATE TABLE post_comments (
  id          BIGSERIAL PRIMARY KEY,
  post_id     BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments"  ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users add comments"        ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON post_comments FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_comments_post ON post_comments(post_id);


-- ── Challenges ────────────────────────────────────────────────
-- Admin-managed: insert new challenges directly via the Supabase
-- Table Editor (or a future admin panel) — there's no public INSERT
-- policy, deliberately, so random users can't create fake challenges.
CREATE TABLE challenges (
  id          BIGSERIAL PRIMARY KEY,
  icon        TEXT,
  title       TEXT NOT NULL,
  description TEXT,
  deadline    TIMESTAMPTZ NOT NULL,   -- a REAL date — "Ends in 5 days" is computed from this, not typed by hand
  prize       TEXT,
  tag         TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read challenges" ON challenges FOR SELECT USING (true);


-- ── Challenge entries ─────────────────────────────────────────
CREATE TABLE challenge_entries (
  id           BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id      BIGINT REFERENCES community_posts(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)   -- one entry per user per challenge
);

ALTER TABLE challenge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read entries" ON challenge_entries FOR SELECT USING (true);
CREATE POLICY "Users enter challenges"  ON challenge_entries FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ── Seed 3 real challenges so the tab isn't empty on first load ──
-- Real future deadlines this time, not static "Ends in 5 days" text.
INSERT INTO challenges (icon, title, description, deadline, prize, tag) VALUES
  ('🇰🇪', 'East African Cook-Off',
   'Cook any traditional East African recipe, share your photo and story. Best presentation and cultural authenticity wins.',
   now() + interval '5 days', '🏆 Featured Chef badge + Homepage feature', 'eastafrica'),
  ('🌱', 'Vegan World Tour',
   'Share a vegan recipe from any country in the world. Judges will score on creativity, nutrition, and cultural authenticity.',
   now() + interval '12 days', '🥇 Gold Chef badge + Recipe book feature', 'veganworldtour'),
  ('⚡', '20-Minute Challenge',
   'Share a delicious meal you can make in under 20 minutes. Speed, flavour, and simplicity are the judging criteria.',
   now() + interval '3 days', '⚡ Speed Cook badge + Weekly spotlight', '20minchallenge');
