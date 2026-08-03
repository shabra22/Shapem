/* ═══════════════════════════════════════════════════════════════
   GIEESK — Data Loader
   ───────────────────────────────────────────────────────────────
   Loads the light catalogue up front, fetches full recipe detail
   only when a recipe is actually opened.

   Replaces the old 3.6 MB js/data.js blocking script.

   Exposes:
     RECIPES              — array of light records (browse + search)
     GieesK.getRecipe(id) — Promise → full record (cached)
     GieesK.prefetch(id)  — warm the cache on hover
     GieesK.ready         — Promise resolved once the index is in
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var INDEX_URL  = 'data/index.json';
  var DETAIL_URL = 'data/recipes/';

  // In-memory cache — the browser HTTP cache handles persistence,
  // this just avoids re-parsing on repeat opens in the same session.
  var cache   = new Map();
  var inflight= new Map();

  window.RECIPES = [];

  var resolveReady, rejectReady;
  var ready = new Promise(function (res, rej) { resolveReady = res; rejectReady = rej; });

  /* ── Load the catalogue ──────────────────────────────────────── */
  function loadIndex() {
    return fetch(INDEX_URL, { cache: 'default' })
      .then(function (r) {
        if (!r.ok) throw new Error('index ' + r.status);
        return r.json();
      })
      .then(function (list) {
        window.RECIPES = list;
        document.dispatchEvent(new CustomEvent('recipes:ready', { detail: { count: list.length } }));
        resolveReady(list);
        return list;
      })
      .catch(function (err) {
        console.error('[GieesK] Recipe index failed to load:', err);
        document.dispatchEvent(new CustomEvent('recipes:error', { detail: { error: err } }));
        rejectReady(err);
        throw err;
      });
  }

  /* ── Fetch one full recipe ───────────────────────────────────── */
  function getRecipe(id) {
    id = String(id);

    if (cache.has(id))    return Promise.resolve(cache.get(id));
    if (inflight.has(id)) return inflight.get(id);      // dedupe concurrent calls

    var p = fetch(DETAIL_URL + encodeURIComponent(id) + '.json', { cache: 'default' })
      .then(function (r) {
        if (!r.ok) throw new Error('recipe ' + id + ' → ' + r.status);
        return r.json();
      })
      .then(function (full) {
        cache.set(id, full);
        inflight.delete(id);
        return full;
      })
      .catch(function (err) {
        inflight.delete(id);
        // Graceful degradation: fall back to the light record so the UI
        // still shows something rather than breaking.
        var light = window.RECIPES.find(function (x) { return String(x.id) === id; });
        if (light) {
          console.warn('[GieesK] Detail unavailable for', id, '— showing summary.');
          return light;
        }
        throw err;
      });

    inflight.set(id, p);
    return p;
  }

  /* ── Warm the cache (call on card hover) ─────────────────────── */
  function prefetch(id) {
    id = String(id);
    if (cache.has(id) || inflight.has(id)) return;
    getRecipe(id).catch(function () {});   // silent
  }

  /* ── Search over the light index ─────────────────────────────── */
  function search(query) {
    var q = String(query || '').toLowerCase().trim();
    if (!q) return window.RECIPES.slice();
    return window.RECIPES.filter(function (r) {
      return (r.title   && r.title.toLowerCase().indexOf(q)   !== -1) ||
             (r.cuisine && r.cuisine.toLowerCase().indexOf(q) !== -1) ||
             (r.country && r.country.toLowerCase().indexOf(q) !== -1) ||
             (r.desc    && r.desc.toLowerCase().indexOf(q)    !== -1) ||
             (r.tags    && r.tags.join(' ').toLowerCase().indexOf(q) !== -1) ||
             (r.s       && r.s.indexOf(q) !== -1);     // ingredients + keywords
    });
  }

  window.GieesK = window.GieesK || {};
  window.GieesK.getRecipe = getRecipe;
  window.GieesK.prefetch  = prefetch;
  window.GieesK.search    = search;
  window.GieesK.ready     = ready;
  window.GieesK.cacheSize = function () { return cache.size; };

  loadIndex();
})();
