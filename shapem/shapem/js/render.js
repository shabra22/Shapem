/* ═══════════════════════════════════════════
   SHAPEM — DOM Renderers
═══════════════════════════════════════════ */

function formatNum(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n/1000).toFixed(1) + 'k';
  return n;
}

function starsHTML(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  let html = '';
  for (let i = 0; i < full; i++) html += '<i class="ti ti-star-filled"></i>';
  if (half) html += '<i class="ti ti-star-half-filled"></i>';
  for (let i = 0; i < 5 - full - half; i++) html += '<i class="ti ti-star"></i>';
  return html;
}

function diffColor(diff) {
  return { Easy:'emerald', Medium:'gold', Hard:'coral', Expert:'purple' }[diff] || 'gold';
}

// ── Recipe Card ──────────────────────────
function createRecipeCard(recipe, delay) {
  delay = delay || 0;
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.style.animationDelay = delay + 'ms';
  card.dataset.id = recipe.id;

  const tagsHTML = (recipe.tags || []).slice(0,2).map(function(t) {
    return '<span class="badge badge-emerald">' + t + '</span>';
  }).join('');

  card.innerHTML =
    '<div class="recipe-card-img">' +
      '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:5rem;background:var(--bg-elevated)">' +
        recipe.emoji +
      '</div>' +
      '<div class="recipe-card-badges">' + tagsHTML + '</div>' +
      '<button class="recipe-save-btn" data-id="' + recipe.id + '" aria-label="Save recipe">' +
        '<i class="ti ti-bookmark"></i>' +
      '</button>' +
    '</div>' +
    '<div class="recipe-card-body">' +
      '<div class="recipe-card-meta">' +
        '<span class="recipe-meta-item"><i class="ti ti-clock"></i>' + recipe.time + 'm</span>' +
        '<span class="recipe-meta-item"><i class="ti ti-flame"></i>' + recipe.cal + ' cal</span>' +
        '<span class="badge badge-' + diffColor(recipe.diff) + '">' + recipe.diff + '</span>' +
      '</div>' +
      '<h3 class="recipe-card-title">' + recipe.title + '</h3>' +
      '<div class="recipe-card-author">' +
        '<div class="author-avatar">' + (recipe.authorEmoji || '👨‍🍳') + '</div>' +
        '<span class="author-name">' + (recipe.author || '') + '</span>' +
        '<span class="recipe-rating"><i class="ti ti-star-filled" style="font-size:12px"></i> ' + recipe.rating + '</span>' +
      '</div>' +
    '</div>';

  card.addEventListener('click', function(e) {
    if (e.target.closest('.recipe-save-btn')) return;
    openRecipeModal(recipe);
  });

  card.querySelector('.recipe-save-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    var btn = e.currentTarget;
    btn.classList.toggle('saved');
    btn.querySelector('i').className = btn.classList.contains('saved') ? 'ti ti-bookmark-filled' : 'ti ti-bookmark';
    saveRecipe && saveRecipe(recipe.id);
  });

  return card;
}

// ── Trending ─────────────────────────────
function renderTrending() {
  var grid = document.getElementById('trendingGrid');
  if (!grid) return;
  var top = RECIPES.slice().sort(function(a,b){ return b.rating - a.rating; }).slice(0,6);
  top.forEach(function(r, i) { grid.appendChild(createRecipeCard(r, i * 80)); });
}

// ── Seasonal ──────────────────────────────
function renderSeasonal() {
  var grid = document.getElementById('seasonalGrid');
  if (!grid) return;
  var seasonal = RECIPES.slice().sort(function(a,b){ return b.reviews - a.reviews; }).slice(0,4);
  seasonal.forEach(function(r, i) { grid.appendChild(createRecipeCard(r, i * 80)); });
}

