#!/bin/bash
# (C) 2023 GoodData Corporation
set -e

source /workspace/common/scripts/ci/utils.sh

trap "npm run delete-ref-workspace || true" EXIT

npm run create-ref-workspace
export TEST_WORKSPACE_ID=$(grep TEST_WORKSPACE_ID .env | cut -d '=' -f 2)

#create folder .npm-global/lib as workaround for npm install issue
#because npm config prefix is somehow set to /home/cypressuser/.npm-global
mkdir -p /home/cypressuser/.npm-global/lib
npx --verbose --yes @gooddata/$BOILER_APP_VERSION init $BOILER_APP_NAME --language $SDK_LANG

tmp=$(mktemp)
jq --arg host "${HOST}" --arg ws "${TEST_WORKSPACE_ID}" \
'.gooddata.hostname = $host | .gooddata.workspaceId = $ws' \
$BOILER_APP_NAME/package.json > $tmp
mv $tmp $BOILER_APP_NAME/package.json

export TIGER_API_TOKEN=${TIGER_API_TOKEN:?}

sed -i 's/ProductCategoriesPieChart/Headline/g' $BOILER_APP_NAME/src/App.${SDK_LANG}x

npm run --prefix $BOILER_APP_NAME refresh-md
npm run --prefix $BOILER_APP_NAME start &

if ! health_check $BOILER_APP_HOST; then
    log "Can't run test, Boiler app are not ready"
    exit 1
fi

#start cypress against the running boilder app
export CYPRESS_HOST=$BOILER_APP_HOST

npm run run-integrated
npm run delete-ref-workspace
