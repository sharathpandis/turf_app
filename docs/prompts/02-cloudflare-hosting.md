# Change set 02 — Hosting on Cloudflare Workers (S1.6) + Cloudflare Tunnel for local testing

Decision: host the Next.js app on Cloudflare Workers using the OpenNext adapter
(`@opennextjs/cloudflare`) instead of Vercel. Our team already uses Cloudflare; it allows
commercial use and is low cost. Supabase stays the backend. Plan first and wait for my OK.

## 1. Set up OpenNext for Cloudflare (existing Next.js 16 app)

- Add dev dependencies: `@opennextjs/cloudflare` and `wrangler` (latest stable).
- Add `wrangler.jsonc`: worker name `turf-app`, Node.js runtime (NOT Edge), `nodejs_compat`
  compatibility flag, a recent compatibility date, static assets binding for `.open-next/assets`,
  `preview_urls` enabled so non-main branches get preview links.
- Add `open-next.config.ts` with the defaults. No R2 / KV caches for now (the app is mostly dynamic).
- `package.json` scripts: `preview` (build + run locally in the Workers runtime), `deploy`
  (build + deploy), `upload` (new version without promoting), `cf-typegen`.
  Keep `dev`, `build`, `lint` as they are; `npm run dev` stays the normal local workflow.
- `.gitignore`: `.open-next/`, `.wrangler/`, `.dev.vars`.
- Check `next.config.ts` (`cacheComponents`, `partialPrefetching`, Turbopack CSS rule) works with
  OpenNext. Change only what is required and explain why.

## 2. proxy.ts (login guard) — check carefully

OpenNext does not support Node.js middleware yet, and Next.js 16 `proxy.ts` runs on Node.js.
1. Run `npm run preview` and test: logged-out user opening an owner page -> redirected to /login;
   login works; session stays after refresh and after 1 hour.
2. If proxy.ts does not run on Workers, propose the safest replacement and implement it:
   e.g. a server-side guard in `app/(owner)/layout.tsx` (Supabase `getUser()` + redirect) and
   session refresh where cookies can be written. Keep `lib/auth` / `lib/supabase` as the only
   places that call Supabase auth. Login must behave the same as today.

## 3. Environment variables and secrets

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are inlined at build time:
  make sure the build reads them (local `.env.local`, and Cloudflare build variables for
  Git-connected builds).
- Server-only secrets (later: Supabase secret key, Razorpay keys, WhatsApp token) go in Cloudflare
  secrets (`wrangler secret put`) and `.dev.vars` locally. Never commit them.
- Add a short "Environment variables" table to `docs/ARCHITECTURE.md` (names only, where each is set).

## 4. Deploy setup (I run the commands myself)

- Write the exact steps in `docs/DEPLOY.md`:
  1. `npx wrangler login` with the company Cloudflare account.
  2. First deploy: `npm run deploy`.
  3. Optional: connect the GitHub repo in Cloudflare (Workers Builds) so pushes to `main` deploy
     automatically and other branches get preview URLs; list the build command and build variables.
  4. Supabase -> Authentication -> URL Configuration: add the `*.workers.dev` URL (and later the
     custom domain) to Site URL / Redirect URLs, keep `http://localhost:3000`.
  5. Phone test: open the URL in Android Chrome -> log in -> "Install app" / "Add to Home Screen".
- PWA: check the manifest is served correctly on Workers and icons load. If a service worker exists
  or is added later, `/sw.js` must be served from the root with no long caching.

## 5. Cloudflare Tunnel for local testing (instead of ngrok)

Document in `docs/DEPLOY.md` (no code needed now):
- Quick test: `cloudflared tunnel --url http://localhost:3000` (temporary HTTPS link).
- For Sprint 4 webhooks (Razorpay, WhatsApp): a named tunnel on a fixed subdomain of our domain
  (e.g. `dev-turf.<our-domain>`), so webhook URLs don't change. Steps only; I'll create it.

## 6. Checks before you finish

- `npm run lint`, `npm run build`, and `npm run preview` all succeed.
- Report the compressed worker size (limit: 3 MiB Free plan, 10 MiB Workers Paid). If over 3 MiB,
  tell me; we'll use Workers Paid ($5/month) rather than cut features.
- Login + owner pages work in `npm run preview`.

## 7. Docs

- `CLAUDE.md`: Hosting = Cloudflare Workers via OpenNext; add the preview/deploy commands; rule:
  test risky changes with `npm run preview` (Workers runtime), not only `npm run dev`.
- `docs/dev-plan.md`: S1.6 text -> Cloudflare Workers (OpenNext), preview URLs per branch;
  "How we work" section: replace Vercel preview wording; S6.3 production setup and the blockers
  table: Vercel -> Cloudflare (Workers Paid if needed). Add a Change log line.
- `docs/ARCHITECTURE.md`, `README.md`, `docs/requirements.md` (tech stack): Vercel -> Cloudflare.
- `docs/PROGRESS.md`: decision with today's date.
- Do NOT tick S1.6 yet; I'll tick it after the phone test.

## 8. Output

Plan first. After I approve and you finish: files changed, worker size, preview test result,
the exact commands I need to run to deploy, and a one-line commit message. Don't commit; I will.
