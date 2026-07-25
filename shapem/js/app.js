/* ═══════════════════════════════════════════
   SHAPEM — App Entry Point
═══════════════════════════════════════════ */

// ── Single source of truth for page routing ──
const PAGES = ['page-home', 'page-recipes', 'page-dashboard', 'page-community', 'page-chef-profile', 'page-about', 'page-privacy', 'page-terms'];

function showLegal(type) {
  PAGES.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var page = document.getElementById('page-' + type);
  if (page) page.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeLegalPage() {
  PAGES.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.getElementById('page-home').style.display = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openAbout() {
  PAGES.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var about = document.getElementById('page-about');
  if (about) about.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelectorAll('.nav-link').forEach(function(a) {
    a.style.color = a.dataset.page === 'about' ? 'var(--gold)' : '';
  });
}

function showPage(page) {
  // Hide every page
  PAGES.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Show the requested one
  const target = document.getElementById('page-' + page);
  if (target) target.style.display = 'block';

  // If page doesn't exist yet (recipes, community built lazily)
  if (!target) {
    if (page === 'home') {
      document.getElementById('page-home').style.display = '';
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Highlight active nav link
  document.querySelectorAll('.nav-link').forEach(a => {
    const isActive = (a.dataset.page === page) ||
                     (page === 'community' && a.dataset.page === 'community') ||
                     (page === 'recipes'   && a.getAttribute('href') === '#recipes');
    a.style.color = isActive ? 'var(--gold)' : '';
  });

  // Build pages on first visit
  if (page === 'recipes')   buildRecipesPage();
  if (page === 'community') {
    if (typeof openCommunity === 'function') openCommunity();
    return; // openCommunity handles its own display
  }
}

// ── Recipes page ─────────────────────────
function buildRecipesPage() {
  let page = document.getElementById('page-recipes');
  if (!page) return;
  if (page.dataset.built) return;
  page.dataset.built = 'true';

  const container = document.getElementById('recipesContainer');
  const tabsWrap  = document.getElementById('countryTabs');
  const countEl   = document.getElementById('recipesTotalCount');
  if (!container || !tabsWrap) return;

  const byCountry = {};
  RECIPES.forEach(r => {
    const c = r.country || 'World';
    if (!byCountry[c]) byCountry[c] = { flag: r.countryFlag || '🌍', recipes: [] };
    byCountry[c].recipes.push(r);
  });

  const countries = Object.keys(byCountry).sort();
  if (countEl) countEl.textContent = `${RECIPES.length} recipes · ${countries.length} countries`;

  // All pill
  tabsWrap.innerHTML = '';
  const allPill = document.createElement('button');
  allPill.className = 'filter-chip active';
  allPill.textContent = '🌍 All Countries';
  allPill.onclick = () => {
    document.querySelectorAll('.country-section').forEach(s => s.style.display = '');
    document.querySelectorAll('#countryTabs .filter-chip').forEach(b => b.classList.remove('active'));
    allPill.classList.add('active');
  };
  tabsWrap.appendChild(allPill);

  // Country pills
  countries.forEach(country => {
    const d = byCountry[country];
    const pill = document.createElement('button');
    pill.className = 'filter-chip';
    pill.innerHTML = `${d.flag} ${country} <span style="opacity:.5;font-size:11px">(${d.recipes.length})</span>`;
    pill.onclick = () => {
      document.querySelectorAll('.country-section').forEach(s => {
        s.style.display = s.dataset.country === country ? '' : 'none';
      });
      document.querySelectorAll('#countryTabs .filter-chip').forEach(b => b.classList.remove('active'));
      pill.classList.add('active');
      document.getElementById(`country-${country.replace(/\s/g,'-')}`)?.scrollIntoView({ behavior:'smooth', block:'start' });
    };
    tabsWrap.appendChild(pill);
  });

  // Country sections
  countries.forEach(country => {
    const d = byCountry[country];
    const section = document.createElement('div');
    section.className = 'country-section';
    section.dataset.country = country;
    section.id = `country-${country.replace(/\s/g,'-')}`;
    section.style.marginBottom = '3rem';
    section.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid var(--border-dim)">
        <span style="font-size:2rem">${d.flag}</span>
        <div>
          <h2 style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;color:var(--text-primary)">${country}</h2>
          <p style="font-size:12px;color:var(--text-muted)">${d.recipes.length} recipe${d.recipes.length > 1 ? 's' : ''}</p>
        </div>
      </div>
      <div class="recipe-grid" id="grid-${country.replace(/\s/g,'-')}"></div>`;
    container.appendChild(section);

    const grid = document.getElementById(`grid-${country.replace(/\s/g,'-')}`);
    d.recipes.forEach((r, i) => grid.appendChild(createRecipeCard(r, i * 60)));
  });
}

// ── Boot ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Expose globals
  window.starsHTML        = starsHTML;
  window.openRecipeModal  = openRecipeModal;
  window.openAuthModal    = openAuthModal;
  window.closeAuthModal   = closeAuthModal;
  window.showPage         = showPage;
  window.openAbout         = openAbout;
  window.showLegal         = showLegal;
  window.closeLegalPage    = closeLegalPage;
  window.formatNum        = formatNum;
  window.currentUser      = null;

  // Init modules
  initAuth().catch(console.warn);
  initNav();
  initSearch();
  initAI();
  initModals();

  // Home page initial renders
  renderTrending();
  renderCuisines();
  renderBadges();
  renderLeaderboard();
  observeSection('chefs',    renderChefs);
  observeSection('seasonal', renderSeasonal);
  observeSection('home',     animateCounters);

  // Hero buttons
  document.getElementById('heroExplore')?.addEventListener('click', () => showPage('recipes'));
  var heroAIBtn = document.getElementById('heroAI');
  if (heroAIBtn) {
    heroAIBtn.addEventListener('click', function() {
      // Make sure home is shown
      PAGES.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      document.getElementById('page-home').style.display = '';
      // Force AI section visible (override fade animation)
      var aiSection = document.getElementById('ai-finder');
      if (aiSection) {
        aiSection.style.opacity = '1';
        aiSection.style.transform = 'translateY(0)';
        setTimeout(function() {
          aiSection.scrollIntoView({ behavior: 'smooth' });
          setTimeout(function() {
            var aiInput = document.getElementById('aiInput');
            if (aiInput) aiInput.focus();
          }, 600);
        }, 100);
      }
    });
  }

  // Nav link routing — intercept all
  document.querySelectorAll('.nav-link, .nav-mobile a, .footer-nav').forEach(el => {
    el.addEventListener('click', e => {
      const href = el.getAttribute('href') || '';
      const page = el.dataset.page;

      if (href === '#recipes' || page === 'recipes') {
        e.preventDefault();
        showPage('recipes');
      } else if (page === 'about' || href === '#about') {
        e.preventDefault();
        openAbout();
      } else if (page === 'community' || href.includes('community')) {
        e.preventDefault();
        if (typeof openCommunity === 'function') openCommunity();
      } else if (page === 'home') {
        e.preventDefault();
        // Show home page
        PAGES.forEach(function(id) {
          var el2 = document.getElementById(id);
          if (el2) el2.style.display = 'none';
        });
        document.getElementById('page-home').style.display = '';

        // Scroll to specific section if href is a section anchor
        if (href && href !== '#home' && href !== '#') {
          var target = document.querySelector(href);
          if (target) {
            // Force section visible (in case it was faded out)
            target.style.opacity = '1';
            target.style.transform = 'translateY(0)';
            setTimeout(function() {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  });

  // Recipes page search
  const rsi = document.getElementById('recipesSearchInput');
  const rsd = document.getElementById('recipesSearchDrop');
  if (rsi && rsd) {
    let t;
    rsi.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const q = rsi.value.trim().toLowerCase();
        if (!q) { rsd.classList.remove('visible'); return; }
        const results = RECIPES.filter(r =>
          r.title.toLowerCase().includes(q) ||
          (r.country||'').toLowerCase().includes(q) ||
          (r.cuisine||'').toLowerCase().includes(q) ||
          (r.desc||'').toLowerCase().includes(q) ||
          (r.tags||[]).some(tag => tag.includes(q))
        );
        rsd.innerHTML = results.length
          ? results.slice(0,8).map(r => `
            <div class="search-drop-item" onclick="openRecipeModal(RECIPES.find(x=>String(x.id)==='${r.id}'));document.getElementById('recipesSearchDrop').classList.remove('visible')">
              <div class="search-drop-thumb">${r.emoji}</div>
              <div>
                <div class="search-drop-title">${r.title}</div>
                <div class="search-drop-meta">${r.countryFlag||''} ${r.country||r.cuisine} · ${r.time}min · ${r.cal} cal</div>
              </div>
            </div>`).join('')
          : `<div class="search-drop-empty">No recipes found for "<strong>${q}</strong>"</div>`;
        rsd.classList.add('visible');
      }, 250);
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.search-bar-wrap')) rsd.classList.remove('visible');
    });
  }

  // Close user dropdown on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('#userMenu')) closeUserDropdown();
  });

  // Fade-in sections on home page
  const fadeObs = new IntersectionObserver(entries => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.style.opacity = '1';
        el.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('#page-home .section, #page-home .section-dark, #page-home .section-warm').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    fadeObs.observe(el);
  });

  // Canvas resize
  function resizeCanvas() {
    const c = document.getElementById('heroCanvas');
    if (c) { c.width = c.clientWidth; c.height = c.clientHeight; }
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  console.log('%c🍽 Shapem loaded', 'color:#C9963A;font-size:16px;font-weight:bold');
});
