# syntax=docker/dockerfile:1

# Build a fresh proposal snapshot from the upstream EIPs and ERCs repositories.
FROM python:3.13-slim AS data

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

COPY scripts/requirements.txt scripts/requirements.txt
RUN pip install --no-cache-dir --requirement scripts/requirements.txt

COPY scripts/ scripts/
ARG RAILWAY_DEPLOYMENT_ID=local
RUN echo "Generating snapshot for deployment ${RAILWAY_DEPLOYMENT_ID}" \
    && python -m unittest scripts/test_generate_data.py \
    && python scripts/generate_data.py

# Validate and prerender the React application with the generated snapshot.
FROM node:22-alpine AS frontend

ENV NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
COPY --from=data /app/frontend/data/eips.json ./data/eips.json
RUN npm run check

# Serve the immutable static build from a small production web server.
FROM caddy:2-alpine AS runtime

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=frontend /app/frontend/dist /srv

EXPOSE 3000
