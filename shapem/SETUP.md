# Shapem — Setup Status

## ✅ Completed
- Supabase project created (qwlrcjwqjlzrkdhmwqgz)
- API keys connected in js/supabase.js
- Database tables created (profiles, saved_recipes, meal_plans, reviews, shopping_list_items)
- Row Level Security enabled on all tables
- Email sign-in enabled
- Google sign-in enabled and configured

## 🔲 Optional: Apple Sign-In
Apple requires a paid Apple Developer account ($99/year).
If you want it later:
1. Go to https://developer.apple.com
2. Create a Services ID (e.g. com.shapem.app)
3. Enable Sign In with Apple
4. Add redirect URI: https://qwlrcjwqjlzrkdhmwqgz.supabase.co/auth/v1/callback
5. Create a Private Key (.p8 file)
6. In Supabase → Authentication → Providers → Apple
7. Fill in Services ID, Team ID, Key ID, and paste .p8 file contents

## 🔲 Deploy your website (free options)

### Option A — Netlify (easiest, recommended)
1. Go to https://netlify.com and sign up free
2. Drag and drop your entire `shapem` folder onto the Netlify dashboard
3. Your site goes live instantly (e.g. shapem.netlify.app)
4. Then update Supabase:
   - Authentication → URL Configuration
   - Site URL: https://shapem.netlify.app
   - Redirect URLs: https://shapem.netlify.app/*

### Option B — Vercel
1. Go to https://vercel.com
2. Connect your GitHub repo or drag and drop
3. Update Supabase URLs as above

### Option C — GitHub Pages
1. Push shapem folder to a GitHub repo
2. Settings → Pages → enable from main branch
3. Update Supabase URLs as above

## Google Cloud OAuth — add your live domain later
Once deployed, go to Google Cloud Console → Credentials → your Shapem OAuth client
and add:
- Authorised JavaScript origins: https://your-live-domain.com
- Authorised redirect URIs: https://qwlrcjwqjlzrkdhmwqgz.supabase.co/auth/v1/callback
