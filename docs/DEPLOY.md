# Deploy (Cloudflare Workers via OpenNext)

Config: `wrangler.jsonc`, `open-next.config.ts`. Commands: `npm run preview` (local, Workers runtime), `npm run deploy`, `npm run upload` (new version, not promoted).
Worker size (2026-11-12): about 1.6 MiB compressed (Free plan limit 3 MiB; Workers Paid 10 MiB).

## First deploy
1. `npx wrangler login` (company Cloudflare account).
2. Make sure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (they are inlined at build time).
3. `npm run deploy`. It prints the `https://turf-app.<subdomain>.workers.dev` URL.
4. Supabase dashboard -> Authentication -> URL Configuration: set Site URL and add the `*.workers.dev` URL to Redirect URLs (later the custom domain). Keep `http://localhost:3000`.
5. Server secrets (from Sprint 4): `npx wrangler secret put <NAME>` (names in `docs/ARCHITECTURE.md`). Locally put them in `.dev.vars`.

## Auto deploy (optional): Workers Builds
Cloudflare dashboard -> Workers & Pages -> turf-app -> Settings -> Builds -> connect the GitHub repo.
- Production branch: `main`. Non-production branch builds: on (each gets a preview URL).
- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx wrangler deploy` (non-main branches: `npx wrangler versions upload`)
- Build variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Add each preview URL pattern (`https://*-turf-app.<subdomain>.workers.dev`) to Supabase Redirect URLs if you test login on previews.

## Phone test
Open the URL in Android Chrome -> log in with the email code -> menu -> "Install app" / "Add to Home Screen". Check the icon and that it opens full screen. No service worker exists yet; if one is added, serve `/sw.js` from the root with `Cache-Control: no-cache`.

## Cloudflare Tunnel (instead of ngrok)
Install: `brew install cloudflared`.
- Quick test: `npm run dev`, then `cloudflared tunnel --url http://localhost:3000`. It prints a temporary `https://*.trycloudflare.com` link (changes each run).
- Named tunnel for Sprint 4 webhooks (Razorpay, WhatsApp) on a fixed name like `dev-turf.<our-domain>` (domain must be on Cloudflare DNS):
  1. `cloudflared tunnel login`
  2. `cloudflared tunnel create turf-dev`
  3. `cloudflared tunnel route dns turf-dev dev-turf.<our-domain>`
  4. Create `~/.cloudflared/config.yml` with `tunnel: turf-dev`, `credentials-file: ~/.cloudflared/<id>.json` and an ingress rule `hostname: dev-turf.<our-domain>`, `service: http://localhost:3000`, plus a final `service: http_status:404`.
  5. `cloudflared tunnel run turf-dev` while `npm run dev` runs. Use `https://dev-turf.<our-domain>/api/...` as the webhook URL.
