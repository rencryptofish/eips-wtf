# eips.wtf

[eips.wtf](https://www.eips.wtf) is a static explorer for Ethereum Improvement
Proposal activity, Last Call deadlines, and repository changes.

## Architecture

The site has no database and no request-time data API:

```text
Daily Cloudflare Cron Trigger (06:17 UTC)
              │
              ▼
       eips-wtf-refresh Worker
              │
              └─ POSTs to a secret Workers Builds deploy hook
              │
              ▼
       Cloudflare Workers Builds
              │
              ├─ clones ethereum/EIPs and ethereum/ERCs
              ├─ aggregates and validates the current snapshot
              ├─ checks and prerenders the React + Vite application
              └─ publishes frontend/dist to Workers Static Assets
              ▼
          https://www.eips.wtf
```

Cloudflare also rebuilds on pushes to `main`. The generated snapshot is checked in
as a development fallback; every production build regenerates it from upstream.
React hydrates the deployed pages for search and chart interaction. Visitors receive
static files without invoking a Worker script. A separate Worker only runs once a
day to request a rebuild; it has no public HTTP endpoint.

## Local development

Requirements: Git, Python 3.13, Node.js 22+, and npm. Version files at the repository
root select Python and Node.js for Cloudflare's build image.

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r scripts/requirements.txt
.venv/bin/python scripts/generate_data.py

npm --prefix frontend ci
make dev
```

Open <http://localhost:5173>. No `.env` values are required. Data generation is
optional when working from the checked-in snapshot.

Useful frontend checks:

```bash
npm --prefix frontend run format:check
npm --prefix frontend run check
```

To run the complete production pipeline, including fresh upstream data:

```bash
npm ci
npm run build
```

The build script creates a Python virtual environment, installs the locked frontend
dependencies, tests the generator and refresh Worker, regenerates the snapshot, runs
lint and typechecking, and prerenders the site into `frontend/dist/`.

To serve that build using Cloudflare's local runtime:

```bash
npm run preview
```

## Data generation

[`scripts/generate_data.py`](scripts/generate_data.py) uses filtered, full-history
Git clones in a temporary directory. It emits:

- the 50 newest changes for the overall feed and for every category;
- proposal changes and unique Git contributors aggregated across complete months;
- current proposals in Last Call;
- the exact source commit for both upstream repositories.

The generator refuses to overwrite the snapshot if its basic data sanity checks
fail. The current month is excluded from the trend because comparing a partial month
with complete months would imply a false decline. ERC activity before the October 2023
repository split is reconstructed from the EIPs history; the one-time migration import
is excluded so it cannot appear as proposal work.

## Cloudflare deployment

[`wrangler.jsonc`](wrangler.jsonc) deploys the `eips-wtf` Worker as static assets,
with directory URLs and a real 404 page. [`frontend/public/_headers`](frontend/public/_headers)
preserves security headers, gives hashed assets a year-long immutable cache, and
requires browsers to revalidate HTML after a deployment.

The Cloudflare Workers and Pages GitHub app must include `rencryptofish/eips-wtf`
in its selected repositories to receive push events and run builds. Connect that
repository to the Worker under **Settings > Build**, with:

| Setting           | Value                  |
| ----------------- | ---------------------- |
| Production branch | `main`                 |
| Root directory    | `/`                    |
| Build command     | `npm run build`        |
| Deploy command    | `npm run deploy`       |
| Preview command   | `npx wrangler preview` |

Cloudflare installs the root npm dependencies automatically. The build script
installs the frontend dependencies. No build secrets are needed by the site.

For a manual deployment using an authenticated Cloudflare account:

```bash
npm ci
npm run build
npm run deploy
```

The `www.eips.wtf` custom domain is tracked in `wrangler.jsonc`. The `workers.dev`
hostname remains available for verification. The apex redirects to
`https://www.eips.wtf` through the existing Cloudflare rule.

## Daily refresh

1. In the `eips-wtf` Worker's **Settings > Build > Deploy Hooks**, create a hook
   named `daily-refresh` for `main`.
2. Save the hook URL as a secret on the scheduler Worker:

   ```bash
   npx wrangler secret put DEPLOY_HOOK_URL --config deploy/refresh/wrangler.jsonc
   ```

3. Deploy the scheduler:

   ```bash
   npm run deploy:refresh
   ```

[`deploy/refresh/wrangler.jsonc`](deploy/refresh/wrangler.jsonc) schedules
`17 6 * * *` (06:17 UTC daily). The scheduler requests a rebuild and exits. A failed
build leaves the previous site deployment live. Keep the deploy hook URL secret:
anyone with it can trigger a build. It must never be checked in or placed in the
frontend bundle.

Run its failure-handling checks with `npm run test:refresh`.

## Cost

Use the **Workers Free** plan. Static asset requests are free and unlimited, and the
daily scheduler uses one invocation per day. Workers Builds includes 3,000 minutes
per month on Free; each build must complete within 20 minutes. This setup uses no
paid database, storage product, container, or Workers subscription. Domain renewal
is separate.

- [Static asset pricing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Build limits](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)
