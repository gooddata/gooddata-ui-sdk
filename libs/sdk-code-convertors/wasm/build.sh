#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
WASM_DIR="$SCRIPT_DIR"

JAVY_VERSION="8.0.0"
JAVY_BIN="$WASM_DIR/.bin/javy"

# Detect platform
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
case "$ARCH" in
    aarch64|arm64) ARCH="aarch64" ;;
    x86_64|amd64) ARCH="x86_64" ;;
    *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

# Install javy if missing or wrong version
if [ ! -x "$JAVY_BIN" ] || [ "$("$JAVY_BIN" --version 2>/dev/null | awk '{print $2}')" != "$JAVY_VERSION" ]; then
    echo "Installing javy $JAVY_VERSION for $OS/$ARCH..."
    mkdir -p "$WASM_DIR/.bin"
    URL="https://github.com/bytecodealliance/javy/releases/download/v${JAVY_VERSION}/javy-${ARCH}-${OS}-v${JAVY_VERSION}.gz"
    curl -LSs "$URL" | gunzip > "$JAVY_BIN"
    chmod +x "$JAVY_BIN"
    echo "Installed: $("$JAVY_BIN" --version)"
else
    echo "javy $JAVY_VERSION already installed"
fi

# Bundle into single JS file
echo "Bundling..."
cd "$PACKAGE_DIR"
npx -y "esbuild@0.25.0" wasm/entry.js \
    --bundle \
    --format=esm \
    --platform=browser \
    --outfile=wasm/bundle.js \
    --alias:crypto=./wasm/crypto-shim.js \
    --main-fields=module,main \
    --log-level=error

# Compile to WASM
echo "Compiling to WASM..."
"$JAVY_BIN" build wasm/bundle.js -o wasm/convertors.wasm

echo "Done: wasm/convertors.wasm ($(du -h wasm/convertors.wasm | cut -f1))"
