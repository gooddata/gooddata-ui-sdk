#!/usr/bin/env bash
# (C) 2025-2026 GoodData Corporation
#
# Installs the latest goodmock binary into scripts/.bin if not already up to date.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GOODMOCK="${SCRIPT_DIR}/.bin/goodmock"
INSTALL_URL="https://raw.githubusercontent.com/gooddata/gooddata-goodmock/master/install.sh"
GITHUB_API="https://api.github.com/repos/gooddata/gooddata-goodmock/releases/latest"

get_latest_version() {
    curl -sSL "$GITHUB_API" \
        | grep '"tag_name"' | head -1 | sed 's/.*"tag_name": *"//;s/".*//'
}

install_goodmock() {
    echo "Installing goodmock to ${SCRIPT_DIR}/.bin..."
    curl -sS -H 'Cache-Control: no-cache' "$INSTALL_URL" | BINDIR="${SCRIPT_DIR}/.bin" bash
}

latest_version=$(get_latest_version)
if [ -z "$latest_version" ]; then
    echo "error: could not determine latest goodmock version" >&2
    exit 1
fi

if [ -x "$GOODMOCK" ]; then
    current_version="v$("$GOODMOCK" -v)"
    if [ "$current_version" = "$latest_version" ]; then
        echo "goodmock is already up to date (${current_version})"
        exit 0
    fi
    echo "goodmock outdated: ${current_version} -> ${latest_version}"
fi

install_goodmock
