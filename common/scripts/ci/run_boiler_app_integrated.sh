#!/bin/bash
# (C) 2026 GoodData Corporation
set -e

echo "Actual working directory: $(pwd)"

source ../../common/scripts/ci/utils.sh

trap "(cd ../sdk-ui-tests-reference-workspace && npm run delete-ref-workspace) || true" EXIT

# Create reference workspace (scripts moved to sdk-ui-tests-reference-workspace package)
cd ../sdk-ui-tests-reference-workspace
npm run create-ref-workspace
export TEST_WORKSPACE_ID=$(grep TEST_WORKSPACE_ID .env | cut -d "=" -f 2)
echo "Created workspace with ID: $TEST_WORKSPACE_ID"

# Go back to e2e directory and update its .env with TEST_WORKSPACE_ID
cd ../sdk-ui-tests-e2e
echo "TEST_WORKSPACE_ID=$TEST_WORKSPACE_ID" >> .env

# Create folder .npm-global/lib as workaround for npm install issue
mkdir -p /home/pwuser/.npm-global/lib || true

echo "BOILER_APP_VERSION: $BOILER_APP_VERSION"
echo "Testing $BOILER_APP_VERSION via npx"

# Create boiler app
npx --yes @gooddata/$BOILER_APP_VERSION init $BOILER_APP_NAME --language $SDK_LANG

# Configure the boiler app
sed -i -E "s#\"hostname\": *\"[^\"]*\"#\"hostname\": \"${HOST}\"#g" $BOILER_APP_NAME/package.json
sed -i -E "s#\"workspaceId\": *\"[^\"]*\"#\"workspaceId\": \"${TEST_WORKSPACE_ID}\"#g" $BOILER_APP_NAME/package.json

# Change component to Headline for testing
sed -i "s/ProductCategoriesPieChart/Headline/g" $BOILER_APP_NAME/src/App.${SDK_LANG}x

# Refresh metadata and start the app
npm run --prefix $BOILER_APP_NAME refresh-md
npm run --prefix $BOILER_APP_NAME start &

# Wait for app to be ready
if ! health_check $BOILER_APP_HOST; then
    log "Cannot run test, Boiler app is not ready"
    exit 1
fi

# Run Playwright tests
export BASE_URL=$BOILER_APP_HOST
if [ -n "$FILTER" ]; then
  npx playwright test --config ./playwright/playwright.config.ts --grep "@checklist_integrated_boiler_tiger" $(echo "$FILTER" | tr "," " ");
else
  npx playwright test --config ./playwright/playwright.config.ts --grep "@checklist_integrated_boiler_tiger";
fi

# Cleanup workspace (scripts moved to sdk-ui-tests-reference-workspace package)
cd ../sdk-ui-tests-reference-workspace
npm run delete-ref-workspace
