#!/bin/bash

#
# Rush install runs into trouble when depending on packages that specify 'bin' script and this script does not
# exist at install/link time; rush tries to link the script to node_modules/.bin dir of the dependant package.
#
# However as is often the case, the script in package JSON's 'bin' dir is not immediately present after the
# repo is cloned. It is a result of build - and thus chicken-egg problem happens.
#
# We run into this problem with our plugin-toolkit CLI tool; which is depended on by dashboard template. In order
# to get out of the deadlock, this script is registered as preInstall hook. Its goal is to verify whether
# the catalog export's CLI entry point exists. If not, it will create an empty file and the rush install / link
# will work.
#
# The subsequent build / rebuild will then overwrite the dummy file and everything will be on track.
#

FILE="tools/plugin-toolkit/esm/index.js"
DIR=`dirname ${FILE}`

if [ ! -f ${FILE} ]; then
  mkdir -p ${DIR}
  cat >${FILE} << EOF
#!/usr/bin/env node
console.error("You are calling dummy-garage bootstrapped version of gdc-plugins tool; this was created by bootstrap-plugin-toolkit preInstall hook - in order for rush link to work. Please run rush rebuild.");
EOF
fi
