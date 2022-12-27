#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))

$DIR/run_cypress_isolated_tests.sh
