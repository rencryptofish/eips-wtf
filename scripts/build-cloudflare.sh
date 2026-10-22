#!/bin/sh

set -eu

cd "$(dirname "$0")/.."

npm run test:refresh

python3 -m venv .venv
.venv/bin/python -m pip install --disable-pip-version-check --requirement scripts/requirements.txt
.venv/bin/python -m unittest scripts/test_generate_data.py
.venv/bin/python scripts/generate_data.py

npm --prefix frontend ci --no-audit --no-fund
npm --prefix frontend run check
