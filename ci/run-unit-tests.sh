#!/bin/bash -x

echo "Running phantomjs processes:"
ps -elf | grep [p]hantomjs

. $(dirname $0)/lib.sh
setupGrunt

echo "Running tests with Karma..."

PATH=$PATH:/opt/npm/node_modules/.bin:./node_modules/.bin

test_opts="--mode=ci --browser=PhantomJS"

coverage=0

if [[ $1 = "-c" ]]; then
    echo "Coverage enabled."
    test_opts="$test_opts --coverage"
    coverage=1
fi

grunt test $test_opts

if [[ $coverage -eq 1 ]]; then
	find coverage -name cobertura-coverage.xml -exec mv '{}' coverage.xml \;
fi
