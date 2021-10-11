#!/usr/bin/env bash
if test -z "$WDYR"
then
    WDYR="false"
fi

PARAMS=$@
if [ ! -z "$1" ]; then # if first argument is not empty
    PARAMS="--env backend=$1 ${@:2} wdyr=$WDYR"
fi

echo "why-did-you-render enabled: $WDYR"

echo "$ webpack serve --https $PARAMS"
webpack serve --hot --https $PARAMS
