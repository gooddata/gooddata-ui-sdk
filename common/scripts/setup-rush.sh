#!/bin/bash
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

node "$CURRENT_DIR/install-run-rush.js" install
node "$CURRENT_DIR/install-run-rush.js" build
