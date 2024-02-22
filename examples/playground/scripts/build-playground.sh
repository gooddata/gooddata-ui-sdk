#!/usr/bin/env bash
set -e

PARAMS=$@
if [ ! -z "$1" ]; then # if first argument is not empty
    PARAMS="--env.backend=$1 ${@:2}"
fi

echo "$ NODE_ENV=production webpack --mode=production $PARAMS"
NODE_ENV=production webpack --mode=production $PARAMS
