#!/bin/bash -x

echo "Running unit tests..."

. $(dirname $0)/lib.sh

PATH=$PATH:/opt/npm/node_modules/.bin:./node_modules/.bin
export CHROME_BIN="/usr/bin/chromium-browser"

grunt test-ci --ci
