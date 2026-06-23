#!/usr/bin/env bash
# (C) 2026 GoodData Corporation
#
# Local e2e test runner for sdk-ui-tests-e2e.
# Self-contained — does not depend on tooling outside sdk/.
#
# Usage: run.sh <test_type> [mode] [--ui] [--headed]
#   test_type:   isolated | integrated
#   mode:        replay | record | proxy  (only for isolated)
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

TEST_TYPE="${1:?Error: missing test type (isolated|integrated)}"
shift
if [[ "$TEST_TYPE" != "isolated" && "$TEST_TYPE" != "integrated" ]]; then
    echo "Error: test type must be 'isolated' or 'integrated', got '${TEST_TYPE}'" >&2
    exit 1
fi

MODE=""
if [[ "$TEST_TYPE" == "isolated" ]]; then
    MODE="${1:-}"
    if [[ -n "$MODE" ]]; then
        shift
        if [[ "$MODE" != "replay" && "$MODE" != "record" && "$MODE" != "proxy" ]]; then
            echo "Error: mode must be 'replay', 'record', or 'proxy', got '${MODE}'" >&2
            exit 1
        fi
    fi
elif [[ -n "${1:-}" && "${1:-}" != --* ]]; then
    echo "Error: mode is only valid for isolated test type, got '${1}'" >&2
    exit 1
fi

if [[ "$TEST_TYPE" == "isolated" ]]; then
    PLAYWRIGHT_GREP="@pre-merge-isolated"
else
    while true; do
        PLAYWRIGHT_GREP=""
        if [[ -f .env ]]; then
            PLAYWRIGHT_GREP=$(grep -E '^PLAYWRIGHT_GREP=' .env | head -1 | cut -d= -f2- || true)
        fi
        if [[ -n "$PLAYWRIGHT_GREP" ]]; then
            break
        fi
        read -rp "Please set PLAYWRIGHT_GREP in .env (e.g. @pre-merge-integrated), press Enter to retry..."
    done
fi

# Parse optional flags (passed after -- from npm run)
PLAYWRIGHT_FLAGS=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        --ui) PLAYWRIGHT_FLAGS+=(--ui); shift ;;
        --headed) PLAYWRIGHT_FLAGS+=(--headed); shift ;;
        *) echo "Error: unknown flag '${1}'. Supported: --ui, --headed" >&2; exit 1 ;;
    esac
done

PLAYWRIGHT_ENV=()
if [[ "$TEST_TYPE" == "isolated" && "$MODE" != "proxy" ]]; then
    PLAYWRIGHT_ENV+=(GOODMOCK_HOST=localhost:8080)
fi
if [[ -n "$MODE" ]]; then
    PLAYWRIGHT_ENV+=(GOODMOCK_MODE="$MODE")
fi

# The scenarios app runs on port 9600
SCENARIOS_PORT=9600
SCENARIOS_URL="http://localhost:${SCENARIOS_PORT}"

if [[ "$TEST_TYPE" == "integrated" ]]; then
    if [[ ! -f .env ]]; then
        echo "Error: .env file not found. Required for integrated tests." >&2
        exit 1
    fi
    ENV_BASE_URL=$(grep -E '^HOST=' .env | head -1 | cut -d= -f2- || true)
    if [[ -z "$ENV_BASE_URL" ]]; then
        echo "Error: HOST is not set in .env" >&2
        exit 1
    fi
    PLAYWRIGHT_ENV+=(BASE_URL="$ENV_BASE_URL")
    DEV_URL="$ENV_BASE_URL"
else
    PLAYWRIGHT_ENV+=(BASE_URL="$SCENARIOS_URL")
    DEV_URL="$SCENARIOS_URL"
fi

while ! curl -sSf -o /dev/null "$DEV_URL" 2>/dev/null; do
    read -rp "Please ensure the scenarios app is running on port ${SCENARIOS_PORT} (npm run start in sdk-ui-tests-app), press Enter to retry..."
done

