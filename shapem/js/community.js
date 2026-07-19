/* ═══════════════════════════════════════════
   SHAPEM — Community System
═══════════════════════════════════════════ */

// ── Community data ────────────────────────
const COMMUNITY_POSTS = [
  {
    id: 1,
    authorName: 'Mama Wanjiru',
    authorEmoji: '👩🏿‍🍳',
    authorRole: 'chef',
    country: '🇰🇪 Kenya',
    time: '2 hours ago',
    text: 'Just perfected my White Ugali recipe after 30 years of cooking. The secret is in the flour — always freshly milled, always gradual. Sharing it with the Shapem community today! 🫓',
    recipe: { id: 'KEN001', title: 'White Ugali', emoji: '🫓', cuisine: 'Kenyan', time: 17, cal: 210 },
    tags: ['kenyan', 'staple', 'vegan', 'gluten-free'],
    likes: 284, comments: 42, shares: 31, liked: false,
  },
  {
    id: 2,
    authorName: 'Brian Karani',
    authorEmoji: '👨🏿‍🍳',
    authorRole: 'community',
    country: '🇰🇪 Kenya',
    time: '5 hours ago',
    text: 'Made Sukuma Wiki for the first time using Mama Wanjiru\'s recipe and it came out perfectly vibrant green! The key tip about not overcooking really works. My family loved it 🥬❤️',
    recipe: { id: 'KEN002', title: 'Sukuma Wiki', emoji: '🥬', cuisine: 'Kenyan', time: 22, cal: 95 },
    tags: ['sukumawiki', 'kenyanfood', 'madeithappen'],
    likes: 97, comments: 18, shares: 7, liked: false,
  },
  {
    id: 3,
    authorName: 'Fatima El-Amin',
    authorEmoji: '👩🏽‍🍳',
    authorRole: 'chef',
    country: '🇲🇦 Morocco',
    time: '1 day ago',
    text: 'My Saffron Lamb Tagine has been making kitchens smell incredible across 12 countries this week. To everyone who made it — don\'t rush the braise. 90 minutes is not negotiable 😄🍲',
    recipe: { id: 1, title: 'Saffron Lamb Tagine', emoji: '🍲', cuisine: 'Moroccan', time: 90, cal: 520 },
    tags: ['moroccan', 'tagine', 'slowcooked', 'halal'],
    likes: 412, comments: 67, shares: 89, liked: false,
  },
  {
    id: 4,
    authorName: 'Priya Sharma',
    authorEmoji: '👩🏾‍🍳',
    authorRole: 'chef',
    country: '🇮🇳 India',
    time: '2 days ago',
    text: 'Butter Chicken is loved worldwide but so few people know the charred edges are the entire point. Don\'t skip the grill step — that smokiness is the soul of the dish 🍛🔥',
    recipe: { id: 5, title: 'Butter Chicken', emoji: '🍛', cuisine: 'Indian', time: 50, cal: 560 },
    tags: ['indian', 'butterchicken', 'chefstips'],
    likes: 631, comments: 94, shares: 145, liked: false,
  },
];

const CHALLENGES = [
  {
    id: 1,
    icon: '🇰🇪',
    title: 'East African Cook-Off',
    deadline: 'Ends in 5 days',
    desc: 'Cook any traditional East African recipe, share your photo and story. Best presentation and cultural authenticity wins.',
    entries: 143,
    prize: '🏆 Featured Chef badge + Homepage feature',
    tag: 'eastafrica',
  },
  {
    id: 2,
    icon: '🌱',
    title: 'Vegan World Tour',
    deadline: 'Ends in 12 days',
    desc: 'Share a vegan recipe from any country in the world. Judges will score on creativity, nutrition, and cultural authenticity.',
    entries: 289,
    prize: '🥇 Gold Chef badge + Recipe book feature',
    tag: 'veganworldtour',
  },
  {
    id: 3,
    icon: '⚡',
    title: '20-Minute Challenge',
    deadline: 'Ends in 3 days',
    desc: 'Share a delicious meal you can make in under 20 minutes. Speed, flavour, and simplicity are the judging criteria.',
    entries: 512,
    prize: '⚡ Speed Cook badge + Weekly spotlight',
    tag: '20minchallenge',
  },
];

