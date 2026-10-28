# DECISIONS

- Frontend stack: vanilla HTML/CSS/JS with ES modules. No bundler, no React/Vue.
- Routing: hash-based to avoid server rewrite rules on static hosts.
- Database: Supabase PostgreSQL with RLS. Only task metadata is stored; spreadsheets and generated files never leave the browser.
- Editor: custom contenteditable editor. Not using a heavy third-party editor.
- Placeholder matching: case-insensitive, space/underscore-tolerant, split-run tolerant at DOM level to preserve formatting inheritance.
- Ads: provider-agnostic adapter with a simulated placeholder default. Turned off with `ADS_ENABLED=false`.
- Deployment: Cloudflare Pages static site. `wrangler pages dev` and `wrangler pages deploy` both target `./public`.
