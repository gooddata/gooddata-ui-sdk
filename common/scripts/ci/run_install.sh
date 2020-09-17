#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
ROOT_DIR=${DIR}/../../..

NPMRC_AUTH=$(echo -n "jenkins-user:${JENKINS_USER_PASSWORD}" | base64)
NPMRC_CONTENT="registry=https://sonatype-nexus.intgdc.com/repository/registry.npmjs.org/\n
email=jenkins@gooddata.com\n
always-auth=false\n
strict-ssl=false\n
"

RUSH_NPMRC="${ROOT_DIR}/common/config/rush/.npmrc"
ROOT_NPMRC="${ROOT_DIR}/.npmrc"

echo -e $NPMRC_CONTENT >${RUSH_NPMRC}
echo -e $NPMRC_CONTENT >${ROOT_NPMRC}
echo "_auth=${NPMRC_AUTH}" >>${ROOT_NPMRC}

_RUSH="${DIR}/docker_rush.sh"
$_RUSH install --network-concurrency 200
