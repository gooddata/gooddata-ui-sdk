#!/bin/bash
set -e

if [[ -z "${WORKSPACE_ID}" ]]; then
  npm run create-ref-workspaces
  export $(xargs < .env)
  WORKSPACE_CREATED=true
else
  echo "WORKSPACE_ID already set, skip creating new one!"
fi

# export variables for ci/cd
export NO_COLOR=1

# run the tests
npm run integrated-test-live-backend

# remove previously created workspace
if [ -n "$WORKSPACE_CREATED" ]; then
    npm run delete-ref-workspaces
fi
