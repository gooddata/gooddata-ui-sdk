#!/bin/bash

. $(dirname $0)/lib.sh
setupGrunt

grunt validate
