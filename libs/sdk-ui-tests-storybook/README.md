# GoodData.UI Visual Regression Tests (Storybook)

This package contains Storybook stories and visual regression testing infrastructure for GoodData.UI components.

## Overview

### What this package contains

- **Storybook stories** (`stories/`) - stories for visual regression testing, auto-generated from test
  scenarios defined in `sdk-ui-tests-scenarios`.

- **Storybook configuration** (`.storybook/`) - Storybook setup and configuration.

- **NeoBackstop visual regression** (`neobackstop/`) - configuration, reference screenshots, and tooling
  for screenshot-based visual regression testing.

### How it works

Test scenarios are defined in the sibling `sdk-ui-tests-scenarios` package. This package consumes those
scenarios and renders them as Storybook stories. NeoBackstop then captures screenshots of the stories and
compares them against reference images to detect visual regressions.

## Running Storybook

For development, run Storybook with hot-reload:

```bash
npm run storybook
```

This starts Storybook on port 9001 with HMR enabled. Changes to stories and SDK source code are
automatically reflected in the browser.

**Note:** The Storybook configuration uses Vite with source file aliases pointing directly to the `src`
directories of workspace packages. This enables instant updates when you modify SDK source code while
developing and testing components.

## Visual Regression with NeoBackstop

Visual regression tests use [NeoBackstop](https://github.com/gooddata/gooddata-neobackstop) - a
high-performance visual regression testing tool powered by Playwright. It captures screenshots of
Storybook stories and compares them against reference images to detect visual changes.

### How NeoBackstop works

NeoBackstop operates in two modes:

- **Test mode** - captures screenshots and compares them against reference images. If differences are
  found, it generates diff images and an HTML report highlighting the changes.
- **Approve mode** - captures screenshots and saves them as the new reference images.

### Configuration

NeoBackstop configuration lives in `neobackstop/config.json`. Key settings:

| Option              | Description                            |
| ------------------- | -------------------------------------- |
| `browsers`          | Browsers to use (e.g. `["chromium"]`)  |
| `viewports`         | Viewport sizes for screenshots         |
| `asyncCaptureLimit` | Max concurrent screenshot captures     |
| `asyncCompareLimit` | Max concurrent image comparisons       |
| `retryCount`        | Extra retries on mismatch in test mode |

### Scenario generation

Scenarios are generated from Storybook stories by `npm run story-generator`. This extracts story
metadata and produces a `scenarios.json` file that NeoBackstop consumes.

Stories opt in to visual regression testing using configuration options:

#### Single screenshot

```js
{
    screenshot: true;
}
```

With specific NeoBackstop options:

```js
{
    screenshot: {
        clickSelector: ".some-element",
        postInteractionWait: 300,
    }
}
```

#### Multiple screenshots

For capturing multiple states of the same story (e.g. before and after interaction):

```js
{
    screenshots: {
        step1: {},
        step2: {
            clickSelector: ".dropdown-toggle",
            postInteractionWait: ".dropdown-menu",
        },
    },
}
```

### Available scenario options

Scenarios support the following interaction options from NeoBackstop:

| Option                | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `readySelector`       | CSS selector to wait for before capture                        |
| `delay`               | Wait time after ready (number or `{postReady, postOperation}`) |
| `clickSelector`       | Single element to click                                        |
| `clickSelectors`      | Multiple elements to click in sequence (with optional delays)  |
| `hoverSelector`       | Single element to hover over                                   |
| `hoverSelectors`      | Multiple elements to hover in sequence (with optional delays)  |
| `keyPressSelector`    | Element to focus and key to press                              |
| `scrollToSelector`    | Element to scroll into view                                    |
| `postInteractionWait` | Wait after interactions (CSS selector or milliseconds)         |
| `misMatchThreshold`   | Allowed mismatch percentage (0-100)                            |

Operations execute in order: navigate -> readySelector -> delay.postReady -> keyPress -> hover ->
click -> scroll -> delay.postOperation -> capture.

### Building and running

NeoBackstop can run in Docker (recommended for CI consistency) or locally.

#### Docker mode

```bash
# Full test pipeline (generate stories, build storybook, extract scenarios, run tests)
npm run neobackstop-test-docker

# Approve new/changed screenshots
npm run neobackstop-approve-docker
```

#### Local mode

For faster iteration during development:

```bash
# Full test pipeline locally
npm run neobackstop-test-local

# Approve new/changed screenshots
npm run neobackstop-approve-local
```

#### Individual steps

The full pipeline can be broken into individual steps for more flexible workflows:

1. `npm run story-generator` - generate stories from scenarios
2. `npm run build-storybook` - build production storybook
3. `npm run scenario-extractor-docker` or `npm run scenario-extractor-local` - extract NeoBackstop scenarios
4. Run NeoBackstop via `neobackstop/run-neobackstop-compose.sh test` or `approve`

This is useful when you only need to re-run a subset of the pipeline (e.g. re-extract scenarios
without rebuilding storybook).

### Output structure

After running tests, NeoBackstop generates:

```
neobackstop/output/
├── reference/       # Reference screenshots (from approve mode)
│   └── *.png
├── test/            # Test screenshots (from test mode)
│   ├── *.png        # Current screenshots
│   └── diff_*.png   # Diff images for failures
├── html-report/     # Visual HTML report for reviewing failures
│   └── index.html
└── ci-report/       # Machine-readable results
    └── results.json
```

### Inspecting production storybook build

Use `npm run storybook-serve` to launch a container serving the production build of storybook
with the same configuration as during test runs. This is useful for manually verifying stories
when you encounter unexpected test failures.

### Tips and hints

- After every change, rebuild storybook even if you see changes in the running dev server.
  Visual regression tests run against the production build.
- Each story name must be unique - it serves as the story's ID and the screenshot filename.
  Duplicate names cause hard-to-debug issues.
- Use `ScreenshotReadyWrapper` when using multiple screenshots per story.
- When using `clickSelectors` or `hoverSelectors`, you can insert numeric values between
  selectors to add delays (in milliseconds) between interactions.
- `postInteractionWait` can be either a CSS selector (waits for element to appear) or a number
  (waits for fixed milliseconds).
- Each test run creates a subdirectory in `output/test`. Clean it before a final run to ensure
  `neobackstop-approve` works correctly.

## License

(C) 2017-2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-tests/LICENSE).
