#!/bin/bash
set -ex

BUILD_IMAGE='020413372491.dkr.ecr.us-east-1.amazonaws.com/tools/gdc-frontend-node-16:node-16.13.0-yarn-1.22.17'

export $(grep -v '^#' .env | xargs -0)

docker run -e USERID="$(id -u "$USER")" \
  -e SDK_BACKEND=TIGER \
  -e HOST="$TEST_BACKEND" \
  -e TIGER_API_TOKEN="$TIGER_API_TOKEN" \
  -e TEST_WORKSPACE_ID="$TEST_WORKSPACE_ID" \
  -w /workspace/test_new \
  -v "$(pwd)":/workspace \
  $BUILD_IMAGE yarn delete-ref-workspace
