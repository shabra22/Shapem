# Data pipeline

`js/data.js` is the source of truth (909 recipes). It is **build input
only** — never sent to the browser.

## After editing recipes

```bash
node build-data.js
```

Generates:

| Output | Size | When it loads |
|---|---|---|
| `data/index.json` | 0.69 MB raw / **0.12 MB gzipped** | Once, on page load |
| `data/recipes/<ID>.json` | ~4 KB each | Only when a recipe is opened |

The build **fails** if two recipes share an ID — that would silently
overwrite a detail file.

## Result

| | Before | After |
|---|---|---|
| Upfront payload | 0.85 MB gzipped | **0.12 MB gzipped** |
| Blocking script | Yes | No |
| Per recipe opened | 0 | ~7 KB |

**86% less** on first visit.

## How it works

`js/data-loader.js` fetches the index and exposes:

- `RECIPES` — light records for cards, search, filtering
- `GieesK.getRecipe(id)` — Promise of the full record, cached in memory
- `GieesK.prefetch(id)` — warm the cache on card hover
- `GieesK.ready` — Promise resolved once the index is in

The modal calls `getRecipe()` automatically. If a detail fetch fails it
falls back to the light record rather than breaking.

## Caching

`_headers` tells Cloudflare to cache detail files for a year
(`immutable` — they only change when the ID changes) and revalidate the
index hourly with `stale-while-revalidate`.

## Adding prefetch-on-hover

In `createRecipeCard()` in `js/render.js`:

```js
card.addEventListener('mouseenter', function () {
  if (window.GieesK) window.GieesK.prefetch(recipe.id);
}, { once: true });
```

Makes opening a recipe feel instant.
