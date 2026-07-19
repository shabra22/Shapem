/* ═══════════════════════════════════════════
   SHAPEM — Search
═══════════════════════════════════════════ */

let activeFilter = 'all';
let searchTimeout = null;

function performSearch(query) {
  const drop = document.getElementById('searchDrop');
  if (!drop) return;

  query = query.trim().toLowerCase();
  if (!query) { drop.classList.remove('visible'); return; }

  const filterMap = {
    vegan:     r => r.tags.some(t => t.includes('vegan')),
    keto:      r => r.cal < 400,
    quick:     r => r.time <= 30,
    breakfast: r => r.time <= 30,
    dinner:    r => r.cal > 400,
    dessert:   r => r.title.toLowerCase().includes('sweet') || r.tags.includes('dessert'),
  };

  let results = RECIPES.filter(r =>
    r.title.toLowerCase().includes(query) ||
    r.cuisine.toLowerCase().includes(query) ||
    r.desc.toLowerCase().includes(query) ||
    r.tags.some(t => t.includes(query)) ||
    r.ingredients.some(i => i.toLowerCase().includes(query))
  );

  if (activeFilter !== 'all' && filterMap[activeFilter]) {
    results = results.filter(filterMap[activeFilter]);
  }

  drop.innerHTML = '';
  if (results.length === 0) {
    drop.innerHTML = `<div class="search-drop-empty">
      <i class="ti ti-mood-empty" style="font-size:2rem;display:block;margin-bottom:8px"></i>
      No recipes found for "<strong>${query}</strong>"
    </div>`;
  } else {
    results.slice(0, 6).forEach(r => {
      const item = document.createElement('div');
      item.className = 'search-drop-item';
      item.innerHTML = `
        <div class="search-drop-thumb">${r.emoji}</div>
        <div>
          <div class="search-drop-title">${r.title}</div>
          <div class="search-drop-meta">${r.cuisine} · ${r.time}min · ${r.cal} cal</div>
        </div>
        <div style="margin-left:auto">
          <span class="recipe-rating"><i class="ti ti-star-filled" style="font-size:11px"></i> ${r.rating}</span>
        </div>`;
      item.addEventListener('click', () => {
        openRecipeModal(r);
        drop.classList.remove('visible');
        document.getElementById('searchInput').value = r.title;
      });
      drop.appendChild(item);
    });
  }
  drop.classList.add('visible');
}

function initSearch() {
  const input  = document.getElementById('searchInput');
  const drop   = document.getElementById('searchDrop');
  const submit = document.getElementById('searchSubmit');
  const voiceBtn = document.getElementById('voiceBtn');

  if (!input) return;

  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => performSearch(input.value), 280);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim()) performSearch(input.value);
  });

  submit.addEventListener('click', () => performSearch(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') performSearch(input.value);
    if (e.key === 'Escape') drop.classList.remove('visible');
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-bar-wrap')) drop.classList.remove('visible');
  });

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      if (input.value.trim()) performSearch(input.value);
    });
  });

  // Voice search
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    voiceBtn.addEventListener('click', () => {
      voiceBtn.classList.add('active');
      recognition.start();
    });
    recognition.onresult = e => {
      const transcript = e.results[0][0].transcript;
      input.value = transcript;
      voiceBtn.classList.remove('active');
      performSearch(transcript);
    };
    recognition.onend = () => voiceBtn.classList.remove('active');
    recognition.onerror = () => voiceBtn.classList.remove('active');
  } else {
    voiceBtn.style.display = 'none';
  }

  // Nav search button scrolls to search strip
  document.getElementById('btnSearchNav')?.addEventListener('click', () => {
    document.getElementById('search-strip').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => input.focus(), 500);
  });
}
