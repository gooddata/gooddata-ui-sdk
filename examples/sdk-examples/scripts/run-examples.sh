#!/usr/bin/env bash

PARAMS=$@
if [ ! -z "$1" ]; then # if first argument is not empty
    PARAMS="--env backend=$1 ${@:2}"
fi


echo "$ webpack serve --hot --server-type https $PARAMS"
webpack serve --hot --server-type https $PARAMS
