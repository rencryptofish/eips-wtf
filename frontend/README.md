# eips.wtf frontend

The frontend is a React 19 application built with Vite. Vite produces a client bundle
and a temporary SSR bundle; `scripts/prerender.mjs` uses the latter to render every
category route to static HTML, embeds only that route's data for hydration, and then
removes the temporary bundle. Cloudflare Workers Static Assets serves the generated
files; React is never rendered on the server per request.

```bash
npm ci
npm run dev
```

The development server is available at <http://localhost:5173>. It reads the checked-in
snapshot from `data/eips.json` and supports direct navigation to every category path.

Production checks and build:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
npm run preview
```

The deployable static site is written to `dist/`. Local development and production
builds require no environment variables. The root `wrangler.jsonc` preserves directory
URLs and serves `404.html` with a 404 status for unknown paths. Static response headers
live in `public/_headers`.
