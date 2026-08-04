#!/bin/sh

set -eu

: "${RAILWAY_TOKEN:?Create a Railway project token and add it to this service}"
: "${RAILWAY_WEB_SERVICE:?Set this to the web service name or ID}"
: "${RAILWAY_PROJECT_ID:?Railway must provide RAILWAY_PROJECT_ID}"
: "${RAILWAY_ENVIRONMENT_ID:?Railway must provide RAILWAY_ENVIRONMENT_ID}"

echo "Requesting a fresh source deployment for ${RAILWAY_WEB_SERVICE}."

railway redeploy \
  --project "${RAILWAY_PROJECT_ID}" \
  --environment "${RAILWAY_ENVIRONMENT_ID}" \
  --service "${RAILWAY_WEB_SERVICE}" \
  --from-source \
  --yes
