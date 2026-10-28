# Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. In Cloudflare Pages, create a new project and connect the GitHub repo.
3. Framework preset: None.
4. Build command: leave empty.
5. Output directory: `public`.
6. Add environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
7. In Supabase Auth, set Site URL and Redirect URLs to your Cloudflare domain.
8. Run `npm run deploy` or use the Cloudflare dashboard.
