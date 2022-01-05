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
#    The detached mode recognizes presence of the WIREMOCK_NET variable. If found, the script alters the behavior
#    so that:
#
#    1.  wiremock container runs on the network as outlined on WIREMOCK_NET, is aliased as 'bear'
#    2.  when testing that wiremock is up, script uses dockerized curl which is started on the same network
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
  if [ -z ${WIREMOCK_NET} ]; then
    # When running wiremock locally (dev testing), use curl as-is

    timeout 15 bash -c \
    'while [[ "$(curl -s -o /dev/null -L -w ''%{http_code}'' --insecure ${0})" != "200" ]];\
    do echo "Waiting for ${0}" && sleep 2;\
    done' ${1}

    last=$(curl -s -o /dev/null -L -w '%{http_code}' --insecure $1)
  else
    # When running wiremock on dedicated network (CI), use dockerized curl running on the same network

    timeout 15 bash -c \
    'while [[ "$(docker run --net ${0} --rm curlimages/curl:7.70.0 -s -o /dev/null -L -w ''%{http_code}'' --insecure ${1})" != "200" ]];\
    do echo "Waiting for ${1}" && sleep 2;\
    done' ${WIREMOCK_NET} ${1}

    last=$(docker run --net ${WIREMOCK_NET} --rm curlimages/curl:7.70.0 -s -o /dev/null -L -w '%{http_code}' --insecure $1)
  fi;

  [ $last == "200" ]
}

if [ ${mode} = "interactive" ]; then
  echo "Starting Wiremock in interactive mode; recordings in ${RECORDINGS_DIR}"

  docker run --rm \
      -it \
      --user $(id -u):$(id -g) \
      --volume ${RECORDINGS_DIR}:/home/wiremock:Z \
      --publish 8442:8442 \
      rodolpheche/wiremock:2.26.3-alpine \
        --https-port 8442 --enable-browser-proxying --verbose
else
  if [ -z ${WIREMOCK_NET} ]; then
    #
    # When not running on dedicated docker network (e.g. dev testing on localhost)
    #

    echo "Starting Wiremock in detached mode in dev-testing mode; recordings in ${RECORDINGS_DIR}"

    container_id=$(docker run --rm \
        --detach=true \
        --user $(id -u):$(id -g) \
        --volume ${RECORDINGS_DIR}:/home/wiremock:Z \
        --publish 8442:8442 \
        rodolpheche/wiremock:2.26.3-alpine \
          --https-port 8442 --enable-browser-proxying)
  else
    #
    # When running on dedicated docker network, use network id passed via WIREMOCK_NET and alias the server as "bear".
    #
    echo "Starting Wiremock in detached mode in CI mode; network: ${WIREMOCK_NET}; recordings in ${RECORDINGS_DIR}"

    container_id=$(docker run --rm \
        --detach=true \
        --user $(id -u):$(id -g) \
        --volume ${RECORDINGS_DIR}:/home/wiremock:Z \
        --net "${WIREMOCK_NET}" --net-alias tiger \
        rodolpheche/wiremock:2.26.3-alpine \
          --https-port 8442 --enable-browser-proxying)
  fi

  if [ ! $? -eq 0 ]; then
    echo "Failed to start Wiremock"
  fi

  if [ -z ${WIREMOCK_NET} ]; then
    hostname="https://localhost:8442/__admin"
  else
    hostname="https://tiger:8442/__admin"
  fi

  if wait-for-url $hostname; then
    echo "${container_id}" >"${CONTAINER_ID_FILE}"
    echo "Wiremock started; container ${container_id}"

    exit 0
  else
    echo "Wiremock failed to start"
    docker kill ${container_id}

    exit 1
  fi
fi
