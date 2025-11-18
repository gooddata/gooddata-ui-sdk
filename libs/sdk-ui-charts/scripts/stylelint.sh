#!/usr/bin/env bash
set -e

# This script wraps stylelint to filter out baseline-browser-mapping warnings from stderr.
# We use this script instead of calling stylelint directly because stylelint outputs
# warnings about outdated baseline-browser-mapping data to stderr, which can clutter
# the output and make it harder to spot actual stylelint errors. Additionally, in CI
# environments, warnings are treated as errors, so these baseline-browser-mapping warnings
# would cause CI failures even though they are not actual stylelint errors. This script
# filters those warnings while preserving all other output and the exit code from stylelint.

# Define paths relative to the script location
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR/.."

# Function to filter out baseline-browser-mapping warnings from stderr
filter_baseline_warning() {
    grep -v "\[baseline-browser-mapping\]" || true
}

# Change to project directory
cd "$PROJECT_DIR"

# Run stylelint and filter baseline-browser-mapping warnings from stderr
# Capture stderr, filter it, and output to stderr while preserving stdout and exit code
set +e
stylelint '**/*.scss' 2> >(filter_baseline_warning >&2)
exit_code=$?
set -e

# Preserve stylelint exit code
exit $exit_code

