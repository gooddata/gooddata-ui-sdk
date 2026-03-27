#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WASM_DIR="$SCRIPT_DIR"
WASM_FILE="$WASM_DIR/convertors.wasm"

WASMTIME_VERSION="30.0.2"
WASMTIME_BIN="$WASM_DIR/.bin/wasmtime"

if [ ! -f "$WASM_FILE" ]; then
    echo "ERROR: $WASM_FILE not found — run 'npm run build' first"
    exit 1
fi

# Detect platform
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
case "$ARCH" in
    aarch64|arm64) ARCH="aarch64" ;;
    x86_64|amd64) ARCH="x86_64" ;;
    *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

# Install wasmtime if missing or wrong version
if [ ! -x "$WASMTIME_BIN" ] || [ "$("$WASMTIME_BIN" --version 2>/dev/null | awk '{print $2}')" != "$WASMTIME_VERSION" ]; then
    echo "Installing wasmtime $WASMTIME_VERSION for $OS/$ARCH..."
    mkdir -p "$WASM_DIR/.bin"
    TARBALL="wasmtime-v${WASMTIME_VERSION}-${ARCH}-${OS}.tar.xz"
    URL="https://github.com/bytecodealliance/wasmtime/releases/download/v${WASMTIME_VERSION}/${TARBALL}"
    curl -LSs "$URL" | tar -xJ --strip-components=1 -C "$WASM_DIR/.bin" "wasmtime-v${WASMTIME_VERSION}-${ARCH}-${OS}/wasmtime"
    chmod +x "$WASMTIME_BIN"
    echo "Installed: $("$WASMTIME_BIN" --version)"
else
    echo "wasmtime $WASMTIME_VERSION already installed"
fi

PASS=0
FAIL=0

run_test() {
    local name="$1"
    local input="$2"
    local expected_pattern="$3"

    local output
    if ! output=$(echo "$input" | "$WASMTIME_BIN" "$WASM_FILE" 2>&1); then
        # wasmtime may exit non-zero but still produce output on stdout
        true
    fi

    if echo "$output" | grep -qE "$expected_pattern"; then
        echo "  PASS: $name"
        PASS=$((PASS + 1))
    else
        echo "  FAIL: $name"
        echo "    Input:    $input"
        echo "    Expected: $expected_pattern"
        echo "    Got:      $output"
        FAIL=$((FAIL + 1))
    fi
}

echo "Running WASM smoke tests..."
echo ""

# Test 1: valid conversion (yamlMetricToDeclarative)
run_test "yamlMetricToDeclarative returns result" \
    '{"function":"yamlMetricToDeclarative","args":["metric:\n  title: Revenue\n  format: #,##0\n  expression: SELECT {metric/order_amount}\n"]}' \
    '"result"'

# Test 2: unknown function returns error with available list
run_test "unknown function returns error" \
    '{"function":"nonExistentFunction","args":[]}' \
    '"error".*"Unknown function: nonExistentFunction"'

# Test 3: available functions listed in error response
run_test "error lists available functions" \
    '{"function":"nonExistentFunction","args":[]}' \
    '"available".*"yamlDatasetToDeclarative"'

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
    exit 1
fi
