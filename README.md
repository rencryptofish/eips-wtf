# eips.wtf

[eips.wtf](https://www.eips.wtf) is a static explorer for Ethereum Improvement
Proposal activity, Last Call deadlines, and repository changes.

## Architecture

The site has no database and no request-time data API:

```text
ethereum/EIPs + ethereum/ERCs
              │
              ▼
       Daily Railway cron service
              │
              └─ requests a fresh web-service deployment
              │
              ▼
       Railway web-service build
              │
              ├─ clones and parses both upstream repositories
              ├─ aggregates and validates the current snapshot
              ├─ prerenders the React + Vite application
              └─ serves the static build with Caddy
              ▼
          https://www.eips.wtf
```

The generated snapshot is checked into the repository as a development fallback.
Production refreshes stay entirely inside Railway: a short-lived cron service asks
Railway to rebuild the persistent web service from its configured source once a day.
Every web image build regenerates and validates the data, prerenders each route to
static HTML, and packages the result in a small Caddy image. React hydrates the
deployed pages for search and chart interaction. Visitors never wait on an API, and
there are no runtime credentials or database connections.

## Local development

Requirements: Git, Python 3.10+, Node.js 22+, and npm.

```bash
python3 -m pip install -r scripts/requirements.txt
python3 scripts/generate_data.py

cd frontend
npm ci
npm run dev
```

Open <http://localhost:5173>. No `.env` values are required.

After installing the frontend dependencies, you can also start development mode
from the repository root:

```bash
make dev
```

Useful checks:

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

`npm run build` writes the deployable site to `frontend/dist/`. The build creates a
small Vite client bundle, temporarily renders the React application under Node.js,
and removes that temporary renderer after producing the static pages. The production
Docker image serves this directory with Caddy.

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

## Deployment

The root [`Dockerfile`](Dockerfile) is the production definition. It tests and runs
the Python generator, installs the locked frontend dependencies, runs lint and
typechecking, prerenders the site, and copies only `frontend/dist/` into the final
Caddy image. [`railway.json`](railway.json) selects the Dockerfile builder and adds a
health check. The web service needs no Railway variables, database, volume, or custom
start command.

To deploy:

1. Create a Railway project with **Deploy from GitHub repo** and select this
   repository.
2. Keep the service root directory set to `/`; Railway automatically detects the
   root `Dockerfile` and `railway.json`.
3. In the service's **Settings > Networking**, generate a Railway domain and confirm
   the deployment is healthy.
4. Add `www.eips.wtf` as a custom domain, then replace the Cloudflare `www` record
   with the CNAME target Railway provides. Keep the apex redirect to
   `https://www.eips.wtf`.
5. Once the Railway domain is serving the new site, disable the old GitHub Pages
   deployment.

Railway autodeploys the web service on every push to `main`. A second service handles
scheduled data refreshes without GitHub Actions:

1. In the same Railway project, add another service from this repository and name it
   `data-refresh`.
2. Leave its root directory at `/`, then set its **Config File Path** to
   `/railway.cron.json`. This selects [`Dockerfile.cron`](Dockerfile.cron) instead of
   the web image.
3. In **Project Settings > Tokens**, create a project token for the production
   environment. Add it to the cron service as the sealed `RAILWAY_TOKEN` variable.
4. Add `RAILWAY_WEB_SERVICE` to the cron service with the exact name or ID of the
   persistent web service.
5. Deploy the staged Railway changes. The config schedules the cron service for
   `17 6 * * *`, or shortly after 06:17 UTC every day.

The cron image runs Railway's official CLI, requests a `--from-source` deployment of
the web service, and exits. The resulting web build fetches current upstream data and
only replaces production after its health check passes. The cron service does not
need a public domain, database, or volume.

To exercise the same production image locally:

```bash
docker build -t eips-wtf .
docker run --rm -p 3000:3000 -e PORT=3000 eips-wtf
```

Then open <http://localhost:3000>.
