/* ═══════════════════════════════════════════
   GIEESKRECIPES — Dashboard Pages
═══════════════════════════════════════════ */

// ── Open dashboard to a specific tab ─────
function openDashboard(tab) {
  tab = tab || 'profile';
  if (!currentUser) { openAuthModal('login'); return; }

  // Hide every other page
  ['page-home','page-recipes','page-community','page-chef-profile'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  var dash = document.getElementById('page-dashboard');
  if (!dash) {
    dash = buildDashboardShell();
    document.body.insertBefore(dash, document.querySelector('footer'));
  }
  dash.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  switchDashTab(tab);
}

function closeDashboard() {
  const dash = document.getElementById('page-dashboard');
  if (dash) dash.style.display = 'none';
  // Show home page
  ['page-recipes', 'page-community', 'page-chef-profile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.getElementById('page-home').style.display = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Build the whole dashboard shell ──────
function buildDashboardShell() {
  const user   = currentUser;
  if (!user) return document.createElement('div');
  const meta   = user.user_metadata || {};
  const name   = meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : 'Chef');
  const email  = user.email || '';
  const avatar = meta.avatar_url || meta.picture || null;
  const initial = name.charAt(0).toUpperCase();

  const el = document.createElement('div');
  el.id = 'page-dashboard';
  el.style.cssText = 'min-height:100vh;padding-top:var(--nav-h);background:var(--bg-void);';

  el.innerHTML = `
    <!-- Hero bar -->
    <div class="dash-hero">
      <div class="container">
        <div class="dash-hero-inner">
          <button class="btn-ghost dash-hero-back" onclick="closeDashboard()">
            <i class="ti ti-arrow-left"></i> Back
          </button>
          <div class="dash-hero-avatar" id="dashHeroAvatar">
            ${avatar ? `<img src="${avatar}" alt="${name}">` : initial}
          </div>
          <div class="dash-hero-info">
            <div class="dash-hero-name" id="dashHeroName">${name}</div>
            <div class="dash-hero-email">${email}</div>
          </div>
          <div class="dash-hero-meta">
            <div class="dash-hero-stat">
              <div class="dash-hero-stat-num" id="statSaved">0</div>
              <div class="dash-hero-stat-label">Saved</div>
            </div>
            <div class="dash-hero-stat">
              <div class="dash-hero-stat-num" id="statPlanned">0</div>
              <div class="dash-hero-stat-label">Planned</div>
            </div>
            <div class="dash-hero-stat">
              <div class="dash-hero-stat-num" id="statShopping">0</div>
              <div class="dash-hero-stat-label">Shopping</div>
            </div>
          </div>
        </div>
        <!-- Tabs -->
        <div class="dash-tabs">
          <button class="dash-tab active" data-tab="profile"  onclick="switchDashTab('profile')">  <i class="ti ti-user"></i>     Profile</button>
          <button class="dash-tab"        data-tab="saved"    onclick="switchDashTab('saved')">    <i class="ti ti-bookmark"></i>  Saved Recipes</button>
          <button class="dash-tab"        data-tab="planner"  onclick="switchDashTab('planner')">  <i class="ti ti-calendar"></i>  Meal Planner</button>
          <button class="dash-tab"        data-tab="shopping" onclick="switchDashTab('shopping')"> <i class="ti ti-shopping-cart"></i> Shopping List</button>
        </div>
      </div>
    </div>

    <!-- Tab content panels -->
    <div class="dash-content">
      <div class="container">
        <div id="dash-panel-profile"  class="dash-panel" style="display:none"></div>
        <div id="dash-panel-saved"    class="dash-panel" style="display:none"></div>
        <div id="dash-panel-planner"  class="dash-panel" style="display:none"></div>
        <div id="dash-panel-shopping" class="dash-panel" style="display:none"></div>
      </div>
    </div>`;

  return el;
}

// ── Switch tabs ───────────────────────────
function switchDashTab(tab) {
  var dash = document.getElementById('page-dashboard');
  if (!dash) return;
  dash.querySelectorAll('.dash-tab').forEach(function(t) {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  dash.querySelectorAll('.dash-panel').forEach(function(p) {
    p.style.display = p.id === 'dash-panel-' + tab ? '' : 'none';
  });
  var panel = document.getElementById('dash-panel-' + tab);
  // Always rebuild — these panels read live data (saved recipes, shopping
  // list, meal plan) that can change elsewhere in the app during the same
  // session (e.g. saving a recipe from its modal). A one-time "build once
  // and cache" gate here meant the tab kept showing whatever it looked
  // like the FIRST time it was opened, forever, until a hard page reload —
  // saving something new would never appear without one.
  if (panel) {
    if (tab === 'profile')  buildProfilePanel(panel);
    if (tab === 'saved')    buildSavedPanel(panel);
    if (tab === 'planner')  buildPlannerPanel(panel);
    if (tab === 'shopping') buildShoppingPanel(panel);
  }
}

// ══════════════════════════════════════════
// PROFILE PANEL
// ══════════════════════════════════════════
function buildProfilePanel(panel) {
  const user   = currentUser;
  if (!user) { panel.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-muted)">Please sign in to view your profile.</div>'; return; }
  const name   = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || user.email.split('@')[0] || '';
  const avatar = (user.user_metadata && (user.user_metadata.avatar_url || user.user_metadata.picture)) || null;
  const initial = (name || 'C').charAt(0).toUpperCase();

  const diets = ['Vegetarian','Vegan','Gluten-Free','Dairy-Free','Keto','Halal','Kosher','Nut-Free'];

  panel.innerHTML = `
    <div class="profile-grid">

      <!-- Left: avatar + diet prefs -->
      <div>
        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title"><i class="ti ti-camera"></i> Profile Photo</span>
          </div>
          <div class="dash-card-body" style="display:flex;flex-direction:column;align-items:center;gap:16px">
            <div class="avatar-upload-preview" id="avatarPreview" onclick="document.getElementById('avatarInput').click()">
              ${avatar ? `<img src="${avatar}" id="avatarImg">` : `<span id="avatarInitial">${initial}</span>`}
              <div class="avatar-upload-overlay"><i class="ti ti-camera"></i></div>
            </div>
            <input type="file" id="avatarInput" accept="image/*" style="display:none" onchange="previewAvatar(this)">
            <p style="font-size:12px;color:var(--text-muted);text-align:center">Click to upload a new photo.<br>JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <div class="dash-card" style="margin-top:1rem">
          <div class="dash-card-header">
            <span class="dash-card-title"><i class="ti ti-leaf"></i> Dietary Preferences</span>
          </div>
          <div class="dash-card-body">
            <div class="diet-tags" id="dietTags">
              ${diets.map(d => `<button class="diet-tag" onclick="this.classList.toggle('active')">${d}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Right: form fields -->
      <div>
        <div class="dash-card">
          <div class="dash-card-header">
            <span class="dash-card-title"><i class="ti ti-user"></i> Personal Information</span>
            <span id="profileSaveMsg" style="font-size:12px;color:var(--emerald);display:none">✓ Saved!</span>
          </div>
          <div class="dash-card-body">
            <div class="profile-form">
              <div class="form-row">
                <div class="form-field">
                  <label class="form-label">Full Name</label>
                  <input class="form-input" id="pfName" type="text" value="${name}" placeholder="Your full name" />
                </div>
                <div class="form-field">
                  <label class="form-label">Username</label>
                  <input class="form-input" id="pfUsername" type="text" placeholder="@username" />
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Email</label>
                <input class="form-input" type="email" value="${user.email || ''}" disabled style="opacity:0.5;cursor:not-allowed" />
              </div>
              <div class="form-field">
                <label class="form-label">Bio</label>
                <textarea class="form-textarea" id="pfBio" placeholder="Tell the GieesK Recipes community a little about yourself…"></textarea>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label class="form-label">Country</label>
                  <select class="form-select" id="pfCountry">
                    <option value="">Select country…</option>
                    ${['Kenya','Nigeria','Ghana','South Africa','Ethiopia','Uganda','Tanzania','Egypt','Morocco','UK','USA','Canada','Australia','India','UAE'].map(c => `<option>${c}</option>`).join('')}
                  </select>
                </div>
                <div class="form-field">
                  <label class="form-label">Favourite Cuisine</label>
                  <select class="form-select" id="pfCuisine">
                    <option value="">Select cuisine…</option>
                    ${['Kenyan','Nigerian','Ethiopian','Italian','Japanese','Indian','Mexican','Thai','Chinese','Lebanese','French','Greek'].map(c => `<option>${c}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-gold" onclick="saveProfile()">Save Changes</button>
                <button class="btn-ghost" onclick="document.getElementById('pfName').value='${name}'">Reset</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Change password -->
        <div class="dash-card" style="margin-top:1rem">
          <div class="dash-card-header">
            <span class="dash-card-title"><i class="ti ti-lock"></i> Change Password</span>
          </div>
          <div class="dash-card-body">
            <div class="profile-form">
              <div class="form-field">
                <label class="form-label">New Password</label>
                <input class="form-input" id="pfNewPwd" type="password" placeholder="At least 8 characters" />
              </div>
              <div class="form-field">
                <label class="form-label">Confirm New Password</label>
                <input class="form-input" id="pfConfirmPwd" type="password" placeholder="Repeat new password" />
              </div>
              <div id="pwdChangeMsg" style="font-size:13px;display:none"></div>
              <button class="btn-gold" style="align-self:flex-start" onclick="changePassword()">Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  // Load saved profile from Supabase
  loadProfile();
}

async function loadProfile() {
  const sb = getSupabase();
  if (!sb || !currentUser) return;
  const { data } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
  if (!data) return;
  if (data.username && document.getElementById('pfUsername')) document.getElementById('pfUsername').value = data.username;
  if (data.bio       && document.getElementById('pfBio'))      document.getElementById('pfBio').value      = data.bio;
}

async function saveProfile() {
  const sb = getSupabase();
  if (!sb || !currentUser) return;
  const name     = document.getElementById('pfName')?.value.trim();
  const username = document.getElementById('pfUsername')?.value.trim();
  const bio      = document.getElementById('pfBio')?.value.trim();

  await sb.from('profiles').upsert({ id: currentUser.id, full_name: name, username, bio, updated_at: new Date().toISOString() });
  await sb.auth.updateUser({ data: { full_name: name } });

  // Update nav avatar name
  const nameEl = document.getElementById('userMenuName');
  const dashName = document.getElementById('dashHeroName');
  if (nameEl)   nameEl.textContent   = name;
  if (dashName) dashName.textContent = name;

  const msg = document.getElementById('profileSaveMsg');
  if (msg) { msg.style.display = ''; setTimeout(() => msg.style.display = 'none', 2500); }
}

async function changePassword() {
  const pwd1 = document.getElementById('pfNewPwd')?.value;
  const pwd2 = document.getElementById('pfConfirmPwd')?.value;
  const msg  = document.getElementById('pwdChangeMsg');
  if (!pwd1 || pwd1.length < 8) { showMsg(msg, 'Password must be at least 8 characters.', 'coral'); return; }
  if (pwd1 !== pwd2)             { showMsg(msg, 'Passwords do not match.', 'coral'); return; }
  const sb = getSupabase();
  const { error } = await sb.auth.updateUser({ password: pwd1 });
  if (error) { showMsg(msg, error.message, 'coral'); return; }
  showMsg(msg, '✓ Password updated successfully!', 'emerald');
  document.getElementById('pfNewPwd').value = '';
  document.getElementById('pfConfirmPwd').value = '';
}

function previewAvatar(input) {
  if (!input.files?.[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const prev = document.getElementById('avatarPreview');
    if (prev) prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"><div class="avatar-upload-overlay"><i class="ti ti-camera"></i></div>`;
  };
  reader.readAsDataURL(input.files[0]);
}

function showMsg(el, text, color) {
  if (!el) return;
  el.textContent = text;
  el.style.color   = color === 'emerald' ? 'var(--emerald)' : '#F08060';
  el.style.display = '';
  setTimeout(() => el.style.display = 'none', 3000);
}

// ══════════════════════════════════════════
// SAVED RECIPES PANEL
// ══════════════════════════════════════════
function buildSavedPanel(panel) {
  panel.innerHTML = `
    <div class="saved-toolbar">
      <div class="saved-search">
        <i class="ti ti-search"></i>
        <input type="text" placeholder="Search saved recipes…" oninput="filterSaved(this.value)" />
      </div>
      <button class="btn-ghost" onclick="closeDashboard();showPage('recipes')" style="white-space:nowrap">
        <i class="ti ti-plus"></i> Add Recipes
      </button>
    </div>
    <div class="collection-tabs" id="collectionTabs">
      <button class="collection-tab active" onclick="filterCollection('all',this)">All Saved</button>
      <button class="collection-tab" onclick="filterCollection('Favourites',this)">⭐ Favourites</button>
      <button class="collection-tab" onclick="filterCollection('Want to Try',this)">🔖 Want to Try</button>
      <button class="collection-tab" onclick="filterCollection('Made It',this)">✅ Made It</button>
    </div>
    <div id="savedGrid" class="recipe-grid"></div>`;

  loadSavedRecipes(panel);
}

// "3 days ago" for the card, exact ISO date in the tooltip for anyone
// who wants the precise date rather than a relative one.
function timeAgo(isoString) {
  if (!isoString) return '';
  const then = new Date(isoString);
  const secs = Math.floor((Date.now() - then.getTime()) / 1000);
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60]
  ];
  for (const [label, secInUnit] of units) {
    const n = Math.floor(secs / secInUnit);
    if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

async function loadSavedRecipes(panel) {
  const sb = getSupabase();
  if (!sb || !currentUser) return;
  const { data } = await sb.from('saved_recipes').select('recipe_id, saved_at').eq('user_id', currentUser.id);
  const grid = document.getElementById('savedGrid');
  if (!grid) return;

  // Update stat
  const statEl = document.getElementById('statSaved');
  if (statEl) statEl.textContent = data?.length || 0;

  if (!data || data.length === 0) {
    grid.innerHTML = `
      <div class="saved-empty" style="grid-column:1/-1">
        <i class="ti ti-bookmark"></i>
        <h3>No saved recipes yet</h3>
        <p>Browse recipes and tap the bookmark icon to save them here.</p>
        <button class="btn-gold" onclick="closeDashboard();showPage('recipes')">Browse Recipes</button>
      </div>`;
    return;
  }

  const savedAtById = {};
  data.forEach(d => { savedAtById[d.recipe_id] = d.saved_at; });

  const savedIds = data.map(d => d.recipe_id);
  const savedRecipes = RECIPES.filter(r => savedIds.includes(String(r.id)))
    // Most recently saved first — matches what people expect from a "saved" list
    .sort((a, b) => new Date(savedAtById[String(b.id)] || 0) - new Date(savedAtById[String(a.id)] || 0));

  if (savedRecipes.length === 0) {
    grid.innerHTML = `<div class="saved-empty" style="grid-column:1/-1"><i class="ti ti-bookmark"></i><h3>No matching recipes found</h3><p>Your saved recipe IDs don't match current recipes.</p></div>`;
    return;
  }

  grid.innerHTML = '';
  savedRecipes.forEach((r, i) => {
    const card = createRecipeCard(r, i * 60);
    card.dataset.title   = r.title.toLowerCase();
    card.dataset.cuisine = (r.cuisine || '').toLowerCase();

    const savedAt = savedAtById[String(r.id)];
    if (savedAt) {
      const body = card.querySelector('.recipe-card-body');
      if (body) {
        const badge = document.createElement('div');
        badge.className = 'saved-date-badge';
        badge.title = new Date(savedAt).toLocaleString(); // exact date/time on hover
        badge.innerHTML = '<i class="ti ti-clock"></i> Saved ' + timeAgo(savedAt);
        body.appendChild(badge);
      }
    }

    grid.appendChild(card);
  });
}

function filterSaved(q) {
  document.querySelectorAll('#savedGrid .recipe-card').forEach(card => {
    const match = !q || card.dataset.title?.includes(q.toLowerCase()) || card.dataset.cuisine?.includes(q.toLowerCase());
    card.style.display = match ? '' : 'none';
  });
}

function filterCollection(col, btn) {
  document.querySelectorAll('.collection-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  // For now show all (collections stored in DB in future)
  document.querySelectorAll('#savedGrid .recipe-card').forEach(c => c.style.display = '');
}

// ══════════════════════════════════════════
// MEAL PLANNER PANEL
// ══════════════════════════════════════════
let plannerWeekOffset = 0;
// meal_plans is now a real Supabase table (see supabase/meal_plans.sql) —
// keyed by absolute calendar date, not a "week offset" that silently
// meant something different depending on when you looked at it.
let plannerCache = {};   // 'YYYY-MM-DD-mealslot' -> {recipe_id, recipe_title, recipe_emoji} — populated fresh on every render, never trusted stale
let pendingSlot = null;
// Set by addCurrentRecipeToMealPlan() when the user clicks "Add to Meal
// Plan" on a recipe — the next slot they tap gets this recipe directly,
// skipping the search picker entirely, instead of the old behavior of
// just navigating to the planner tab and adding nothing.
let pendingMealPlanRecipe = null;

function buildPlannerPanel(panel) {
  panel.innerHTML = `
    <div class="planner-week-nav">
      <button class="planner-nav-btn" onclick="shiftWeek(-1)"><i class="ti ti-chevron-left"></i></button>
      <div class="planner-week-label" id="plannerWeekLabel"></div>
      <button class="planner-nav-btn" onclick="shiftWeek(1)"><i class="ti ti-chevron-right"></i></button>
      <button class="btn-ghost" onclick="plannerWeekOffset=0;renderPlanner()" style="margin-left:auto">Today</button>
    </div>
    <div id="plannerPendingBanner"></div>
    <div class="planner-grid" id="plannerGrid"><div class="dash-loading">Loading your plan…</div></div>
    <p style="font-size:12px;color:var(--text-muted);margin-top:1rem;text-align:center">Click any slot to add a recipe to your meal plan</p>

    <!-- Recipe picker modal -->
    <div class="planner-picker" id="plannerPicker" onclick="if(event.target===this)closePicker()">
      <div class="planner-picker-panel">
        <div class="planner-picker-header">
          <span class="planner-picker-title">Choose a Recipe</span>
          <button class="modal-close" style="position:static" onclick="closePicker()"><i class="ti ti-x"></i></button>
        </div>
        <div class="planner-picker-search">
          <input type="text" placeholder="Search recipes…" oninput="filterPicker(this.value)" />
        </div>
        <div class="planner-picker-list" id="pickerList"></div>
      </div>
    </div>`;

  renderPendingBanner();
  renderPlanner();
  buildPickerList();
}

function renderPendingBanner() {
  const el = document.getElementById('plannerPendingBanner');
  if (!el) return;
  if (!pendingMealPlanRecipe) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div style="background:rgba(201,150,58,0.12);border:1px solid var(--border-gold);border-radius:var(--r-md);padding:10px 14px;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:10px">
      <span style="font-size:13px;color:var(--text-primary)">${pendingMealPlanRecipe.emoji} Tap a slot below to add <strong>${pendingMealPlanRecipe.title}</strong></span>
      <button class="btn-ghost" style="font-size:12px;padding:4px 10px" onclick="pendingMealPlanRecipe=null;renderPendingBanner()">Cancel</button>
    </div>`;
}

function dateKey(d) { return d.toISOString().slice(0, 10); }   // 'YYYY-MM-DD'

async function fetchPlannerWeek(weekStart) {
  const sb = getSupabase();
  if (!sb || !currentUser) return {};
  const end = new Date(weekStart); end.setDate(weekStart.getDate() + 6);
  const { data, error } = await sb
    .from('meal_plans')
    .select('*')
    .eq('user_id', currentUser.id)
    .gte('plan_date', dateKey(weekStart))
    .lte('plan_date', dateKey(end));
  if (error) {
    console.error('[GieesK] meal_plans query failed — has supabase/meal_plans.sql been run?', error);
    return null;
  }
  const map = {};
  (data || []).forEach(row => { map[`${row.plan_date}-${row.meal_slot}`] = row; });
  return map;
}

async function renderPlanner() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const meals = ['breakfast','lunch','dinner','snack'];
  const mealLabels = { breakfast:'Breakfast', lunch:'Lunch', dinner:'Dinner', snack:'Snack' };
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1 + plannerWeekOffset * 7);
  weekStart.setHours(0,0,0,0);

  const label = document.getElementById('plannerWeekLabel');
  if (label) {
    const end = new Date(weekStart); end.setDate(weekStart.getDate() + 6);
    label.textContent = `${weekStart.toLocaleDateString('en',{month:'short',day:'numeric'})} – ${end.toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}`;
  }

  const grid = document.getElementById('plannerGrid');
  if (!grid) return;

  plannerCache = await fetchPlannerWeek(weekStart);
  if (plannerCache === null) {
    grid.innerHTML = `<div class="saved-empty" style="grid-column:1/-1"><i class="ti ti-alert-triangle"></i><h3>Couldn't load your meal plan</h3><p>Please try again in a moment.</p></div>`;
    return;
  }

  let html = `<div class="planner-cell header"></div>`;
  days.forEach((day, i) => {
    const date = new Date(weekStart); date.setDate(weekStart.getDate() + i);
    const isToday = date.toDateString() === today.toDateString();
    html += `<div class="planner-cell header">
      <div class="planner-day-name">${day}</div>
      <div class="planner-day-date ${isToday ? 'today' : ''}">${date.getDate()}</div>
    </div>`;
  });

  meals.forEach(meal => {
    html += `<div class="planner-cell" style="display:flex;align-items:center;justify-content:center;background:var(--bg-elevated)">
      <span class="planner-meal-label">${mealLabels[meal]}</span>
    </div>`;
    days.forEach((day, i) => {
      const date = new Date(weekStart); date.setDate(weekStart.getDate() + i);
      const key = `${dateKey(date)}-${meal}`;
      const item = plannerCache[key];
      if (item) {
        html += `<div class="planner-cell"><div class="planner-slot filled" onclick="openPicker('${key}')">
          <div class="planner-slot-recipe">
            <span class="planner-slot-emoji">${item.recipe_emoji || ''}</span>${item.recipe_title}
          </div>
          <div class="planner-slot-remove" onclick="event.stopPropagation();removeFromPlanner('${key}')"><i class="ti ti-x"></i></div>
        </div></div>`;
      } else {
        html += `<div class="planner-cell"><div class="planner-slot" onclick="openPicker('${key}')">
          <span class="planner-slot-add">+</span>
        </div></div>`;
      }
    });
  });

  grid.innerHTML = html;

  const statEl = document.getElementById('statPlanned');
  if (statEl) statEl.textContent = Object.keys(plannerCache).length;
}

function shiftWeek(dir) { plannerWeekOffset += dir; renderPlanner(); }

function openPicker(slotKey) {
  pendingSlot = slotKey;
  // A recipe was already chosen via "Add to Meal Plan" on a recipe modal —
  // skip the search picker and add it directly to whichever slot was tapped.
  if (pendingMealPlanRecipe) {
    addToPlanner(pendingMealPlanRecipe.id, pendingMealPlanRecipe.title, pendingMealPlanRecipe.emoji);
    pendingMealPlanRecipe = null;
    renderPendingBanner();
    return;
  }
  document.getElementById('plannerPicker')?.classList.add('open');
}
function closePicker() {
  document.getElementById('plannerPicker')?.classList.remove('open');
  pendingSlot = null;
}

function buildPickerList() {
  const list = document.getElementById('pickerList');
  if (!list) return;
  list.innerHTML = RECIPES.map(r => `
    <div class="planner-picker-item" onclick="addToPlanner('${r.id}','${r.title.replace(/'/g,"\\'")}','${r.emoji}')">
      <span class="planner-picker-emoji">${r.emoji}</span>
      <div>
        <div class="planner-picker-info-title">${r.title}</div>
        <div class="planner-picker-info-meta">${r.countryFlag||''} ${r.cuisine||r.country||''} · ${r.time}min · ${r.cal} kcal</div>
      </div>
    </div>`).join('');
}

function filterPicker(q) {
  document.querySelectorAll('.planner-picker-item').forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

async function addToPlanner(recipeId, title, emoji) {
  if (!pendingSlot) return;
  const sb = getSupabase();
  if (!sb || !currentUser) { openAuthModal('login'); return; }

  const [plan_date, meal_slot] = [pendingSlot.slice(0, 10), pendingSlot.slice(11)];
  const { error } = await sb.from('meal_plans').upsert({
    user_id: currentUser.id,
    plan_date,
    meal_slot,
    recipe_id: String(recipeId),
    recipe_title: title,
    recipe_emoji: emoji
  }, { onConflict: 'user_id,plan_date,meal_slot' });

  if (error) console.error('[GieesK] Could not save meal plan slot:', error);

  closePicker();
  renderPlanner();
}

async function removeFromPlanner(key) {
  const sb = getSupabase();
  if (!sb || !currentUser) return;
  const [plan_date, meal_slot] = [key.slice(0, 10), key.slice(11)];
  await sb.from('meal_plans').delete()
    .eq('user_id', currentUser.id).eq('plan_date', plan_date).eq('meal_slot', meal_slot);
  renderPlanner();
}

// Called directly by the recipe modal's "Add to Meal Plan" button.
// Previously this button only called openDashboard('planner') — it
// navigated to the planner but never actually added the recipe
// anywhere, matching exactly what was reported as broken.
function addCurrentRecipeToMealPlan() {
  const recipe = window._currentModalRecipe;
  if (!recipe) return;
  if (!currentUser) { openAuthModal('login'); return; }

  pendingMealPlanRecipe = { id: recipe.id, title: recipe.title, emoji: recipe.emoji || '🍽' };
  if (typeof closeRecipeModal === 'function') closeRecipeModal();
  openDashboard('planner');
}

// ══════════════════════════════════════════
// SHOPPING LIST PANEL — backed by Supabase (shopping_list_items table)
// Previously this was a hardcoded, in-memory-only demo array that
// reset on every page load and had no connection to any recipe.
// See supabase/shopping_list_items.sql for the table this expects.
// ══════════════════════════════════════════

async function buildShoppingPanel(panel) {
  panel.innerHTML = `
    <div class="shopping-progress">
      <i class="ti ti-shopping-cart" style="color:var(--gold);font-size:18px"></i>
      <div class="shopping-progress-bar">
        <div class="shopping-progress-fill" id="shoppingProgressFill" style="width:0%"></div>
      </div>
      <span class="shopping-progress-label" id="shoppingProgressLabel">0 of 0 items</span>
    </div>

    <div class="shopping-add-row">
      <input class="shopping-add-input" id="shoppingNewItem" placeholder="Add an ingredient…" 
             onkeydown="if(event.key==='Enter') addShoppingItem()" />
      <input class="shopping-add-input" id="shoppingNewAmount" placeholder="Amount (e.g. 2 cups)" style="max-width:160px"
             onkeydown="if(event.key==='Enter') addShoppingItem()" />
      <button class="btn-gold" onclick="addShoppingItem()"><i class="ti ti-plus"></i> Add</button>
    </div>

    <div class="shopping-toolbar">
      <button class="btn-ghost" onclick="clearChecked()" style="font-size:13px">
        <i class="ti ti-trash"></i> Clear checked
      </button>
      <button class="btn-ghost" onclick="checkAll()" style="font-size:13px">
        <i class="ti ti-check"></i> Check all
      </button>
      <button class="btn-ghost" onclick="uncheckAll()" style="font-size:13px">
        <i class="ti ti-refresh"></i> Uncheck all
      </button>
    </div>

    <div id="shoppingLists"><div class="dash-loading">Loading your list…</div></div>`;

  await renderShoppingList();
}

// Single source of truth for "what's in my list right now" — every
// mutation (toggle/add/delete/clear) re-fetches from Supabase rather
// than trusting local state, so the UI can never silently drift from
// what's actually saved.
async function fetchShoppingItems() {
  const sb = getSupabase();
  if (!sb || !currentUser) return [];
  const { data, error } = await sb
    .from('shopping_list_items')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('category', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) {
    console.error('[GieesK] shopping_list_items query failed — does the table match supabase/shopping_list_items.sql?', error);
    return null; // null = real error, distinct from [] = genuinely empty
  }
  return data || [];
}

async function renderShoppingList() {
  const container = document.getElementById('shoppingLists');
  if (!container) return;

  const items = await fetchShoppingItems();

  if (items === null) {
    container.innerHTML = `<div class="saved-empty" style="grid-column:1/-1">
      <i class="ti ti-alert-triangle"></i><h3>Couldn't load your shopping list</h3>
      <p>Please try again in a moment.</p></div>`;
    return;
  }

  if (items.length === 0) {
    container.innerHTML = `<div class="saved-empty" style="grid-column:1/-1">
      <i class="ti ti-shopping-cart"></i><h3>Your shopping list is empty</h3>
      <p>Add items above, or tap "Shopping List" on any recipe to add its ingredients.</p></div>`;
    updateShoppingProgress(items);
    return;
  }

  const cats = {};
  items.forEach(item => {
    const cat = item.category || 'Other';
    if (!cats[cat]) cats[cat] = [];
    cats[cat].push(item);
  });

  const catIcons = {
    'Vegetables': '🥦', 'Grains & Staples': '🌾', 'Meat & Fish': '🥩',
    'Herbs & Spices': '🌿', 'Dairy': '🥛', 'Fruits': '🍎', 'Other': '🛒'
  };

  container.innerHTML = Object.entries(cats).map(([cat, catItems]) => `
    <div class="shopping-category">
      <div class="shopping-category-title">
        ${catIcons[cat] || '🛒'} ${cat}
      </div>
      ${catItems.map(item => `
        <div class="shopping-item ${item.checked ? 'checked' : ''}" id="sitem-${item.id}">
          <div class="shopping-checkbox" onclick="toggleShoppingItem('${item.id}')">
            ${item.checked ? '<i class="ti ti-check"></i>' : ''}
          </div>
          <span class="shopping-item-name">${item.name}</span>
          ${item.recipe_title ? `<span style="font-size:11px;color:var(--text-hint);background:var(--bg-elevated);padding:2px 8px;border-radius:var(--r-full)">${item.recipe_title}</span>` : ''}
          <span class="shopping-item-amount">${item.amount || ''}</span>
          <div class="shopping-item-delete" onclick="deleteShoppingItem('${item.id}')">
            <i class="ti ti-trash"></i>
          </div>
        </div>`).join('')}
    </div>`).join('');

  updateShoppingProgress(items);
}

async function toggleShoppingItem(id) {
  const sb = getSupabase();
  if (!sb || !currentUser) return;
  // Read current state first — need to know whether we're checking or
  // unchecking, since this is a toggle, not a fixed set.
  const { data } = await sb.from('shopping_list_items').select('checked').eq('id', id).single();
  if (!data) return;
  await sb.from('shopping_list_items').update({ checked: !data.checked }).eq('id', id);
  renderShoppingList();
}

async function deleteShoppingItem(id) {
  const sb = getSupabase();
  if (!sb || !currentUser) return;
  await sb.from('shopping_list_items').delete().eq('id', id);
  renderShoppingList();
}

async function addShoppingItem() {
  const nameEl   = document.getElementById('shoppingNewItem');
  const amountEl = document.getElementById('shoppingNewAmount');
  const name = nameEl?.value.trim();
  if (!name) return;
  const sb = getSupabase();
  if (!sb || !currentUser) { openAuthModal('login'); return; }

  await sb.from('shopping_list_items').insert({
    user_id: currentUser.id,
    name,
    amount: amountEl?.value.trim() || '',
    category: 'Other',
    checked: false
  });
  if (nameEl)   nameEl.value   = '';
  if (amountEl) amountEl.value = '';
  renderShoppingList();
}

async function clearChecked() {
  const sb = getSupabase();
  if (!sb || !currentUser) return;
  await sb.from('shopping_list_items').delete().eq('user_id', currentUser.id).eq('checked', true);
  renderShoppingList();
}

async function checkAll() {
  const sb = getSupabase();
  if (!sb || !currentUser) return;
  await sb.from('shopping_list_items').update({ checked: true }).eq('user_id', currentUser.id);
  renderShoppingList();
}

async function uncheckAll() {
  const sb = getSupabase();
  if (!sb || !currentUser) return;
  await sb.from('shopping_list_items').update({ checked: false }).eq('user_id', currentUser.id);
  renderShoppingList();
}

function updateShoppingProgress(items) {
  items = items || [];
  const total   = items.length;
  const checked = items.filter(i => i.checked).length;
  const pct     = total ? Math.round(checked / total * 100) : 0;
  const fill  = document.getElementById('shoppingProgressFill');
  const label = document.getElementById('shoppingProgressLabel');
  if (fill)  fill.style.width    = pct + '%';
  if (label) label.textContent   = `${checked} of ${total} item${total !== 1 ? 's' : ''}`;
  const statEl = document.getElementById('statShopping');
  if (statEl) statEl.textContent = total - checked;
}

// ── Called from a recipe's modal: pulls that recipe's real
// ingredients into the user's shopping list. This is the piece that
// was missing entirely before — the "Shopping List" button on a
// recipe only navigated to the (fake, hardcoded) list; it never
// actually added anything to it.
async function addRecipeToShoppingList(recipe) {
  if (!currentUser) { openAuthModal('login'); return false; }
  const sb = getSupabase();
  if (!sb) return false;

  const ingredients = (recipe.ingredients || [])
    .filter(i => !/^\s*\/\//.test(String(i)))          // drop "// section" headers
    .map(i => String(i).replace(/\s*\((?:see\s+)?[A-Z]{2,4}\d{2,4}\)/gi, '').trim())
    .filter(Boolean);

  if (!ingredients.length) return false;

  const rows = ingredients.map(line => ({
    user_id: currentUser.id,
    name: line,
    amount: '',
    category: 'Other',
    recipe_id: String(recipe.id),
    recipe_title: recipe.title,
    checked: false
  }));

  const { error } = await sb.from('shopping_list_items').insert(rows);
  if (error) {
    console.error('[GieesK] Could not add ingredients to shopping list:', error);
    return false;
  }
  return true;
}

// Called directly by the recipe modal's "Add to Shopping List" button.
// Wraps addRecipeToShoppingList() with visible feedback on the button
// itself (mirrors how "Save Recipe" shows "Saved!"), then takes the
// user to the shopping tab so they immediately see it landed — using
// the real recipe object stashed on window by renderRecipeModal(),
// since passing a full ingredients array through an inline onclick
// attribute isn't practical.
async function addCurrentRecipeToShoppingList() {
  const recipe = window._currentModalRecipe;
  const btn = document.getElementById('modalShoppingBtn');
  if (!recipe) return;

  if (!currentUser) { openAuthModal('login'); return; }

  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ti ti-loader-2"></i> Adding…'; }

  const ok = await addRecipeToShoppingList(recipe);

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = ok
      ? '<i class="ti ti-check"></i> Added!'
      : '<i class="ti ti-shopping-cart"></i> Add to Shopping List';
  }

  if (ok) {
    closeRecipeModal();
    openDashboard('shopping');
  }
}