if [[ "$TEST_TYPE" == "isolated" && ("$MODE" == "replay" || "$MODE" == "record") ]]; then
    ./scripts/install-goodmock-latest.sh
    if [[ "$MODE" == "replay" ]]; then
        RECORDINGS_WS_ID=c76e0537d0614abb0027f7c992656b964922506f
        read -rp "Please ensure the scenarios app's .env has BACKEND_URL=http://localhost:8080 and TEST_WORKSPACE_ID=${RECORDINGS_WS_ID}. Press Enter to continue..."
    else
        read -rp "Please ensure the scenarios app's .env has BACKEND_URL=http://localhost:8080 (goodmock). Press Enter to continue..."
    fi

    GOODMOCK_ENV=()
    if [[ "$MODE" == "replay" ]]; then
        GOODMOCK_ENV+=(REFERER_PATH=/dashboards/ BINARY_CONTENT_TYPES=application/x-protobuf,binary/octet-stream)
    elif [[ "$MODE" == "record" ]]; then
        GOODMOCK_ENV+=(BINARY_CONTENT_TYPES=application/x-protobuf,binary/octet-stream)
    fi

    if [[ "$MODE" == "record" ]]; then
        while true; do
            PROXY_HOST=""
            if [[ -f .env ]]; then
                PROXY_HOST=$(grep -E '^HOST=' .env | head -1 | cut -d= -f2- || true)
            fi
            if [[ -n "$PROXY_HOST" && "$PROXY_HOST" =~ ^https?:// ]]; then
                break
            fi
            read -rp "Please set HOST in .env (e.g. https://staging-automation.staging-ui.stg11.panther.intgdc.com), press Enter to continue..."
        done
        GOODMOCK_ENV+=(PROXY_HOST="$PROXY_HOST")

        while true; do
            TIGER_API_TOKEN=""
            if [[ -f .env ]]; then
                TIGER_API_TOKEN=$(grep -E '^TIGER_API_TOKEN=' .env | head -1 | cut -d= -f2- || true)
            fi
            if [[ -n "$TIGER_API_TOKEN" ]]; then
                break
            fi
            read -rp "Please add TIGER_API_TOKEN to .env (required for record mode), press Enter to continue..."
        done
        PLAYWRIGHT_ENV+=(TIGER_API_TOKEN="$TIGER_API_TOKEN")
    fi

    env ${GOODMOCK_ENV[@]+"${GOODMOCK_ENV[@]}"} ./scripts/.bin/goodmock "$MODE" &
    GOODMOCK_PID=$!
    trap 'kill $GOODMOCK_PID 2>/dev/null' EXIT
fi

# For isolated:proxy, isolated:record, and integrated, we need workspace IDs from .env
if [[ "$TEST_TYPE" == "integrated" || "$MODE" == "proxy" || "$MODE" == "record" ]]; then
    if [[ ! -f .env ]]; then
        echo "Error: .env file not found. Create one from .env.template with HOST and TIGER_API_TOKEN." >&2
        exit 1
    fi

    set -a
    source .env
    set +a

    if [[ -z "${HOST:-}" ]]; then
        echo "Error: HOST is not set in .env" >&2
        exit 1
    fi
    if [[ -z "${TIGER_API_TOKEN:-}" ]]; then
        echo "Error: TIGER_API_TOKEN is not set in .env" >&2
        exit 1
    fi

    if [[ -z "${TEST_WORKSPACE_ID:-}" ]]; then
        echo "Error: TEST_WORKSPACE_ID is not set in .env." >&2
        exit 1
    fi

    if [[ "$MODE" == "proxy" ]]; then
        read -rp "Please ensure the scenarios app's .env has BACKEND_URL=${HOST}. Press Enter to continue..."
    fi
fi

npx playwright install
env ${PLAYWRIGHT_ENV[@]+"${PLAYWRIGHT_ENV[@]}"} npx playwright test --config ./playwright/playwright.config.ts --grep "$PLAYWRIGHT_GREP" ${PLAYWRIGHT_FLAGS[@]+"${PLAYWRIGHT_FLAGS[@]}"}
