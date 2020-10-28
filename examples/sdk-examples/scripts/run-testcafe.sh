#!/bin/bash

CI_CONCURRENCY=5
LOCAL_CONCURRENCY=4
ASSERTION_TIMEOUT=60000
SELECTOR_TIMEOUT=10000
WINDOW_WIDTH=1280
WINDOW_HEIGHT=800
# For some reason testcafe has problems using globstar so we need to specify
# maximum directory depth, otherwise it just picks up tests in the deepest directory.
TESTS_PATH="test/**/**/*_test*"

CHROME_HEADLESS_DOCKER="chrome:headless --window-size='$WINDOW_WIDTH,$WINDOW_HEIGHT' --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-breakpad --disable-client-side-phishing-detection --disable-component-update --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=site-per-process --disable-hang-monitor --disable-infobars --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --disable-sync --disable-translate --disable-web-resource --enable-automation --metrics-recording-only --mute-audio --no-first-run --no-sandbox --safebrowsing-disable-auto-update"
CHROME_HEADLESS_LOCAL="chrome:headless --window-size='$WINDOW_WIDTH,$WINDOW_HEIGHT' --no-sandbox"
CHROME_LOCAL="chrome --window-size='$WINDOW_WIDTH,$WINDOW_HEIGHT' --no-sandbox --disable-background-timer-throttling"
CAPTURE_PATH="_screenshots"
CAPTURE_BASE_PATTERN='${DATE}_${TIME}/${TEST_ID}_${FIXTURE}/${RUN_ID}/${FILE_INDEX}_${TEST}'
SCREENSHOT_PATTERN="$CAPTURE_BASE_PATTERN.png"
VIDEO_PATTERN="$CAPTURE_BASE_PATTERN.mp4"

LOCAL_BE_NOTICE="Ensure you started backend by running yarn examples"

CONFIG=$1
shift

# Run on CI/docker
if [ "$CONFIG" = "ci" ]; then
    set -x
    testcafe "$CHROME_HEADLESS_DOCKER" \
        --concurrency $CI_CONCURRENCY \
        --quarantine-mode  \
        --reporter spec,xunit:ci/results/testcafe-results.xml \
        --assertion-timeout $ASSERTION_TIMEOUT \
        --selector-timeout $SELECTOR_TIMEOUT \
        --screenshots-on-fails \
        --screenshots $CAPTURE_PATH \
        --screenshot-path-pattern $SCREENSHOT_PATTERN \
        $TESTS_PATH \
        "$@"

# Run on CI/docker with video
elif [ "$CONFIG" = "ci-video" ]; then
    set -x
    testcafe "$CHROME_HEADLESS_DOCKER" \
        --concurrency $CI_CONCURRENCY \
        --quarantine-mode  \
        --reporter spec,xunit:ci/results/testcafe-results.xml \
        --assertion-timeout $ASSERTION_TIMEOUT \
        --selector-timeout $SELECTOR_TIMEOUT \
        --screenshots-on-fails \
        --screenshots $CAPTURE_PATH \
        --screenshot-path-pattern $SCREENSHOT_PATTERN \
        --video $CAPTURE_PATH \
        --video-options failedOnly=true,singleFile=false,pathPattern=$VIDEO_PATTERN \
        $TESTS_PATH \
        "$@"

# Run locally in browser
elif [ "$CONFIG" = "visual" ]; then
    echo "Starting TestCafe in visual-local mode without concurrency."
    echo -e $LOCAL_BE_NOTICE
    set -x
    testcafe "$CHROME_LOCAL" \
        --debug-on-fail \
        --assertion-timeout $ASSERTION_TIMEOUT \
        --selector-timeout $SELECTOR_TIMEOUT \
        $TESTS_PATH \
        "$@"

elif [ "$CONFIG" = "live" ]; then
    echo "Starting TestCafe-Live in visual-local mode without concurrency."
    echo -e $LOCAL_BE_NOTICE
    set -x
    testcafe-live "$CHROME_LOCAL" \
        --debug-on-fail \
        --assertion-timeout $ASSERTION_TIMEOUT \
        --selector-timeout $SELECTOR_TIMEOUT \
        $TESTS_PATH \
        "$@"

# Run locally with concurrency and video recording in headless browser
elif [ "$CONFIG" = "video" ]; then
    echo "Starting TestCafe in local mode with concurrency $LOCAL_CONCURRENCY and video recording."
    echo -e $LOCAL_BE_NOTICE
    set -x
    testcafe "$CHROME_HEADLESS_LOCAL" \
        --concurrency $LOCAL_CONCURRENCY \
        --quarantine-mode  \
        --assertion-timeout $ASSERTION_TIMEOUT \
        --selector-timeout $SELECTOR_TIMEOUT \
        --video $CAPTURE_PATH \
        --video-options failedOnly=true,singleFile=false,pathPattern=$VIDEO_PATTERN \
        $TESTS_PATH \
        "$@"

# Run locally with concurrency in headless browser
else
    echo "Starting TestCafe in local mode with concurrency $LOCAL_CONCURRENCY."
    echo -e $LOCAL_BE_NOTICE
    set -x
    testcafe "$CHROME_HEADLESS_LOCAL" \
        --concurrency $LOCAL_CONCURRENCY \
        --quarantine-mode  \
        --assertion-timeout $ASSERTION_TIMEOUT \
        --selector-timeout $SELECTOR_TIMEOUT \
        $TESTS_PATH \
        "$@"
fi
