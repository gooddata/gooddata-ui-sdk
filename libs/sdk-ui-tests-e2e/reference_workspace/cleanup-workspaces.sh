#!/bin/bash
set -euo pipefail

if reference-workspace-cli -v >/dev/null 2>&1; then
    echo "reference-workspace-cli already installed: $(reference-workspace-cli -v)"
else
    echo "reference-workspace-cli not found — installing"
    curl -fsSL -H "Authorization: token $GH_TOKEN" https://raw.githubusercontent.com/gooddata/gdc-reference-workspace-cli/master/install.sh | sh
fi

reference-workspace-cli cleanup \
    --prefix "E2E_SDK_cypress_test" \
    --host "$HOST" \
    --token "$TIGER_API_TOKEN"
