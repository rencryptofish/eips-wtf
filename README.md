# eips.wtf

[eips.wtf](https://www.eips.wtf) is a static explorer for Ethereum Improvement
Proposal activity, Last Call deadlines, and repository changes.

## Architecture

The site has no database and no request-time data API:

```text
ethereum/EIPs + ethereum/ERCs
              │
              ▼
    Daily GitHub Actions workflow
              │
              ├─ clones both repositories into temporary runner storage
              ├─ parses current proposal front matter
              ├─ aggregates Git history by month and category
              └─ commits frontend/data/eips.json
              │
              ▼
       Railway Docker deployment
              │
              ├─ regenerates and validates the current snapshot
              ├─ prerenders the React + Vite application
              └─ serves the static build with Caddy
              ▼
          https://www.eips.wtf
```

The generated snapshot is checked into the repository as a development fallback. A
daily GitHub Actions job refreshes that snapshot, and its commit triggers Railway's
GitHub autodeploy. Every Railway image build also regenerates and validates the data,
prerenders each route to static HTML, and packages the result in a small Caddy image.
React hydrates the deployed pages for search and chart interaction. Visitors never
wait on an API, and there are no runtime credentials or database connections.

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
health check. No Railway variables, database, volume, or custom start command are
required.

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

Railway autodeploys every push to `main`. The
[`refresh-data.yml`](.github/workflows/refresh-data.yml) workflow runs daily shortly
after 06:17 UTC, commits a fresh fallback snapshot, and thereby triggers a current
Railway deployment. It can also be run manually from the repository's Actions tab.

To exercise the same production image locally:

```bash
docker build -t eips-wtf .
docker run --rm -p 3000:3000 -e PORT=3000 eips-wtf
```

Then open <http://localhost:3000>.