// ── Open community page ───────────────────
function openCommunity() {
  // Hide all other pages
  ['page-home', 'page-recipes', 'page-dashboard', 'page-chef-profile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Build community page if first visit
  let page = document.getElementById('page-community');
  if (!page) {
    page = buildCommunityPage();
    document.body.insertBefore(page, document.querySelector('footer'));
  }
  page.style.display = 'block';

  // Build feed on first open
  setTimeout(() => {
    if (!document.getElementById('communityFeed')?.dataset.built) buildFeed();
  }, 50);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAllPages() {
  ['page-home', 'page-recipes', 'page-dashboard', 'page-community', 'page-chef-profile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

// ── Build the community page ──────────────
function buildCommunityPage() {
  const el = document.createElement('div');
  el.id = 'page-community';
  el.style.cssText = 'background:var(--bg-void);min-height:100vh;';

  el.innerHTML = `
    <!-- Hero -->
    <div class="community-page-hero">
      <div class="container">
        <p class="section-eyebrow" style="justify-content:center;display:flex">🌍 Global Cooking Community</p>
        <h1 class="community-hero-title">Cook. Share.<br/><em>Inspire the World.</em></h1>
        <p class="community-hero-sub">Join 1.2 million cooks from 195 countries. Share your recipes, enter challenges, follow master chefs, and earn your place on the leaderboard.</p>
        <div class="community-hero-actions">
          <button class="btn-gold btn-lg" onclick="openUploadModal()">
            <i class="ti ti-plus"></i> Share a Recipe
          </button>
          <button class="btn-outline btn-lg" onclick="switchCommunityTab('challenges')">
            <i class="ti ti-trophy"></i> View Challenges
          </button>
          <button class="btn-ghost btn-lg" onclick="hideAllPages();document.getElementById('page-home').style.display='';">
            <i class="ti ti-arrow-left"></i> Back
          </button>
        </div>
        <div class="community-hero-stats">
          <div><div class="community-hero-stat-num">1.2M</div><div class="community-hero-stat-label">Members</div></div>
          <div><div class="community-hero-stat-num">50K+</div><div class="community-hero-stat-label">Recipes</div></div>
          <div><div class="community-hero-stat-num">195</div><div class="community-hero-stat-label">Countries</div></div>
          <div><div class="community-hero-stat-num">2,400</div><div class="community-hero-stat-label">Chefs</div></div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="community-tabs-bar">
      <div class="container">
        <div class="community-tabs">
          <button class="community-tab active" data-tab="feed"       onclick="switchCommunityTab('feed')">      <i class="ti ti-home"></i>   Feed</button>
          <button class="community-tab"        data-tab="challenges" onclick="switchCommunityTab('challenges')"><i class="ti ti-trophy"></i> Challenges</button>
          <button class="community-tab"        data-tab="chefs"      onclick="switchCommunityTab('chefs')">     <i class="ti ti-chef-hat"></i> Chefs</button>
          <button class="community-tab"        data-tab="leaderboard"onclick="switchCommunityTab('leaderboard')"><i class="ti ti-medal"></i> Leaderboard</button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container">
      <div class="community-layout">
        <!-- Main feed -->
        <div>
          <div id="community-tab-feed">
            <div class="upload-prompt" onclick="openUploadModal()" style="margin-top:1.5rem">
              <div class="upload-prompt-avatar" id="uploadPromptAvatar">👤</div>
              <div class="upload-prompt-text">Share a recipe with the Shapem community…</div>
              <button class="btn-gold" style="flex-shrink:0">Post</button>
            </div>
            <div id="communityFeed"></div>
          </div>
          <div id="community-tab-challenges" style="display:none;padding-top:1.5rem"></div>
          <div id="community-tab-chefs"      style="display:none;padding-top:1.5rem"></div>
          <div id="community-tab-leaderboard"style="display:none;padding-top:1.5rem"></div>
        </div>

        <!-- Sidebar -->
        <div style="padding-top:1.5rem">
          <!-- Active challenges -->
          <div class="sidebar-widget">
            <div class="sidebar-widget-header"><i class="ti ti-trophy"></i> Active Challenges</div>
            <div class="sidebar-widget-body">
              ${CHALLENGES.map(c => `
                <div style="padding:8px 0;border-bottom:1px solid var(--border-dim);cursor:pointer" onclick="switchCommunityTab('challenges')">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                    <span style="font-size:1.2rem">${c.icon}</span>
                    <span style="font-size:13px;font-weight:600;color:var(--text-primary)">${c.title}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between">
                    <span style="font-size:11px;color:var(--text-muted)">${c.entries} entries</span>
                    <span style="font-size:11px;color:var(--coral)">${c.deadline}</span>
                  </div>
                </div>`).join('')}
              <button class="btn-ghost" style="width:100%;justify-content:center;margin-top:10px;font-size:13px" onclick="switchCommunityTab('challenges')">
                View all challenges <i class="ti ti-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- Top chefs -->
          <div class="sidebar-widget">
            <div class="sidebar-widget-header"><i class="ti ti-star"></i> Top Chefs This Week</div>
            <div class="sidebar-widget-body">
              ${CHEFS.slice(0,5).map((c, i) => `
                <div class="top-chef-row" onclick="openChefProfile(${i})">
                  <div class="top-chef-avatar">${c.emoji}</div>
                  <div class="top-chef-name">${c.name}</div>
                  <div class="top-chef-score">${formatNum(c.followers)}</div>
                </div>`).join('')}
              <button class="btn-ghost" style="width:100%;justify-content:center;margin-top:8px;font-size:13px" onclick="switchCommunityTab('chefs')">
                All chefs <i class="ti ti-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- Tags -->
          <div class="sidebar-widget">
            <div class="sidebar-widget-header"><i class="ti ti-hash"></i> Trending Tags</div>
            <div class="sidebar-widget-body">
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                ${['#kenyanfood','#eastafrica','#vegan','#madeithappen','#30minmeals','#chefstips','#ugali','#worldcuisine','#halal','#quickmeals'].map(t =>
                  `<button onclick="filterFeedByTag('${t.slice(1)}')" style="padding:4px 10px;background:var(--bg-elevated);border:1px solid var(--border-dim);border-radius:var(--r-full);font-size:12px;color:var(--text-muted);cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--emerald)';this.style.color='var(--emerald)'" onmouseout="this.style.borderColor='var(--border-dim)';this.style.color='var(--text-muted)'">${t}</button>`
                ).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div class="upload-modal-overlay" id="uploadModalOverlay" onclick="if(event.target===this)closeUploadModal()">
      <div class="upload-modal">
        <div class="upload-modal-header">
          <span class="upload-modal-title">Share a Recipe</span>
          <button class="modal-close" style="position:static" onclick="closeUploadModal()"><i class="ti ti-x"></i></button>
        </div>
        <div class="upload-modal-body">
          <div>
            <div class="upload-step"><div class="upload-step-num">1</div> Recipe Details</div>
            <div style="display:flex;flex-direction:column;gap:12px">
              <input class="form-input" id="uploadTitle"   placeholder="Recipe name *" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:var(--r-md);padding:10px 14px;font-size:14px;color:var(--text-primary);outline:none;font-family:inherit;width:100%"/>
              <textarea class="form-textarea" id="uploadDesc" placeholder="Tell your story — what makes this recipe special to you? *" rows="3" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:var(--r-md);padding:10px 14px;font-size:14px;color:var(--text-primary);outline:none;font-family:inherit;width:100%;resize:vertical"></textarea>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
                <input class="form-input" id="uploadCuisine" placeholder="Cuisine *" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:var(--r-md);padding:10px 14px;font-size:14px;color:var(--text-primary);outline:none;font-family:inherit"/>
                <input class="form-input" id="uploadTime"    placeholder="Cook time (min)" type="number" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:var(--r-md);padding:10px 14px;font-size:14px;color:var(--text-primary);outline:none;font-family:inherit"/>
                <input class="form-input" id="uploadCal"     placeholder="Calories" type="number" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:var(--r-md);padding:10px 14px;font-size:14px;color:var(--text-primary);outline:none;font-family:inherit"/>
              </div>
            </div>
          </div>
          <div>
            <div class="upload-step"><div class="upload-step-num">2</div> Ingredients & Steps</div>
            <textarea class="form-textarea" id="uploadIngredients" placeholder="List your ingredients, one per line…" rows="4" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:var(--r-md);padding:10px 14px;font-size:14px;color:var(--text-primary);outline:none;font-family:inherit;width:100%;resize:vertical;margin-bottom:10px"></textarea>
            <textarea class="form-textarea" id="uploadSteps" placeholder="Describe the cooking steps…" rows="4" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:var(--r-md);padding:10px 14px;font-size:14px;color:var(--text-primary);outline:none;font-family:inherit;width:100%;resize:vertical"></textarea>
          </div>
          <div>
            <div class="upload-step"><div class="upload-step-num">3</div> Tags</div>
            <input class="form-input" id="uploadTags" placeholder="Add tags separated by commas (e.g. vegan, kenyan, quick)" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:var(--r-md);padding:10px 14px;font-size:14px;color:var(--text-primary);outline:none;font-family:inherit;width:100%"/>
          </div>
          <div id="uploadError" style="font-size:13px;color:#F08060;display:none"></div>
          <div style="display:flex;gap:10px">
            <button class="btn-gold" style="flex:1;justify-content:center;padding:13px" onclick="submitCommunityPost()">
              <i class="ti ti-send"></i> Share Recipe
            </button>
            <button class="btn-ghost" onclick="closeUploadModal()">Cancel</button>
          </div>
        </div>
      </div>
    </div>`;

  return el;
}

// ── Tab switching ─────────────────────────
function switchCommunityTab(tab) {
  document.querySelectorAll('.community-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  ['feed','challenges','chefs','leaderboard'].forEach(t => {
    const el = document.getElementById(`community-tab-${t}`);
    if (el) el.style.display = t === tab ? '' : 'none';
  });
  if (tab === 'feed'        && !document.getElementById('communityFeed').dataset.built) buildFeed();
  if (tab === 'challenges'  && !document.getElementById('community-tab-challenges').dataset.built) buildChallengesTab();
  if (tab === 'chefs'       && !document.getElementById('community-tab-chefs').dataset.built) buildChefsTab();
  if (tab === 'leaderboard' && !document.getElementById('community-tab-leaderboard').dataset.built) buildLeaderboardTab();
}

// ── Build Feed ────────────────────────────
function buildFeed() {
  const feed = document.getElementById('communityFeed');
  if (!feed) return;
  feed.dataset.built = 'true';

  // Update upload prompt avatar
  if (currentUser) {
    const av = document.getElementById('uploadPromptAvatar');
    const avatar = currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture;
    const name   = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'C';
    if (av) av.innerHTML = avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : name.charAt(0).toUpperCase();
  }

  feed.innerHTML = COMMUNITY_POSTS.map((post, idx) => buildPostHTML(post, idx)).join('');
}

function buildPostHTML(post, idx) {
  const tagsHTML = post.tags.map(t => `<span class="badge badge-emerald">#${t}</span>`).join('');
  const recipeHTML = post.recipe ? `
    <div class="post-recipe-card" onclick="openRecipeModal(RECIPES.find(r=>r.id===${JSON.stringify(post.recipe.id)}))">
      <span class="post-recipe-emoji">${post.recipe.emoji}</span>
      <div>
        <div class="post-recipe-title">${post.recipe.title}</div>
        <div class="post-recipe-meta">${post.recipe.cuisine} · ${post.recipe.time}min · ${post.recipe.cal} kcal</div>
      </div>
      <i class="ti ti-arrow-right" style="margin-left:auto;color:var(--text-muted)"></i>
    </div>` : '';

  return `
    <div class="community-post" id="post-${post.id}" style="animation-delay:${idx*80}ms">
      <div class="post-header">
        <div class="post-avatar">${post.authorEmoji}</div>
        <div>
          <div class="post-author-name">
            ${post.authorName}
            ${post.authorRole === 'chef' ? '<span class="post-chef-badge">CHEF</span>' : ''}
          </div>
          <div class="post-author-meta">
            <span>${post.country}</span>
            <span>·</span>
            <span>${post.time}</span>
          </div>
        </div>
        <span class="post-time"></span>
      </div>
      <div class="post-body">
        <p class="post-text">${post.text}</p>
        ${recipeHTML}
        <div class="post-tags">${tagsHTML}</div>
      </div>
      <div class="post-actions">
        <button class="post-action-btn ${post.liked ? 'liked' : ''}" id="like-${post.id}" onclick="toggleLike(${post.id})">
          <i class="ti ti-heart${post.liked ? '-filled' : ''}"></i> <span id="like-count-${post.id}">${post.likes}</span>
        </button>
        <button class="post-action-btn" onclick="focusComment(${post.id})">
          <i class="ti ti-message-circle"></i> ${post.comments}
        </button>
        <button class="post-action-btn" onclick="sharePost(${post.id})">
          <i class="ti ti-share"></i> ${post.shares}
        </button>
        <button class="post-action-btn" onclick="savePostRecipe(${post.id})" style="margin-left:auto">
          <i class="ti ti-bookmark"></i> Save
        </button>
      </div>
    </div>`;
}

function toggleLike(postId) {
  if (!currentUser) { openAuthModal('login'); return; }
  const post = COMMUNITY_POSTS.find(p => p.id === postId);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  const btn   = document.getElementById(`like-${postId}`);
  const count = document.getElementById(`like-count-${postId}`);
  if (btn)   btn.className   = `post-action-btn ${post.liked ? 'liked' : ''}`;
  if (btn)   btn.querySelector('i').className = `ti ti-heart${post.liked ? '-filled' : ''}`;
  if (count) count.textContent = post.likes;
}

function focusComment(postId) {
  if (!currentUser) { openAuthModal('login'); return; }
  alert('Comments coming in the next update!');
}
function sharePost(postId) { navigator.clipboard?.writeText(window.location.href).then(() => alert('Link copied!')); }
function savePostRecipe(postId) {
  const post = COMMUNITY_POSTS.find(p => p.id === postId);
  if (post?.recipe) saveRecipe(post.recipe.id);
}

function filterFeedByTag(tag) {
  switchCommunityTab('feed');
  if (!document.getElementById('communityFeed').dataset.built) buildFeed();
  const posts = document.querySelectorAll('.community-post');
  posts.forEach(p => {
    const pid = parseInt(p.id.replace('post-',''));
    const post = COMMUNITY_POSTS.find(x => x.id === pid);
    p.style.display = (!tag || post?.tags.includes(tag)) ? '' : 'none';
  });
}

// ── Build Challenges tab ──────────────────
function buildChallengesTab() {
  const panel = document.getElementById('community-tab-challenges');
  if (!panel) return;
  panel.dataset.built = 'true';
  panel.innerHTML = `
    <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;color:var(--text-primary);margin-bottom:1.25rem">
      Active Challenges <span style="font-size:13px;color:var(--text-muted);font-family:var(--font-body);font-weight:400">${CHALLENGES.length} running now</span>
    </h2>` +
    CHALLENGES.map((c, idx) => `
    <div class="challenge-card" style="animation-delay:${idx*80}ms">
      <div class="challenge-header">
        <span class="challenge-icon">${c.icon}</span>
        <div>
          <div class="challenge-title">${c.title}</div>
          <div class="challenge-meta">${c.deadline} · #${c.tag}</div>
        </div>
        <span class="badge badge-coral" style="margin-left:auto">LIVE</span>
      </div>
      <div class="challenge-body">
        <p class="challenge-desc">${c.desc}</p>
        <button class="btn-gold" onclick="enterChallenge(${c.id})">
          <i class="ti ti-plus"></i> Enter Challenge
        </button>
      </div>
      <div class="challenge-footer">
        <div class="challenge-entries"><i class="ti ti-users"></i> ${c.entries} entries</div>
        <div class="challenge-prize">${c.prize}</div>
      </div>
    </div>`).join('');
}

function enterChallenge(id) {
  if (!currentUser) { openAuthModal('login'); return; }
  openUploadModal();
  const challenge = CHALLENGES.find(c => c.id === id);
  if (challenge) {
    const tagsInput = document.getElementById('uploadTags');
    if (tagsInput) tagsInput.value = challenge.tag;
  }
}

// ── Build Chefs tab ───────────────────────
// Shows all chefs + any community members who joined as chef
function buildChefsTab() {
  const panel = document.getElementById('community-tab-chefs');
  if (!panel) return;
  panel.dataset.built = 'true';

  panel.innerHTML = `
    <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;color:var(--text-primary);margin-bottom:1.25rem">
      Featured Chefs & Community Creators
    </h2>
    <div class="chefs-grid" id="communityChefGrid"></div>`;

  const grid = document.getElementById('communityChefGrid');
  if (!grid) return;

  // Build chef cards with "Join Community" CTA for non-joined chefs
  CHEFS.forEach((chef, i) => {
    const card = document.createElement('div');
    card.className = 'chef-card';
    card.style.animationDelay = (i * 70) + 'ms';
    card.innerHTML = `
      <div class="chef-photo">${chef.emoji}</div>
      <div class="chef-name">${chef.name}</div>
      <div class="chef-origin"><i class="ti ti-map-pin" style="font-size:11px"></i> ${chef.origin}</div>
      <div class="chef-stats">
        <div><div class="chef-stat-num">${chef.recipes}</div><div class="chef-stat-label">Recipes</div></div>
        <div><div class="chef-stat-num">${formatNum(chef.followers)}</div><div class="chef-stat-label">Followers</div></div>
        <div><div class="chef-stat-num">${chef.rating}</div><div class="chef-stat-label">Rating</div></div>
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px">${chef.specialty}</div>
      <div class="join-community-cta">
        <i class="ti ti-users"></i>
        <div class="join-community-cta-text">
          <div class="join-community-cta-title">Active in Community</div>
          <div class="join-community-cta-sub">Posting recipes & joining challenges</div>
        </div>
        <button class="btn-ghost" style="font-size:12px;padding:5px 12px" onclick="followChef('${chef.name}',this)">
          Follow
        </button>
      </div>`;
    card.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      openChefProfile(i);
    });
    grid.appendChild(card);
  });
}

function followChef(name, btn) {
  if (!currentUser) { openAuthModal('login'); return; }
  const isFollowing = btn.textContent === 'Following';
  btn.textContent = isFollowing ? 'Follow' : 'Following';
  btn.style.color = isFollowing ? '' : 'var(--emerald)';
  btn.style.borderColor = isFollowing ? '' : 'var(--emerald)';
}

// ── Build Leaderboard tab ─────────────────
function buildLeaderboardTab() {
  const panel = document.getElementById('community-tab-leaderboard');
  if (!panel) return;
  panel.dataset.built = 'true';

  const extended = [
    ...LEADERBOARD,
    { rank:6,  name:'Layla Nasser',   emoji:'👩🏽‍🍳', score:54200 },
    { rank:7,  name:'Nong Krai',      emoji:'👨🏻‍🍳', score:47800 },
    { rank:8,  name:'Brian Karani',   emoji:'👨🏿‍🍳', score:32100 },
    { rank:9,  name:'James W.',       emoji:'👨🏼‍🍳', score:28900 },
    { rank:10, name:'Marco B.',       emoji:'👨🏻‍🍳', score:24500 },
  ];

  panel.innerHTML = `
    <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;color:var(--text-primary);margin-bottom:1.25rem">
      Global Leaderboard <span style="font-size:13px;color:var(--text-muted);font-family:var(--font-body);font-weight:400">This week</span>
    </h2>
    <div class="dash-card">
      <div class="dash-card-header">
        <span class="dash-card-title"><i class="ti ti-trophy"></i> Top 10 Cooks</span>
        <span style="font-size:12px;color:var(--text-muted)">Resets every Monday</span>
      </div>
      <div>
        ${extended.map(entry => {
          const rankIcon = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;
          const rankClass = entry.rank <= 3 ? ['gold','silver','bronze'][entry.rank-1] : '';
          return `<div class="lb-row" style="${entry.rank <= 3 ? 'background:rgba(201,150,58,0.04)' : ''}">
            <div class="lb-rank ${rankClass}" style="font-size:${entry.rank<=3?'1.2rem':'12px'}">${rankIcon}</div>
            <div class="lb-avatar">${entry.emoji}</div>
            <div class="lb-name">${entry.name}</div>
            <div style="display:flex;gap:8px;align-items:center">
              <div class="lb-score">${formatNum(entry.score)}</div>
              <span style="font-size:11px;color:var(--text-hint)">pts</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div style="margin-top:1.5rem;padding:1.5rem;background:var(--bg-card);border:1px solid var(--border-dim);border-radius:var(--r-lg);text-align:center">
      <p style="font-size:14px;color:var(--text-secondary);margin-bottom:1rem">Earn points by sharing recipes, winning challenges, and getting likes from the community.</p>
      <button class="btn-gold" onclick="openUploadModal()"><i class="ti ti-plus"></i> Share a Recipe & Earn Points</button>
    </div>`;
}

// ── Chef profile page ─────────────────────
function openChefProfile(index) {
  const chef = CHEFS[index];
  if (!chef) return;
  hideAllPages();

  let page = document.getElementById('page-chef-profile');
  if (!page) { page = document.createElement('div'); page.id = 'page-chef-profile'; document.body.insertBefore(page, document.querySelector('footer')); }
  page.style.display = 'block';

  const chefRecipes = RECIPES.filter(r => r.author === chef.name);

  page.innerHTML = `
    <div class="chef-profile-page">
      <div class="chef-profile-hero">
        <div class="container">
          <button class="btn-ghost" style="margin-bottom:1.5rem" onclick="page.style.display='none';openCommunity()">
            <i class="ti ti-arrow-left"></i> Back to Community
          </button>
          <div class="chef-profile-inner">
            <div class="chef-profile-photo">${chef.emoji}</div>
            <div>
              <div class="chef-profile-name">${chef.name} <span class="post-chef-badge" style="font-size:12px;vertical-align:middle">CHEF</span></div>
              <div class="chef-profile-origin"><i class="ti ti-map-pin"></i> ${chef.origin} · ${chef.specialty}</div>
              <div class="chef-profile-stats">
                <div class="dash-hero-stat"><div class="dash-hero-stat-num">${chef.recipes}</div><div class="dash-hero-stat-label">Recipes</div></div>
                <div class="dash-hero-stat"><div class="dash-hero-stat-num">${formatNum(chef.followers)}</div><div class="dash-hero-stat-label">Followers</div></div>
                <div class="dash-hero-stat"><div class="dash-hero-stat-num">${chef.rating} ⭐</div><div class="dash-hero-stat-label">Rating</div></div>
              </div>
              <div class="chef-profile-actions">
                <button class="btn-gold" onclick="followChef('${chef.name}',this)">Follow</button>
                <button class="btn-ghost" onclick="openCommunity()"><i class="ti ti-message-circle"></i> Message</button>
              </div>

              <!-- Join Community CTA on chef profile -->
              <div class="join-community-cta" style="max-width:480px">
                <i class="ti ti-users"></i>
                <div class="join-community-cta-text">
                  <div class="join-community-cta-title">${chef.name} is active in the Shapem Community</div>
                  <div class="join-community-cta-sub">Sharing recipes · Entering challenges · Inspiring cooks worldwide</div>
                </div>
                <button class="btn-gold" style="padding:8px 16px;font-size:13px" onclick="openCommunity()">
                  Join Community
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container" style="padding:2rem 24px 4rem">
        <h3 style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;color:var(--text-primary);margin-bottom:1.25rem">
          Recipes by ${chef.name}
        </h3>
        ${chefRecipes.length
          ? `<div class="recipe-grid">${chefRecipes.map((r,i) => { const card = createRecipeCard(r, i*80); return card.outerHTML; }).join('')}</div>`
          : `<div style="text-align:center;padding:3rem;color:var(--text-muted)"><i class="ti ti-chef-hat" style="font-size:2.5rem;display:block;margin-bottom:1rem"></i><p>Recipes from ${chef.name} coming soon.</p></div>`
        }
      </div>
    </div>`;

  // Re-wire recipe card clicks since we used outerHTML
  page.querySelectorAll('.recipe-card').forEach(card => {
    const id = card.dataset.id;
    const recipe = RECIPES.find(r => String(r.id) === id);
    if (recipe) card.addEventListener('click', () => openRecipeModal(recipe));
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Upload modal ──────────────────────────
function openUploadModal() {
  if (!currentUser) { openAuthModal('login'); return; }
  document.getElementById('uploadModalOverlay')?.classList.add('open');
}
function closeUploadModal() {
  document.getElementById('uploadModalOverlay')?.classList.remove('open');
}

function submitCommunityPost() {
  const title = document.getElementById('uploadTitle')?.value.trim();
  const desc  = document.getElementById('uploadDesc')?.value.trim();
  const cuisine = document.getElementById('uploadCuisine')?.value.trim();
  const err   = document.getElementById('uploadError');

  if (!title || !desc || !cuisine) {
    if (err) { err.textContent = 'Please fill in the recipe name, description, and cuisine.'; err.style.display = ''; }
    return;
  }
  if (err) err.style.display = 'none';

  const name   = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'You';
  const avatar = currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture;
  const tags   = (document.getElementById('uploadTags')?.value || '').split(',').map(t => t.trim()).filter(Boolean);

  // Add to posts array and re-render
  const newPost = {
    id: Date.now(),
    authorName: name,
    authorEmoji: avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : name.charAt(0),
    authorRole: 'community',
    country: '🌍',
    time: 'Just now',
    text: desc,
    recipe: { title, emoji: '🍽', cuisine, time: parseInt(document.getElementById('uploadTime')?.value) || 30, cal: parseInt(document.getElementById('uploadCal')?.value) || 300 },
    tags,
    likes: 0, comments: 0, shares: 0, liked: false,
  };
  COMMUNITY_POSTS.unshift(newPost);

  closeUploadModal();
  switchCommunityTab('feed');
  const feed = document.getElementById('communityFeed');
  if (feed) {
    const postEl = document.createElement('div');
    postEl.innerHTML = buildPostHTML(newPost, 0);
    feed.insertBefore(postEl.firstElementChild, feed.firstChild);
  }

  // Clear form
  ['uploadTitle','uploadDesc','uploadCuisine','uploadTime','uploadCal','uploadIngredients','uploadSteps','uploadTags'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}