// ── Cuisines ─────────────────────────────
function renderCuisines() {
  var grid = document.getElementById('cuisineGrid');
  if (!grid) return;
  CUISINES.forEach(function(c, i) {
    var card = document.createElement('div');
    card.className = 'cuisine-card';
    card.style.animationDelay = (i * 60) + 'ms';
    var bgColor = c.color || '#1A1A18';
    card.style.background = 'linear-gradient(145deg, ' + bgColor + '33, ' + bgColor + '11)';
    card.innerHTML =
      '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:5rem;opacity:0.35">' + c.flag + '</div>' +
      '<div class="cuisine-card-overlay">' +
        '<div class="cuisine-flag">' + c.flag + '</div>' +
        '<div class="cuisine-name">' + c.name + '</div>' +
        '<div class="cuisine-count">' + formatNum(c.count) + ' recipes</div>' +
      '</div>';
    card.addEventListener('click', function() {
      var inp = document.getElementById('searchInput');
      if (inp) { inp.value = c.name; performSearch(c.name); }
      var strip = document.getElementById('search-strip');
      if (strip) strip.scrollIntoView({ behavior:'smooth' });
    });
    grid.appendChild(card);
  });
}

// ── Chefs ────────────────────────────────
function renderChefs() {
  var grid = document.getElementById('chefsGrid');
  if (!grid) return;
  CHEFS.forEach(function(chef, i) {
    var card = document.createElement('div');
    card.className = 'chef-card';
    card.style.animationDelay = (i * 70) + 'ms';
    card.innerHTML =
      '<div class="chef-photo">' + chef.emoji + '</div>' +
      '<div class="chef-name">' + chef.name + '</div>' +
      '<div class="chef-origin"><i class="ti ti-map-pin" style="font-size:11px"></i> ' + chef.origin + '</div>' +
      '<div class="chef-stats">' +
        '<div><div class="chef-stat-num">' + chef.recipes + '</div><div class="chef-stat-label">Recipes</div></div>' +
        '<div><div class="chef-stat-num">' + formatNum(chef.followers) + '</div><div class="chef-stat-label">Followers</div></div>' +
        '<div><div class="chef-stat-num">' + chef.rating + '</div><div class="chef-stat-label">Rating</div></div>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">' + chef.specialty + '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;padding:8px 10px;background:rgba(29,158,117,0.08);border:1px solid rgba(29,158,117,0.2);border-radius:var(--r-md)">' +
        '<i class="ti ti-users" style="color:var(--emerald);font-size:14px"></i>' +
        '<span style="font-size:11px;color:var(--emerald);font-weight:600">Active in Community</span>' +
      '</div>';
    card.addEventListener('click', function(e) {
      if (e.target.closest('button')) return;
      if (typeof openCommunity === 'function') openCommunity();
      setTimeout(function() {
        if (typeof switchCommunityTab === 'function') switchCommunityTab('chefs');
        if (typeof openChefProfile === 'function') openChefProfile(i);
      }, 200);
    });
    grid.appendChild(card);
  });
}

// ── Badges ────────────────────────────────
function renderBadges() {
  var wrap = document.getElementById('badgesShowcase');
  if (!wrap) return;
  BADGES.forEach(function(b) {
    var el = document.createElement('div');
    el.className = 'badge-item';
    el.title = b.desc;
    el.innerHTML = '<div class="badge-icon">' + b.icon + '</div><div class="badge-title">' + b.title + '</div>';
    wrap.appendChild(el);
  });
}

// ── Leaderboard ──────────────────────────
function renderLeaderboard() {
  var wrap = document.getElementById('leaderboard');
  if (!wrap) return;
  wrap.innerHTML = '<div class="lb-header"><i class="ti ti-trophy"></i><span>Weekly Leaderboard</span></div>';
  LEADERBOARD.forEach(function(entry) {
    var rankClass = entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : entry.rank === 3 ? 'bronze' : '';
    var rankIcon  = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank;
    var row = document.createElement('div');
    row.className = 'lb-row';
    row.innerHTML =
      '<div class="lb-rank ' + rankClass + '">' + rankIcon + '</div>' +
      '<div class="lb-avatar">' + entry.emoji + '</div>' +
      '<div class="lb-name">' + entry.name + '</div>' +
      '<div class="lb-score">' + formatNum(entry.score) + '</div>';
    wrap.appendChild(row);
  });
}

// ── Counter animation ────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(function(el) {
    var target   = parseInt(el.dataset.target);
    var duration = 2000;
    var start    = performance.now();
    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNum(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(target);
    }
    requestAnimationFrame(step);
  });
}

// ── Intersection observer ────────────────
function observeSection(id, callback) {
  var el = document.getElementById(id);
  if (!el) return;
  var obs = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) { callback(); obs.disconnect(); }
  }, { threshold: 0.1 });
  obs.observe(el);
}
