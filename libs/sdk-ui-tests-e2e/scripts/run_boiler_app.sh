#!/bin/bash
# (C) 2023 GoodData Corporation
set -e

echo "Actual working directory: $(pwd)"

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))

source $DIR/../../../common/scripts/ci/utils.sh

trap "npm run delete-ref-workspace || true" EXIT

npm run create-ref-workspace
export TEST_WORKSPACE_ID=$(grep TEST_WORKSPACE_ID .env | cut -d '=' -f 2)

#create folder .npm-global/lib as workaround for npm install issue
#because npm config prefix is somehow set to /home/cypressuser/.npm-global
mkdir -p /home/cypressuser/.npm-global/lib

echo "BOILER_APP_VERSION: $BOILER_APP_VERSION"

if [ "$BOILER_APP_VERSION" == "app-toolkit@latest" ]; then
    echo "Testing app-toolkit@latest from workspace"
    node $DIR/../../../tools/app-toolkit/esm/index.js init $BOILER_APP_NAME --language $SDK_LANG
else
    echo "Testing $BOILER_APP_VERSION via npx"
    npx --yes @gooddata/$BOILER_APP_VERSION init $BOILER_APP_NAME --language $SDK_LANG
fi

sed -i -E 's#"hostname": *"[^"]*"#"hostname": "'${HOST}'"#g' $BOILER_APP_NAME/package.json
# Then replace the workspaceId
sed -i -E 's#"workspaceId": *"[^"]*"#"workspaceId": "'${TEST_WORKSPACE_ID}'"#g' $BOILER_APP_NAME/package.json

export TIGER_API_TOKEN=${TIGER_API_TOKEN:?}

sed -i 's/ProductCategoriesPieChart/Headline/g' $BOILER_APP_NAME/src/App.${SDK_LANG}x

npm run --prefix $BOILER_APP_NAME refresh-md
npm run --prefix $BOILER_APP_NAME start &

# Check if curl is installed and install it if not
if ! command -v curl &> /dev/null; then
    echo "curl is not installed. Installing curl..."
    apt-get update -y && apt-get install -y curl
fi

if ! health_check $BOILER_APP_HOST; then
    log "Can't run test, Boiler app are not ready"
    exit 1
fi

#start cypress against the running boilder app
export CYPRESS_HOST=$BOILER_APP_HOST

npm run run-integrated
npm run delete-ref-workspace
