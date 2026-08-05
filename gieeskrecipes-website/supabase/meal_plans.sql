-- ═══════════════════════════════════════════════════════════════
-- GieesK Recipes — meal_plans / meal_plan_items
-- ───────────────────────────────────────────────────────────────
-- ACTION NEEDED — run this in the Supabase SQL Editor.
--
-- meal_plans and meal_plan_items already exist from your original
-- setup script, and the JS code was already correctly rewritten to
-- match their real structure. But testing (video evidence — every
-- add silently failed, in every attempt) traced back to something
-- that predates any of my changes:
--
--   alter table public.meal_plan_items enable row level security;
--
-- ...was run, but NO POLICY was ever created for meal_plan_items.
-- In Postgres, enabling RLS with zero policies means "deny
-- everything" by default — every insert/select silently fails,
-- with no visible error to the end user, regardless of how correct
-- the application code is. meal_plans itself DOES have a working
-- policy ("Users can manage meal plans"), which is why the WEEK
-- gets created fine — it's specifically the individual meal slots
-- (meal_plan_items) that were blocked.
--
-- meal_plan_items has no user_id column of its own (it's a child
-- row linked via plan_id), so the policy checks ownership through
-- the parent meal_plans row instead of a direct column comparison.
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users manage own meal plan items" ON public.meal_plan_items;

CREATE POLICY "Users manage own meal plan items"
  ON public.meal_plan_items
  FOR ALL
  USING (
    plan_id IN (SELECT id FROM public.meal_plans WHERE user_id = auth.uid())
  )
  WITH CHECK (
    plan_id IN (SELECT id FROM public.meal_plans WHERE user_id = auth.uid())
  );
