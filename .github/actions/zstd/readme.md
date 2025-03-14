# Zstd Management GitHub Actions

This repository offers three GitHub Actions to manage the `zstd` executable in your workflow. These actions help resolve caching issues caused by different compression methods in various environments.

## Overview

Some Docker images, like `cypress/included:13.17.0`, include `zstd`. However, our custom runners use gzip by default since `zstd` is not installed. The caching action `runs-on/cache` uses `zstd` if available, leading to cache key discrepancies and issues. Cached items from our runners are not accessible in Docker environments with `zstd`. Note that `runs-on/cache` cannot be forced to use gzip if `zstd` is available.

The provided actions are:

1. **detect-zstd**
   Checks if `zstd` is installed and outputs:

    - `exists`: whether `zstd` is present.
    - `zstd_dir`: the installation directory of `zstd`.
      It also sets the `ZSTD_DIR` environment variable.

2. **disable-zstd**
   Temporarily disables `zstd` by renaming its directory, forcing the use of gzip compression.

3. **enable-zstd**
   Restores `zstd` by renaming the directory back to its original name.

## Why Use These Actions?

### Cypress Image (All images that has zstd installed) and Cache Compression Issue

-   **Cypress Image Issue:**
    The `cypress/included:13.17.0` image includes `zstd`. As noted in [this issue](https://github.com/runs-on/cache/issues/29), the caching action uses `zstd` if available, causing cache restore failures on our runners that use gzip.

## Usage

Integrate these actions into your workflow as follows:

```yaml
name: Test zstd disable/enable
on: [push]

jobs:
    test-zstd:
        runs-on: ubuntu-latest
        image: some-docker-image
        steps:
            - uses: actions/checkout@v4

            - name: Detect zstd
              id: detect
              uses: ./.github/actions/detect-zstd

            - name: Verify zstd detection
              run: |
                  echo "zstd exists: ${{ steps.detect.outputs.exists }}"
                  echo "zstd is installed at: ${{ steps.detect.outputs.zstd_dir }}"

            - name: Test zstd before change
              run: zstd --version

            - name: Disable zstd
              uses: ./.github/actions/disable-zstd

            - name: Test zstd after disable
              run: zstd --version || echo "zstd is not available"

            - name: Enable zstd
              uses: ./.github/actions/enable-zstd

            - name: Test zstd after enable
              run: zstd --version
```
