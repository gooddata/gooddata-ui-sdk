#!/bin/bash

#
# Starts wiremock standalone as a docker container in one of the possible modes:
#
# -  interactive mode with logging to console and ability to interrupt using Ctrl-C; useful for dev testing and when
#    creating new recordings
# -  detached mode where the server is running in the background; this is useful when integrating the wiremock
#    server start into package.json scripts. starting the server like this will create .wiremock_containerid
#    with the ID of the detached container. you can then use stop_wiremock.sh to clean up.
#
# Note on the --insecure: bear api client only talks HTTPS. Wiremock talks HTTPS however uses self-signed certificate...



ROOT_DIR=$(echo $(cd $(dirname $0)/../.. && pwd -P))
TESTS_DIR="${ROOT_DIR}/tests"
WIREMOCK_DIR="${TESTS_DIR}/wiremock"
RECORDINGS_DIR="${WIREMOCK_DIR}/recordings"
CONTAINER_ID_FILE="${WIREMOCK_DIR}/.wiremock_containerid"

mode=${1:-interactive}

# macOS has no timeout available by default
# https://stackoverflow.com/a/35512328/2546338
function timeout() { perl -e 'alarm shift; exec @ARGV' "$@"; }

wait-for-url() {
    timeout 15 bash -c \
    'while [[ "$(curl -s -o /dev/null -L -w ''%{http_code}'' --insecure ${0})" != "200" ]];\
    do echo "Waiting for ${0}" && sleep 2;\
    done' ${1}

    last=$(curl -s -o /dev/null -L -w '%{http_code}' --insecure $1)
    [ $last == "200" ]
}

if [ ${mode} = "interactive" ]; then
  echo "Starting Wiremock in interactive mode; recordings in ${RECORDINGS_DIR}"

  docker run --rm \
      -it \
      --user $(id -u):$(id -g) \
      --volume ${RECORDINGS_DIR}:/home/wiremock:Z \
      --publish 8443:8443 \
      rodolpheche/wiremock:2.26.3-alpine \
        --https-port 8443 --enable-browser-proxying --verbose
else
  echo "Starting Wiremock in detached mode; recordings in ${RECORDINGS_DIR}"

  container_id=$(docker run --rm \
      --detach=true \
      --user $(id -u):$(id -g) \
      --volume ${RECORDINGS_DIR}:/home/wiremock:Z \
      --publish 8443:8443 \
      rodolpheche/wiremock:2.26.3-alpine \
        --https-port 8443 --enable-browser-proxying)

  if [ ! $? -eq 0 ]; then
    echo "Failed to start Wiremock"
  fi

  if wait-for-url "https://localhost:8443/__admin"; then
    echo "${container_id}" >"${CONTAINER_ID_FILE}"
    echo "Wiremock started; container ${container_id}"
  else
    echo "Wiremock failed to start"
    docker kill ${container_id}
  fi
fi
