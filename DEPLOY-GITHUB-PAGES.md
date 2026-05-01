# Deploying Ifeoluwa Reviews to GitHub Pages

This project is a Vite + React SPA. The frontend can be exported as static files and hosted on GitHub Pages. The backend (auth, database, admin) continues to run on Lovable Cloud — your deployed site will talk to the same backend over the internet using the public anon key (already baked into `.env`).

## One-time setup

1. Push this repo to GitHub (use **Connectors → GitHub → Connect project** in Lovable, then create a repo).
2. In GitHub: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
3. Push to `main` (or run the workflow manually). The included workflow at `.github/workflows/deploy-pages.yml` will build and publish automatically.

Your site will be live at:
```
https://<your-username>.github.io/<repo-name>/
```

## How the build works

- `BASE_PATH` env var controls Vite's `base`. The workflow sets it to `/<repo-name>/` automatically.
- After build, `dist/index.html` is copied to `dist/404.html` so deep links (e.g. `/blog`, `/post/123`) work on Pages.
- A `.nojekyll` file is added so GitHub Pages serves files starting with `_`.

## Custom domain or user/org site

If you use a custom domain, or your repo is `<username>.github.io`, change the `BASE_PATH` line in the workflow to:
```yaml
BASE_PATH: /
```

For a custom domain, also add a `public/CNAME` file containing your domain (e.g. `reviews.example.com`).

## Building locally

```bash
npm install
BASE_PATH=/your-repo/ npm run build
# Output is in ./dist
```

You can preview with `npm run preview`.

## Backend caveats

- Auth, posts, member cap, admin dashboard all require Lovable Cloud — they continue to work because the Supabase URL/anon key are public-safe and embedded in the build.
- If you ever rotate the anon key in Lovable Cloud, rebuild and redeploy.
- Email confirmation redirects: in Lovable Cloud → Auth settings, add your Pages URL (`https://<user>.github.io/<repo>/`) to the allowed redirect URLs.
