# Ifeoluwa Reviews

A tender lifestyle journal — book reviews, slow skincare rituals, and aesthetic everyday joy. A small circle of 200 readers.

Built with **Vite + React + TypeScript + Tailwind CSS + shadcn/ui**, with a **Supabase** backend (auth, database, RLS, 200-seat membership cap, admin role).

## Quick start

```bash
npm install
npm run dev
```

The app runs at http://localhost:8080.

## Environment variables

The repo ships with a `.env` file pointing at the existing Lovable Cloud (Supabase) backend so signup/login/admin work out of the box.

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

If you want to point at your own Supabase project, replace these values and re-run the migrations from `supabase/migrations/`.

## Build for production

```bash
npm run build       # outputs ./dist
npm run preview     # serve the build locally
```

## Deploy to GitHub Pages

This repo includes a ready-to-go GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

1. Push to GitHub.
2. Repo **Settings → Pages → Source = GitHub Actions**.
3. Push to `main` — the workflow builds with the correct `BASE_PATH=/<repo-name>/`, adds an SPA `404.html` fallback and `.nojekyll`, then publishes.
4. In Lovable Cloud → Auth, add your Pages URL to **Allowed Redirect URLs**.

For user/org pages or a custom domain, change `BASE_PATH` in the workflow to `/`. See `DEPLOY-GITHUB-PAGES.md` for details.

## Deploy anywhere else

Any static host works (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront…). Just `npm run build` and serve `dist/`. Make sure your host rewrites unknown routes to `index.html` for SPA routing.

## Project structure

```
src/
  pages/          # Index, Auth, Blog, Post, Admin, NotFound
  components/     # Navbar, Footer, shadcn/ui primitives
  hooks/useAuth   # Session + role (admin) context
  integrations/   # Supabase client + generated types
  index.css       # Dusty Pink & Sage design system (HSL tokens)
supabase/
  migrations/     # profiles, user_roles, posts, 200-seat trigger, RLS
  config.toml
.github/workflows/deploy-pages.yml
```

## Owner / admin

The first user to sign up automatically becomes the admin. Visit `/admin` after signup to manage members and posts.

## License

MIT — do whatever you like.
