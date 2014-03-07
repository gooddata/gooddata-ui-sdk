#!/bin/bash

. $(dirname $0)/lib.sh
setupGrunt

# check whether a distribution can be built
grunt dist

# Check the dist size (cheap after 'dist')
grunt dist_check
