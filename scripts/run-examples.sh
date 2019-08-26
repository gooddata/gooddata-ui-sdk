#!/usr/bin/env bash

echo "[react-components build] $ yarn dev"
yarn dev 2>&1 | while read line; do echo "[react-components build] $line"; done &

# wait for dist file to appear
rm -rf dist/
mkdir dist
while [ ! -f dist/index.js ]; do sleep 1; done;


echo "$ cd examples"
cd examples

PARAMS=$@
if [ ! -z "$1" ]; then # if first argument is not empty
    PARAMS="--env.backend=$1 ${@:2}"
fi


echo "$ webpack-dev-server --https $PARAMS"
webpack-dev-server --hot --https $PARAMS
