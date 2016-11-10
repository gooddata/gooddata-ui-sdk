#!/bin/bash -x

. $(dirname $0)/lib.sh

echo "Running tests with Karma..."

PATH=$PATH:/opt/npm/node_modules/.bin:./node_modules/.bin
export CHROME_BIN="/usr/bin/chromium-browser"

test_opts="--browser=Chrome"

coverage=0

if [[ $1 = "-c" ]]; then
    echo "Coverage enabled."
    coverage=1
fi

grunt test-ci $test_opts
