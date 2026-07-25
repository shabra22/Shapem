/* ═══════════════════════════════════════════
   SHAPEM — Supabase Client & Auth
═══════════════════════════════════════════ */

const SUPABASE_URL  = 'https://qwlrcjwqjlzrkdhmwqgz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3bHJjandxamx6cmtkaG13cWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMDU4MDIsImV4cCI6MjA5OTc4MTgwMn0.N0YckRF7Og4nrWp7d_nPWzgzaOFBcnrDKI6u4vAtjmc';

let _supabase = null;
let currentUser = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (typeof supabase === 'undefined') {
    console.warn('Supabase SDK not loaded yet.');
    return null;
  }
  _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      detectSessionInUrl: true,  // automatically picks up token from URL hash
      persistSession: true,       // keeps user logged in across page refreshes
      autoRefreshToken: true,     // refreshes token before it expires
    }
  });
  return _supabase;
}

// ── Init: runs on page load ───────────────
async function initAuth() {
  const sb = getSupabase();
  if (!sb) return;

  // Listen FIRST before getSession so we catch the SIGNED_IN event from OAuth hash
  sb.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    onAuthStateChange(currentUser);
    if (_event === 'SIGNED_IN') {
      // Clean the ugly token hash from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      closeAuthModal();
    }
  });

  // This triggers the onAuthStateChange above if there's a token in the URL hash
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    currentUser = session.user;
    onAuthStateChange(currentUser);
    // Clean URL if we landed with a token hash
    if (window.location.hash.includes('access_token')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}

// ── Updates nav UI based on login state ──
function onAuthStateChange(user) {
  // Wait for DOM to be ready before touching elements
  const update = () => {
  const btnLogin  = document.getElementById('btnLogin');
  const btnSignup = document.getElementById('btnSignup');
  const userMenu  = document.getElementById('userMenu');

  if (user) {
    if (btnLogin)  btnLogin.style.display  = 'none';
    if (btnSignup) btnSignup.style.display = 'none';
    if (userMenu) {
      userMenu.style.display = 'flex';
      const name   = user.user_metadata?.full_name
                  || user.user_metadata?.name
                  || user.email?.split('@')[0]
                  || 'Chef';
      const avatar = user.user_metadata?.avatar_url
                  || user.user_metadata?.picture
                  || null;
      const nameEl   = document.getElementById('userMenuName');
      const avatarEl = document.getElementById('userMenuAvatar');
      if (nameEl)   nameEl.textContent = name;
      if (avatarEl) {
        avatarEl.innerHTML = avatar
          ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
          : name.charAt(0).toUpperCase();
      }
    }
  } else {
    if (btnLogin)  btnLogin.style.display  = '';
    if (btnSignup) btnSignup.style.display = '';
    if (userMenu)  userMenu.style.display  = 'none';
  }
  }; // end update
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update);
  } else {
    update();
  }
}

// ── Email sign up ─────────────────────────
async function signUpEmail(name, email, password) {
  const sb = getSupabase();
  if (!sb) return { error: { message: 'Not connected to Supabase.' } };
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: window.location.origin,
    }
  });
  return { data, error };
}

// ── Email sign in ─────────────────────────
async function signInEmail(email, password) {
  const sb = getSupabase();
  if (!sb) return { error: { message: 'Not connected to Supabase.' } };
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  return { data, error };
}

// ── Google sign in ────────────────────────
async function signInGoogle() {
  const sb = getSupabase();
  if (!sb) return { error: { message: 'Not connected to Supabase.' } };
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href.split('#')[0], // redirect back to current page
      skipBrowserRedirect: false,
    }
  });
  return { error };
}

// ── Apple sign in ─────────────────────────
async function signInApple() {
  const sb = getSupabase();
  if (!sb) return { error: { message: 'Not connected to Supabase.' } };
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: window.location.origin }
  });
  return { error };
}

// ── Sign out ──────────────────────────────
async function signOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
  closeUserDropdown();
}

// ── Reset password ────────────────────────
async function resetPassword(email) {
  const sb = getSupabase();
  if (!sb) return { error: { message: 'Not connected to Supabase.' } };
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}?reset=true`,
  });
  return { error };
}

// ── Save a recipe ─────────────────────────
async function saveRecipe(recipeId) {
  if (!currentUser) { openAuthModal('login'); return false; }
  const sb = getSupabase();
  const { error } = await sb.from('saved_recipes').upsert({
    user_id:   currentUser.id,
    recipe_id: String(recipeId),
    saved_at:  new Date().toISOString(),
  });
  return !error;
}

// ── Get saved recipes for current user ───
async function getSavedRecipes() {
  if (!currentUser) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from('saved_recipes')
    .select('recipe_id')
    .eq('user_id', currentUser.id);
  if (error) return [];
  return data.map(r => r.recipe_id);
}

// ── User dropdown toggle ──────────────────
function toggleUserDropdown() {
  const drop = document.getElementById('userDropdown');
  if (!drop) return;
  const isOpen = drop.classList.contains('open');
  drop.classList.toggle('open');
  // Populate header with live user info
  if (!isOpen && currentUser) {
    const name  = currentUser.user_metadata?.full_name
               || currentUser.user_metadata?.name
               || currentUser.email?.split('@')[0] || '';
    const email = currentUser.email || '';
    const dn = document.getElementById('dropName');
    const de = document.getElementById('dropEmail');
    if (dn) dn.textContent = name;
    if (de) de.textContent = email;
  }
}

function closeUserDropdown() {
  document.getElementById('userDropdown')?.classList.remove('open');
}
