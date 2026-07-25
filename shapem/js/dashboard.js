/* ═══════════════════════════════════════════
   SHAPEM — Dashboard Pages
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
          <div class="dash-hero-avatar" id="dashHeroAvatar">
            ${avatar ? `<img src="${avatar}" alt="${name}">` : initial}
          </div>
          <div class="dash-hero-info">
            <div class="dash-hero-name" id="dashHeroName">${name}</div>
            <div class="dash-hero-email">${email}</div>
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
          <button class="btn-ghost" onclick="closeDashboard()" style="margin-bottom:1.25rem">
            <i class="ti ti-arrow-left"></i> Back
          </button>
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
  if (panel && !panel.dataset.built) {
    panel.dataset.built = 'true';
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
                <textarea class="form-textarea" id="pfBio" placeholder="Tell the Shapem community a little about yourself…"></textarea>
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
      <button class="btn-ghost" onclick="switchDashTab('recipes')" style="white-space:nowrap">
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

async function loadSavedRecipes(panel) {
  const sb = getSupabase();
  if (!sb || !currentUser) return;
  const { data } = await sb.from('saved_recipes').select('recipe_id').eq('user_id', currentUser.id);
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

  const savedIds = data.map(d => d.recipe_id);
  const savedRecipes = RECIPES.filter(r => savedIds.includes(String(r.id)));

  if (savedRecipes.length === 0) {
    grid.innerHTML = `<div class="saved-empty" style="grid-column:1/-1"><i class="ti ti-bookmark"></i><h3>No matching recipes found</h3><p>Your saved recipe IDs don't match current recipes.</p></div>`;
    return;
  }

  grid.innerHTML = '';
  savedRecipes.forEach((r, i) => {
    const card = createRecipeCard(r, i * 60);
    card.dataset.title   = r.title.toLowerCase();
    card.dataset.cuisine = (r.cuisine || '').toLowerCase();
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
let plannerData = {}; // { 'mon-breakfast': { recipeId, title, emoji }, ... }
let pendingSlot = null;

function buildPlannerPanel(panel) {
  panel.innerHTML = `
    <div class="planner-week-nav">
      <button class="planner-nav-btn" onclick="shiftWeek(-1)"><i class="ti ti-chevron-left"></i></button>
      <div class="planner-week-label" id="plannerWeekLabel"></div>
      <button class="planner-nav-btn" onclick="shiftWeek(1)"><i class="ti ti-chevron-right"></i></button>
      <button class="btn-ghost" onclick="plannerWeekOffset=0;renderPlanner()" style="margin-left:auto">Today</button>
    </div>
    <div class="planner-grid" id="plannerGrid"></div>
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

  renderPlanner();
  buildPickerList();
}

function renderPlanner() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const meals = ['Breakfast','Lunch','Dinner','Snack'];
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1 + plannerWeekOffset * 7);

  const label = document.getElementById('plannerWeekLabel');
  if (label) {
    const end = new Date(weekStart); end.setDate(weekStart.getDate() + 6);
    label.textContent = `${weekStart.toLocaleDateString('en',{month:'short',day:'numeric'})} – ${end.toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}`;
  }

  const grid = document.getElementById('plannerGrid');
  if (!grid) return;

  // Header row
  let html = `<div class="planner-cell header"></div>`;
  days.forEach((day, i) => {
    const date = new Date(weekStart); date.setDate(weekStart.getDate() + i);
    const isToday = date.toDateString() === today.toDateString();
    html += `<div class="planner-cell header">
      <div class="planner-day-name">${day}</div>
      <div class="planner-day-date ${isToday ? 'today' : ''}">${date.getDate()}</div>
    </div>`;
  });

  // Meal rows
  meals.forEach(meal => {
    html += `<div class="planner-cell" style="display:flex;align-items:center;justify-content:center;background:var(--bg-elevated)">
      <span class="planner-meal-label">${meal}</span>
    </div>`;
    days.forEach((day, i) => {
      const key = `${day.toLowerCase()}-${meal.toLowerCase()}-${plannerWeekOffset}`;
      const item = plannerData[key];
      if (item) {
        html += `<div class="planner-cell"><div class="planner-slot filled" onclick="openPicker('${key}')">
          <div class="planner-slot-recipe">
            <span class="planner-slot-emoji">${item.emoji}</span>${item.title}
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

  // Update stat
  const planned = Object.keys(plannerData).filter(k => k.includes(`-${plannerWeekOffset}`)).length;
  const statEl = document.getElementById('statPlanned');
  if (statEl) statEl.textContent = planned;
}

function shiftWeek(dir) { plannerWeekOffset += dir; renderPlanner(); }

function openPicker(slotKey) {
  pendingSlot = slotKey;
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

function addToPlanner(recipeId, title, emoji) {
  if (!pendingSlot) return;
  plannerData[pendingSlot] = { recipeId, title, emoji };
  closePicker();
  renderPlanner();
}

function removeFromPlanner(key) {
  delete plannerData[key];
  renderPlanner();
}

// ══════════════════════════════════════════
// SHOPPING LIST PANEL
// ══════════════════════════════════════════
let shoppingItems = [
  { id: 1, name: 'White maize flour', amount: '2 cups', category: 'Grains & Staples', checked: false, recipe: 'White Ugali' },
  { id: 2, name: 'Collard greens (sukuma wiki)', amount: '500g', category: 'Vegetables', checked: false, recipe: 'Sukuma Wiki' },
  { id: 3, name: 'Tomatoes', amount: '2 medium', category: 'Vegetables', checked: false, recipe: 'Sukuma Wiki' },
  { id: 4, name: 'Onion', amount: '1 medium', category: 'Vegetables', checked: false, recipe: 'Sukuma Wiki' },
  { id: 5, name: 'Garlic', amount: '2 cloves', category: 'Herbs & Spices', checked: false, recipe: 'Sukuma Wiki' },
];
let nextShoppingId = 6;

function buildShoppingPanel(panel) {
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

    <div id="shoppingLists"></div>`;

  renderShoppingList();
}

function renderShoppingList() {
  const container = document.getElementById('shoppingLists');
  if (!container) return;

  // Group by category
  const cats = {};
  shoppingItems.forEach(item => {
    const cat = item.category || 'Other';
    if (!cats[cat]) cats[cat] = [];
    cats[cat].push(item);
  });

  const catIcons = {
    'Vegetables': '🥦', 'Grains & Staples': '🌾', 'Meat & Fish': '🥩',
    'Herbs & Spices': '🌿', 'Dairy': '🥛', 'Fruits': '🍎', 'Other': '🛒'
  };

  container.innerHTML = Object.entries(cats).map(([cat, items]) => `
    <div class="shopping-category">
      <div class="shopping-category-title">
        ${catIcons[cat] || '🛒'} ${cat}
      </div>
      ${items.map(item => `
        <div class="shopping-item ${item.checked ? 'checked' : ''}" id="sitem-${item.id}">
          <div class="shopping-checkbox" onclick="toggleShoppingItem(${item.id})">
            ${item.checked ? '<i class="ti ti-check"></i>' : ''}
          </div>
          <span class="shopping-item-name">${item.name}</span>
          ${item.recipe ? `<span style="font-size:11px;color:var(--text-hint);background:var(--bg-elevated);padding:2px 8px;border-radius:var(--r-full)">${item.recipe}</span>` : ''}
          <span class="shopping-item-amount">${item.amount || ''}</span>
          <div class="shopping-item-delete" onclick="deleteShoppingItem(${item.id})">
            <i class="ti ti-trash"></i>
          </div>
        </div>`).join('')}
    </div>`).join('');

  updateShoppingProgress();
}

function toggleShoppingItem(id) {
  const item = shoppingItems.find(i => i.id === id);
  if (item) { item.checked = !item.checked; renderShoppingList(); }
}

function deleteShoppingItem(id) {
  shoppingItems = shoppingItems.filter(i => i.id !== id);
  renderShoppingList();
  const statEl = document.getElementById('statShopping');
  if (statEl) statEl.textContent = shoppingItems.filter(i => !i.checked).length;
}

function addShoppingItem() {
  const nameEl   = document.getElementById('shoppingNewItem');
  const amountEl = document.getElementById('shoppingNewAmount');
  const name = nameEl?.value.trim();
  if (!name) return;
  shoppingItems.push({ id: nextShoppingId++, name, amount: amountEl?.value.trim() || '', category: 'Other', checked: false });
  if (nameEl)   nameEl.value   = '';
  if (amountEl) amountEl.value = '';
  renderShoppingList();
  const statEl = document.getElementById('statShopping');
  if (statEl) statEl.textContent = shoppingItems.filter(i => !i.checked).length;
}

function clearChecked()  { shoppingItems = shoppingItems.filter(i => !i.checked); renderShoppingList(); }
function checkAll()      { shoppingItems.forEach(i => i.checked = true);  renderShoppingList(); }
function uncheckAll()    { shoppingItems.forEach(i => i.checked = false); renderShoppingList(); }

function updateShoppingProgress() {
  const total   = shoppingItems.length;
  const checked = shoppingItems.filter(i => i.checked).length;
  const pct     = total ? Math.round(checked / total * 100) : 0;
  const fill  = document.getElementById('shoppingProgressFill');
  const label = document.getElementById('shoppingProgressLabel');
  if (fill)  fill.style.width    = pct + '%';
  if (label) label.textContent   = `${checked} of ${total} item${total !== 1 ? 's' : ''}`;
  const statEl = document.getElementById('statShopping');
  if (statEl) statEl.textContent = total - checked;
}
