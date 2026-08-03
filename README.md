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
              └─ writes frontend/data/eips.json
              │
              ▼
       React + Vite static-site generation
              │
              ▼
             GitHub Pages
```

The generated snapshot is checked into the repository as a development/build
fallback. GitHub Actions generates a fresh snapshot and deploys the pre-rendered site
once a day, on every push to `main`, or when the workflow is run manually. Generated
data is published in the Pages artifact, and the Sunday run also updates the
checked-in fallback snapshot. Every route is static HTML that React hydrates for
search and chart interaction. Visitors never wait on an API, and there are no runtime
credentials or database connections.

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
and removes that temporary renderer after producing the static pages.

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

[`pages.yml`](.github/workflows/pages.yml) installs the locked dependencies, validates
the data generator, creates a current snapshot, runs the frontend checks, and deploys
`frontend/dist/` to GitHub Pages. The daily schedule runs shortly after 06:17 UTC;
pushes to `main` and manual workflow dispatches also deploy immediately. Sunday's run
commits the generated snapshot so GitHub does not disable the schedule after 60 days
of repository inactivity.

In the repository's **Settings > Pages**, choose **GitHub Actions** as the source and
set the custom domain to `www.eips.wtf`. Point the Cloudflare `www` CNAME to
`rencryptofish.github.io`; keep the apex redirect to `https://www.eips.wtf`. GitHub
Pages provisions the HTTPS certificate after the DNS change is visible.
