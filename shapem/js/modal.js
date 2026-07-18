/* ═══════════════════════════════════════════
   SHAPEM — Recipe & Auth Modals
═══════════════════════════════════════════ */

function openRecipeModal(recipe) {
  // ── Related Recipes (linked ecosystem) ──────────────────────
  const relatedHTML = (recipe.relatedRecipes && recipe.relatedRecipes.length)
    ? (() => {
        const related = recipe.relatedRecipes
          .map(rid => RECIPES.find(r => r.id === rid))
          .filter(Boolean);
        if (!related.length) return '';
        return `
          <div class="modal-section-title">You May Also Like</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">
            ${related.map(r => `
              <div onclick="closeRecipeModal();setTimeout(()=>openRecipeModal(RECIPES.find(x=>x.id==='${r.id}')),120)"
                style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg-card);
                       border:1px solid var(--border-dim);border-radius:var(--r-md);cursor:pointer;
                       transition:border-color .2s,background .2s"
                onmouseover="this.style.borderColor='var(--gold)';this.style.background='var(--bg-elevated)'"
                onmouseout="this.style.borderColor='var(--border-dim)';this.style.background='var(--bg-card)'">
                <span style="font-size:1.8rem;flex-shrink:0">${r.emoji}</span>
                <div>
                  <div style="font-size:13px;font-weight:600;color:var(--text-primary);line-height:1.3">${r.title}</div>
                  <div style="font-size:11px;color:var(--text-muted)">${r.countryFlag || ''} ${r.cuisine} · ${r.time}m</div>
                </div>
              </div>`).join('')}
          </div>`;
      })()
    : '';

  const modal   = document.getElementById('recipeModal');
  const content = document.getElementById('modalContent');
  if (!modal || !content) return;

  const ingredientsHTML = recipe.ingredients
    .map(i => `<div class="ingredient-item">${i}</div>`).join('');

  const stepsHTML = recipe.steps
    .map((s, i) => `<div class="step-item">
      <div class="step-num">${i + 1}</div>
      <div>${s}</div>
    </div>`).join('');

  const n = recipe.nutrition;

  // ── Optional rich sections (KEN001+ recipes) ──
  const countryBadge = recipe.countryFlag
    ? `<span class="badge badge-gold">${recipe.countryFlag} ${recipe.country}</span>` : '';

  const localNameHTML = recipe.localName
    ? `<p style="font-size:13px;color:var(--text-muted);margin-bottom:4px;font-style:italic">Local name: <strong style="color:var(--gold)">${recipe.localName}</strong></p>` : '';

  const longDescHTML = recipe.longDesc
    ? `<p style="color:var(--text-muted);font-size:13px;line-height:1.75;margin-top:8px;padding:14px 16px;background:var(--bg-card);border-left:3px solid var(--gold);border-radius:0 var(--r-md) var(--r-md) 0">${recipe.longDesc}</p>` : '';

  const chefTipsHTML = recipe.chefTips ? `
    <div class="modal-section-title">Chef's Tips</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${recipe.chefTips.map(t => `
        <div style="display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--text-secondary)">
          <span style="color:var(--gold);flex-shrink:0;margin-top:2px"><i class="ti ti-bulb"></i></span>${t}
        </div>`).join('')}
    </div>` : '';

  const mistakesHTML = recipe.commonMistakes ? `
    <div class="modal-section-title">Common Mistakes to Avoid</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${recipe.commonMistakes.map(m => `
        <div style="display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--text-secondary)">
          <span style="color:var(--coral);flex-shrink:0;margin-top:2px"><i class="ti ti-alert-circle"></i></span>${m}
        </div>`).join('')}
    </div>` : '';

  const servedWithHTML = recipe.servedWith ? `
    <div class="modal-section-title">Best Served With</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      ${recipe.servedWith.map(s => `<span class="badge badge-emerald">${s}</span>`).join('')}
    </div>` : '';

  const culturalHTML = recipe.culturalNote ? `
    <div class="modal-section-title">Cultural Significance</div>
    <div style="font-size:13px;color:var(--text-secondary);line-height:1.75;padding:14px 16px;background:var(--bg-card);border-radius:var(--r-md);border:1px solid var(--border-gold)">
      <i class="ti ti-world" style="color:var(--gold);margin-right:6px"></i>${recipe.culturalNote}
    </div>` : '';

  const variationsHTML = recipe.regionalVariations ? `
    <div class="modal-section-title">Regional Variations</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${recipe.regionalVariations.map(v => `
        <div style="display:flex;gap:8px;font-size:13px;color:var(--text-secondary)">
          <span style="color:var(--gold)">·</span>${v}
        </div>`).join('')}
    </div>` : '';

  const healthHTML = recipe.healthBenefits ? `
    <div class="modal-section-title">Health Benefits</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${recipe.healthBenefits.map(h => `
        <div style="display:flex;gap:8px;font-size:13px;color:var(--text-secondary)">
          <span style="color:var(--emerald)"><i class="ti ti-heart"></i></span>${h}
        </div>`).join('')}
    </div>` : '';

  const storageHTML = recipe.storage ? `
    <div class="modal-section-title">Storage & Reheating</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div style="padding:12px;background:var(--bg-card);border-radius:var(--r-md);border:1px solid var(--border-dim)">
        <div style="font-size:11px;color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px"><i class="ti ti-fridge"></i> Storage</div>
        <div style="font-size:13px;color:var(--text-secondary)">${recipe.storage}</div>
      </div>
      <div style="padding:12px;background:var(--bg-card);border-radius:var(--r-md);border:1px solid var(--border-dim)">
        <div style="font-size:11px;color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px"><i class="ti ti-flame"></i> Reheating</div>
        <div style="font-size:13px;color:var(--text-secondary)">${recipe.reheating || 'Reheat until piping hot.'}</div>
      </div>
    </div>` : '';

  content.innerHTML = `
    <div class="modal-recipe-hero-placeholder">${recipe.emoji}</div>
    <div class="modal-body">

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        ${recipe.tags.map(t => `<span class="badge badge-emerald">${t}</span>`).join('')}
        <span class="badge badge-gold">${recipe.cuisine}</span>
        ${countryBadge}
        ${recipe.course ? `<span class="badge badge-purple">${recipe.course}</span>` : ''}
      </div>

      ${localNameHTML}
      <h2 class="modal-recipe-title">${recipe.title}</h2>
      <p style="color:var(--text-secondary);font-size:14px;line-height:1.7;margin-bottom:8px">${recipe.desc}</p>
      ${longDescHTML}

      <div class="modal-recipe-meta" style="margin-top:var(--space-lg)">
        ${recipe.prepTime ? `<span class="modal-meta-item"><i class="ti ti-clock"></i> ${recipe.prepTime}m prep</span>` : ''}
        ${recipe.cookTime ? `<span class="modal-meta-item"><i class="ti ti-flame"></i> ${recipe.cookTime}m cook</span>` : ''}
        <span class="modal-meta-item"><i class="ti ti-clock"></i> ${recipe.time}m total</span>
        <span class="modal-meta-item"><i class="ti ti-fire"></i> ${recipe.cal} kcal</span>
        <span class="modal-meta-item"><i class="ti ti-users"></i> Serves ${recipe.servings || 4}</span>
        <span class="modal-meta-item"><i class="ti ti-chart-bar"></i> ${recipe.diff}</span>
        <span class="modal-meta-item" style="margin-left:auto">
          <div class="stars">${starsHTML(recipe.rating)}</div>
          &nbsp;${recipe.rating} (${recipe.reviews.toLocaleString()} reviews)
        </span>
      </div>

      <div class="modal-section-title">Ingredients</div>
      <div class="ingredient-list">${ingredientsHTML}</div>

      <div class="modal-section-title">Instructions</div>
      <div class="step-list">${stepsHTML}</div>

      ${chefTipsHTML}
      ${mistakesHTML}

      <div class="modal-section-title">Nutrition (per serving)</div>
      <div class="nutrition-grid" style="grid-template-columns:repeat(${n.fiber ? 6 : 4},1fr)">
        <div class="nutrition-item"><div class="nutrition-val">${n.cal}</div><div class="nutrition-label">Calories</div></div>
        <div class="nutrition-item"><div class="nutrition-val">${n.protein}g</div><div class="nutrition-label">Protein</div></div>
        <div class="nutrition-item"><div class="nutrition-val">${n.carbs}g</div><div class="nutrition-label">Carbs</div></div>
        <div class="nutrition-item"><div class="nutrition-val">${n.fat}g</div><div class="nutrition-label">Fat</div></div>
        ${n.fiber ? `<div class="nutrition-item"><div class="nutrition-val">${n.fiber}g</div><div class="nutrition-label">Fiber</div></div>` : ''}
        ${n.sodium ? `<div class="nutrition-item"><div class="nutrition-val">${n.sodium}mg</div><div class="nutrition-label">Sodium</div></div>` : ''}
      </div>

      ${servedWithHTML}
      ${healthHTML}
      ${culturalHTML}
      ${variationsHTML}
      ${storageHTML}

      ${relatedHTML}

      <div style="display:flex;gap:12px;margin-top:var(--space-xl);flex-wrap:wrap">
        <button class="btn-gold btn-lg" onclick="alert('Saved to your collection!')">
          <i class="ti ti-bookmark"></i> Save Recipe
        </button>
        <button class="btn-outline btn-lg" onclick="alert('Added to meal plan!')">
          <i class="ti ti-calendar"></i> Add to Meal Plan
        </button>
        <button class="btn-ghost" onclick="alert('Shopping list updated!')">
          <i class="ti ti-shopping-cart"></i> Add to Shopping List
        </button>
      </div>
    </div>`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRecipeModal() {
  document.getElementById('recipeModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

// openAuthModal is now in auth-ui.js

// closeAuthModal is now in auth-ui.js

function initModals() {
  document.getElementById('modalClose')?.addEventListener('click', closeRecipeModal);
  document.getElementById('authClose')?.addEventListener('click', closeAuthModal);

  document.getElementById('recipeModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeRecipeModal();
  });
  document.getElementById('authModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAuthModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeRecipeModal(); closeAuthModal(); }
  });

  document.getElementById('btnLogin')?.addEventListener('click',  () => openAuthModal('login'));
  document.getElementById('btnSignup')?.addEventListener('click', () => openAuthModal('signup'));
}
