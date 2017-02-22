#!/bin/bash

echo "Validating source code..."

. $(dirname $0)/lib.sh

grunt validate --ci
