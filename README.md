# ParseLock

Tagline: Fill. Generate. Done.

ParseLock generates documents from templates. Upload a spreadsheet, map columns to placeholders, and download one finished document per row.

## Local setup

1. Install dependencies: `npm install`
2. Copy `public/js/config.example.js` to `public/js/config.js` and fill in your Supabase URL and anon key.
3. Run `npm run dev` to start a local static server with Wrangler.
4. Open the local URL shown by Wrangler.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Enable Email and Google auth providers in Supabase Auth.
4. Add your Cloudflare domain to the list of allowed Redirect URLs.

## Config

All environment values live in `public/js/config.js`. Commit `public/js/config.example.js` instead.

## Docs

- `docs/DEPLOY_CLOUDFLARE.md` - Cloudflare Pages deployment steps
- `docs/DECISIONS.md` - Architecture decisions
- `docs/PHASE2.md` - Phase 2 readiness plan
