/* ═══════════════════════════════════════════
   SHAPEM — Recipe & Auth Modals
═══════════════════════════════════════════ */

function openRecipeModal(recipe) {
  var modal   = document.getElementById('recipeModal');
  var content = document.getElementById('modalContent');
  if (!modal || !content || !recipe) return;

  var ingredientsHTML = (recipe.ingredients || []).map(function(ing) {
    return '<div class="ingredient-item">' + ing + '</div>';
  }).join('');

  var stepsHTML = (recipe.steps || []).map(function(s, i) {
    return '<div class="step-item"><div class="step-num">' + (i+1) + '</div><div>' + s + '</div></div>';
  }).join('');

  var n = recipe.nutrition || {};

  var countryBadge = recipe.countryFlag
    ? '<span class="badge badge-gold">' + recipe.countryFlag + ' ' + recipe.country + '</span>' : '';

  var localNameHTML = recipe.localName
    ? '<p style="font-size:13px;color:var(--text-muted);margin-bottom:4px;font-style:italic">Local name: <strong style="color:var(--gold)">' + recipe.localName + '</strong></p>' : '';

  var longDescHTML = recipe.longDesc
    ? '<p style="color:var(--text-muted);font-size:13px;line-height:1.75;margin-top:8px;padding:14px 16px;background:var(--bg-card);border-left:3px solid var(--gold);border-radius:0 var(--r-md) var(--r-md) 0">' + recipe.longDesc + '</p>' : '';

  var collectionsHTML = (recipe.collections && recipe.collections.length)
    ? '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">' +
        recipe.collections.map(function(c) {
          return '<span style="padding:3px 10px;background:rgba(83,74,183,0.12);border:1px solid rgba(83,74,183,0.25);border-radius:var(--r-full);font-size:11px;font-weight:600;color:#AFA9EC">Collection: ' + c + '</span>';
        }).join('') + '</div>' : '';

  var metaHTML = (recipe.meta) ? (function() {
    var meta = recipe.meta;
    var items = [];
    if (meta.spiceLevel)      items.push('<span style="padding:3px 10px;background:rgba(216,90,48,0.12);border:1px solid rgba(216,90,48,0.25);border-radius:var(--r-full);font-size:11px;font-weight:600;color:#F08060">Spice: ' + meta.spiceLevel + '</span>');
    if (meta.cookingMethod)   items.push('<span style="padding:3px 10px;background:rgba(29,158,117,0.12);border:1px solid rgba(29,158,117,0.25);border-radius:var(--r-full);font-size:11px;font-weight:600;color:#4ECDA4">Method: ' + meta.cookingMethod + '</span>');
    if (meta.season && meta.season !== 'All Year') items.push('<span style="padding:3px 10px;background:rgba(201,150,58,0.12);border:1px solid rgba(201,150,58,0.25);border-radius:var(--r-full);font-size:11px;font-weight:600;color:var(--gold)">Season: ' + meta.season + '</span>');
    if (meta.kidFriendly)     items.push('<span style="padding:3px 10px;background:rgba(201,150,58,0.12);border:1px solid rgba(201,150,58,0.25);border-radius:var(--r-full);font-size:11px;font-weight:600;color:var(--gold)">Kid-Friendly</span>');
    if (meta.prepAhead)       items.push('<span style="padding:3px 10px;background:rgba(127,119,221,0.12);border:1px solid rgba(127,119,221,0.25);border-radius:var(--r-full);font-size:11px;font-weight:600;color:#AFA9EC">Prep Ahead</span>');
    if (meta.freezerFriendly) items.push('<span style="padding:3px 10px;background:rgba(56,138,221,0.12);border:1px solid rgba(56,138,221,0.25);border-radius:var(--r-full);font-size:11px;font-weight:600;color:#B5D4F4">Freezer-Friendly</span>');
    return items.length ? '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">' + items.join('') + '</div>' : '';
  })() : '';

  var chefTipsHTML = recipe.chefTips
    ? '<div class="modal-section-title">Chef\'s Tips</div><div style="display:flex;flex-direction:column;gap:8px">' +
        recipe.chefTips.map(function(t) {
          return '<div style="display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--text-secondary)"><span style="color:var(--gold);flex-shrink:0;margin-top:2px"><i class="ti ti-bulb"></i></span>' + t + '</div>';
        }).join('') + '</div>' : '';

  var mistakesHTML = recipe.commonMistakes
    ? '<div class="modal-section-title">Common Mistakes to Avoid</div><div style="display:flex;flex-direction:column;gap:8px">' +
        recipe.commonMistakes.map(function(m) {
          return '<div style="display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--text-secondary)"><span style="color:var(--coral);flex-shrink:0;margin-top:2px"><i class="ti ti-alert-circle"></i></span>' + m + '</div>';
        }).join('') + '</div>' : '';

  var substitutionsHTML = (recipe.substitutions && recipe.substitutions.length)
    ? '<div class="modal-section-title">Ingredient Substitutions</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
        recipe.substitutions.map(function(s) {
          return '<div style="padding:10px 12px;background:var(--bg-card);border:1px solid var(--border-dim);border-radius:var(--r-md)">' +
            '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px">Instead of ' + s.original + '</div>' +
            '<div style="font-size:13px;color:var(--text-secondary)">' + s.alternative + '</div></div>';
        }).join('') + '</div>' : '';

  var servedWithHTML = recipe.servedWith
    ? '<div class="modal-section-title">Best Served With</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
        recipe.servedWith.map(function(s) {
          return '<span class="badge badge-emerald">' + s + '</span>';
        }).join('') + '</div>' : '';

  var culturalHTML = recipe.culturalNote
    ? '<div class="modal-section-title">Cultural Significance</div>' +
      '<div style="font-size:13px;color:var(--text-secondary);line-height:1.75;padding:14px 16px;background:var(--bg-card);border-radius:var(--r-md);border:1px solid var(--border-gold)">' +
      '<i class="ti ti-world" style="color:var(--gold);margin-right:6px"></i>' + recipe.culturalNote + '</div>' : '';

  var variationsHTML = recipe.regionalVariations
    ? '<div class="modal-section-title">Regional Variations</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px">' +
        recipe.regionalVariations.map(function(v) {
          return '<div style="display:flex;gap:8px;font-size:13px;color:var(--text-secondary)"><span style="color:var(--gold)">.</span>' + v + '</div>';
        }).join('') + '</div>' : '';

  var healthHTML = recipe.healthBenefits
    ? '<div class="modal-section-title">Health Benefits</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px">' +
        recipe.healthBenefits.map(function(h) {
          return '<div style="display:flex;gap:8px;font-size:13px;color:var(--text-secondary)"><span style="color:var(--emerald)"><i class="ti ti-heart"></i></span>' + h + '</div>';
        }).join('') + '</div>' : '';

  var storageHTML = recipe.storage
    ? '<div class="modal-section-title">Storage & Reheating</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        '<div style="padding:12px;background:var(--bg-card);border-radius:var(--r-md);border:1px solid var(--border-dim)">' +
          '<div style="font-size:11px;color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px"><i class="ti ti-fridge"></i> Storage</div>' +
          '<div style="font-size:13px;color:var(--text-secondary)">' + recipe.storage + '</div></div>' +
        '<div style="padding:12px;background:var(--bg-card);border-radius:var(--r-md);border:1px solid var(--border-dim)">' +
          '<div style="font-size:11px;color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px"><i class="ti ti-flame"></i> Reheating</div>' +
          '<div style="font-size:13px;color:var(--text-secondary)">' + (recipe.reheating || 'Reheat until piping hot.') + '</div></div>' +
      '</div>' : '';

  var relatedHTML = '';
  if (recipe.relatedRecipes && recipe.relatedRecipes.length) {
    var related = recipe.relatedRecipes.map(function(rid) {
      return RECIPES.find(function(r) { return r.id === rid; });
    }).filter(Boolean).slice(0, 4);
    if (related.length) {
      relatedHTML = '<div class="modal-section-title">You May Also Like</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">' +
          related.map(function(r) {
            return '<div onclick="closeRecipeModal();setTimeout(function(){openRecipeModal(RECIPES.find(function(x){return x.id===\'' + r.id + '\';}));},120)"' +
              ' style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-card);border:1px solid var(--border-dim);border-radius:var(--r-md);cursor:pointer"' +
              ' onmouseover="this.style.borderColor=\'var(--gold)\'" onmouseout="this.style.borderColor=\'var(--border-dim)\'">' +
              '<span style="font-size:1.6rem;flex-shrink:0">' + r.emoji + '</span>' +
              '<div><div style="font-size:12px;font-weight:600;color:var(--text-primary);line-height:1.3">' + r.title + '</div>' +
              '<div style="font-size:11px;color:var(--text-muted)">' + r.time + 'min</div></div></div>';
          }).join('') + '</div>';
    }
  }

  var nutCols = '';
  if (n.cal)     nutCols += '<div class="nutrition-item"><div class="nutrition-val">' + n.cal + '</div><div class="nutrition-label">Calories</div></div>';
  if (n.protein !== undefined) nutCols += '<div class="nutrition-item"><div class="nutrition-val">' + n.protein + 'g</div><div class="nutrition-label">Protein</div></div>';
  if (n.carbs   !== undefined) nutCols += '<div class="nutrition-item"><div class="nutrition-val">' + n.carbs + 'g</div><div class="nutrition-label">Carbs</div></div>';
  if (n.fat     !== undefined) nutCols += '<div class="nutrition-item"><div class="nutrition-val">' + n.fat + 'g</div><div class="nutrition-label">Fat</div></div>';
  if (n.fiber   !== undefined) nutCols += '<div class="nutrition-item"><div class="nutrition-val">' + n.fiber + 'g</div><div class="nutrition-label">Fiber</div></div>';
  if (n.sodium  !== undefined) nutCols += '<div class="nutrition-item"><div class="nutrition-val">' + n.sodium + 'mg</div><div class="nutrition-label">Sodium</div></div>';
  var nutCount = Object.values(n).filter(function(v) { return v !== undefined; }).length;

  content.innerHTML =
    '<div class="modal-recipe-hero-placeholder">' + recipe.emoji + '</div>' +
    '<div class="modal-body">' +
      collectionsHTML +
      metaHTML +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
        (recipe.tags || []).map(function(t) { return '<span class="badge badge-emerald">' + t + '</span>'; }).join('') +
        '<span class="badge badge-gold">' + (recipe.cuisine || '') + '</span>' +
        countryBadge +
        (recipe.course ? '<span class="badge badge-purple">' + recipe.course + '</span>' : '') +
      '</div>' +
      localNameHTML +
      '<h2 class="modal-recipe-title">' + recipe.title + '</h2>' +
      '<p style="color:var(--text-secondary);font-size:14px;line-height:1.7;margin-bottom:8px">' + (recipe.desc || '') + '</p>' +
      longDescHTML +
      '<div class="modal-recipe-meta" style="margin-top:var(--space-lg)">' +
        (recipe.yieldDesc    ? '<span class="modal-meta-item"><i class="ti ti-stack"></i> ' + recipe.yieldDesc + '</span>' : '') +
        (recipe.prepTime     ? '<span class="modal-meta-item"><i class="ti ti-clock"></i> ' + recipe.prepTime + 'm prep</span>' : '') +
        (recipe.restTime     ? '<span class="modal-meta-item"><i class="ti ti-hourglass"></i> ' + recipe.restTime + 'm rest</span>' : '') +
        (recipe.marinateTime ? '<span class="modal-meta-item"><i class="ti ti-clock-play"></i> ' + recipe.marinateTime + 'm marinate</span>' : '') +
        (recipe.cookTime > 0 ? '<span class="modal-meta-item"><i class="ti ti-flame"></i> ' + recipe.cookTime + 'm cook</span>' : '') +
        '<span class="modal-meta-item"><i class="ti ti-clock"></i> ' + recipe.time + 'm total</span>' +
        '<span class="modal-meta-item"><i class="ti ti-fire"></i> ' + recipe.cal + ' kcal</span>' +
        '<span class="modal-meta-item"><i class="ti ti-users"></i> Serves ' + (recipe.servings || 4) + '</span>' +
        '<span class="modal-meta-item"><i class="ti ti-chart-bar"></i> ' + recipe.diff + '</span>' +
        '<span class="modal-meta-item" style="margin-left:auto"><div class="stars">' + starsHTML(recipe.rating) + '</div>&nbsp;' + recipe.rating + ' (' + (recipe.reviews || 0).toLocaleString() + ' reviews)</span>' +
      '</div>' +
      '<div class="modal-section-title">Ingredients</div>' +
      '<div class="ingredient-list">' + ingredientsHTML + '</div>' +
      '<div class="modal-section-title">Instructions</div>' +
      '<div class="step-list">' + stepsHTML + '</div>' +
      chefTipsHTML +
      mistakesHTML +
      '<div class="modal-section-title">Nutrition (per serving)</div>' +
      '<div class="nutrition-grid" style="grid-template-columns:repeat(' + Math.min(nutCount, 6) + ',1fr)">' + nutCols + '</div>' +
      substitutionsHTML +
      servedWithHTML +
      healthHTML +
      culturalHTML +
      variationsHTML +
      storageHTML +
      relatedHTML +
      '<div style="display:flex;gap:12px;margin-top:var(--space-xl);flex-wrap:wrap">' +
        '<button class="btn-gold btn-lg" onclick="if(typeof saveRecipe===\'function\')saveRecipe(\'' + recipe.id + '\');this.innerHTML=\'<i class=\\\"ti ti-bookmark-filled\\\"></i> Saved!\'">' +
          '<i class="ti ti-bookmark"></i> Save Recipe' +
        '</button>' +
        '<button class="btn-outline btn-lg" onclick="if(typeof openDashboard===\'function\')openDashboard(\'planner\')">' +
          '<i class="ti ti-calendar"></i> Add to Meal Plan' +
        '</button>' +
        '<button class="btn-ghost" onclick="if(typeof openDashboard===\'function\')openDashboard(\'shopping\')">' +
          '<i class="ti ti-shopping-cart"></i> Shopping List' +
        '</button>' +
      '</div>' +
    '</div>';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRecipeModal() {
  var modal = document.getElementById('recipeModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function initModals() {
  var mc = document.getElementById('modalClose');
  var ac = document.getElementById('authClose');
  var rm = document.getElementById('recipeModal');
  var am = document.getElementById('authModal');

  if (mc) mc.addEventListener('click', closeRecipeModal);
  if (ac) ac.addEventListener('click', closeAuthModal);
  if (rm) rm.addEventListener('click', function(e) { if (e.target === rm) closeRecipeModal(); });
  if (am) am.addEventListener('click', function(e) { if (e.target === am) closeAuthModal(); });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closeRecipeModal(); if (typeof closeAuthModal === 'function') closeAuthModal(); }
  });
}
