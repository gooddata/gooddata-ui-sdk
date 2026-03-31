#!/usr/bin/env bash
# (C) 2025-2026 GoodData Corporation
#
# Installs the latest reference-workspace-cli binary into scripts/.bin if not already up to date.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI="${SCRIPT_DIR}/.bin/reference-workspace-cli"
INSTALL_URL="https://raw.githubusercontent.com/gooddata/gdc-reference-workspace-cli/master/install.sh"
GH_TOKEN=$(gh auth token)
GITHUB_API="https://api.github.com/repos/gooddata/gdc-reference-workspace-cli/releases/latest"

get_latest_version() {
    curl -sSL "$GITHUB_API" -H "Authorization: token $GH_TOKEN" \
        | grep '"tag_name"' | head -1 | sed 's/.*"tag_name": *"//;s/".*//'
}

install_cli() {
    echo "Installing reference-workspace-cli to ${SCRIPT_DIR}/.bin..."
    curl -sS -H 'Cache-Control: no-cache' -H "Authorization: token $GH_TOKEN" "$INSTALL_URL" | BINDIR="${SCRIPT_DIR}/.bin" bash
}

latest_version=$(get_latest_version)
if [ -z "$latest_version" ]; then
    echo "error: could not determine latest reference-workspace-cli version" >&2
    exit 1
fi

if [ -x "$CLI" ]; then
    current_version="v$("$CLI" -v)"
    if [ "$current_version" = "$latest_version" ]; then
        echo "reference-workspace-cli is already up to date (${current_version})"
        exit 0
    fi
    echo "reference-workspace-cli outdated: ${current_version} -> ${latest_version}"
fi

install_cli
