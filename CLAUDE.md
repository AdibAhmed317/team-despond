# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

The Team Despond website. The client's requirements are in `context/Team_Despond_Website_Development_Brief_*.pdf`. Read it before building features. The repo is still close to the stock TanStack Start scaffold (created with `create-tsrouter-app`; `.cta.json` records the add-ons: cloudflare, drizzle/sqlite, shadcn, better-auth).

## Commands

- `npm run dev`: dev server on port 3000 (SSR runs inside workerd through the Cloudflare Vite plugin)
- `npm run build`: production build. It also regenerates `src/routeTree.gen.ts`.
- `npm run preview`: preview the built app
- `npm run deploy`: build, then `wrangler deploy` (the worker name in `wrangler.jsonc` is still the placeholder `tanstack-start-app`)
- `npm run db:generate | db:migrate | db:push | db:pull | db:studio`: drizzle-kit. Reads `DATABASE_URL` from `.env.local`. Migrations are written to `./drizzle`.
- Type-check: `npx tsc --noEmit`

There is no test runner and no linter configured yet. The project uses npm (see `.cta.json`). A stray `bun.lock` also exists; don't let lockfiles diverge.

## Architecture

- **Routing**: TanStack Router file-based routing in `src/routes/`. `src/routeTree.gen.ts` is generated, so never edit it (it is read-only in VS Code settings). `__root.tsx` is the HTML shell (`shellComponent`). It loads `styles.css?url` and mounts TanStack devtools (dev only). The public pages sit under the pathless layout `_site.tsx` (nav and footer from `src/components/Chrome.tsx`), so their route ids are `/_site/...` while their URLs are `/`, `/work` and so on. The router is built in `src/router.tsx` (`getRouter`, preload on intent).
- **Brand**: the client's logo is `public/logo.png` (500×500 with padding); the nav and footer use the tightly cropped `public/logo-wordmark.png` (437×53). It is a raster, so it is never shown wider than 437px. The accent token (`--color-accent` in `src/tokens.css`) matches the logo red `#ef3536`.
- **Motion**: `src/components/motion.tsx` (`motion` package): `<Reveal>` for spring arrivals and `<RiseWords>` for headline reveals (`trigger="onLoad"` is CSS-only so the first paint never waits for JS). Elements Motion hides carry `data-m`; a `<noscript>` rule in `__root.tsx` shows them without JS. Page changes use native View Transitions (`defaultViewTransition` in `src/router.tsx`); a `vt` prop on `<Photo>` names a photo so it morphs between pages, and each name must be unique per page. The Work page's 3D reel (`src/components/Reel.tsx`) lazy-loads three.js, runs only on desktop with a fine pointer, WebGL2 and no reduced-motion preference, and renders only while on screen.
- **Server code**: use `createServerFn` from `@tanstack/react-start` for RPC-style calls. For HTTP endpoints, put a `server.handlers` object in a route file (for example, `src/routes/api/auth/$.ts`).
- **Runtime**: the app deploys to Cloudflare Workers (`main: @tanstack/react-start/server-entry`, `nodejs_compat`). Bindings (D1/KV/R2) and public vars go in `wrangler.jsonc`. Secrets are set with `wrangler secret put`.
- **Auth**: Better Auth with email/password (`src/lib/auth.ts`). The catch-all `/api/auth/$` route serves it, with the `tanstackStartCookies()` plugin. On the client, use `authClient` from `src/lib/auth-client.ts`. Auth has **no database adapter configured yet**, so it is stateless. Env vars: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`.
- **DB**: Drizzle + `better-sqlite3` (`src/db/index.ts`, schema in `src/db/schema.ts`, which still holds the demo `todos` table). Caveat: `better-sqlite3` is a native Node module and won't run inside the Workers runtime. A real deployed DB needs a different driver (for example, Cloudflare D1 with `drizzle-orm/d1`).
- **UI**: Tailwind v4 (configured in CSS in `src/styles.css`, no tailwind config file) plus shadcn (new-york style, zinc, lucide icons). Add components with `pnpm dlx shadcn@latest add <component>` (from `.cursorrules`); they go into `src/components/ui`. Use `cn()` from `src/lib/utils.ts` for class merging.
- **Import aliases**: `#/*` → `src/*` (package.json `imports`, used by shadcn config) and `@/*` → `src/*`. Prefer `#/`.
- TS is strict, with `noUnusedLocals`/`noUnusedParameters` and `verbatimModuleSyntax` (use `import type` for type-only imports).
