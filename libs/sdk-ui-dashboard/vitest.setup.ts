// (C) 2023-2026 GoodData Corporation

// oxlint-disable @typescript-eslint/no-empty-object-type

import { enableCompileCache } from "node:module";
import { join } from "node:path";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, expect, vi } from "vitest";
import * as matchers from "vitest-dom/dist/matchers.js";
import { type TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

/**
 * The test run spends most of its wall-clock time importing modules: every test file gets a fresh
 * worker, and each one natively imports the (very large) `@gooddata/sdk-ui-*` module graph again.
 * Node's on-disk compile cache lets V8 reuse the code cache for those thousands of files instead of
 * re-compiling them for every test file, which is a pure win - the cache is keyed by file content
 * and Node version, and Node silently falls back to compiling when it cannot be used.
 */
enableCompileCache(join(import.meta.dirname, "node_modules", ".cache", "node-compile-cache"));

/**
 * Exports of types and matchers of vitest-dom is currently broken we need export matchers from dist and define types manually
 */
declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}

/**
 * Global test-only mocks for heavy dependencies that the dashboard module graph pulls in but that
 * no test actually exercises.
 *
 * `@gooddata/sdk-ui-geo` (mapbox-gl) and `@gooddata/sdk-ui-pivot/next` (ag-grid) are reached from
 * `model/react/useInitializeDashboardStore.ts`, which only needs the four token helpers below.
 * Importing the real barrels costs seconds of module-import time per test file, so they are
 * replaced with behaviourally identical re-implementations of just those helpers.
 */
const enrichToken =
    (key: "mapboxToken" | "agGridToken") =>
    (config?: Record<string, unknown>, token?: string): Record<string, unknown> | undefined =>
        token ? { ...(config || {}), [key]: config?.[key] || token } : config;

vi.mock("@gooddata/sdk-ui-geo", () => ({
    enrichMapboxToken: enrichToken("mapboxToken"),
    useMapboxToken: (mapboxToken?: string) => mapboxToken,
}));

vi.mock("@gooddata/sdk-ui-pivot/next", () => ({
    enrichAgGridToken: enrichToken("agGridToken"),
    useAgGridToken: (agGridToken?: string) => agGridToken,
}));

global.IntersectionObserver = class IntersectionObserver {
    observe() {
        return null;
    }
    unobserve() {
        return null;
    }
    disconnect() {
        return null;
    }
    takeRecords() {
        return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
};

expect.extend(matchers);

afterEach(() => {
    cleanup();
});

/**
 * The suite runs with `isolate: false`, so a whole worker shares one module graph. Vitest only
 * clears the module mock registry and marks the graph for re-evaluation between files when
 * isolation is on — see the `if (config.isolate) { moduleRunner.mocker.reset(); resetModules(…) }`
 * guard in its worker. Without that, a `vi.mock()` either leaks into every file that runs after it
 * or silently no-ops because its target was already evaluated unmocked by an earlier file.
 *
 * Resetting the mock registry ourselves at the end of every file covers the leak half of that,
 * while still reusing the worker and its DOM. The matching `vi.resetModules()` is deliberately not
 * done here: it lives in the individual test files that need a re-evaluated module graph, so that
 * dependency stays visible in the file it belongs to instead of being hidden by a blanket reset.
 */
afterAll(() => {
    const { __vitest_mocker__: mocker } = globalThis as unknown as {
        __vitest_mocker__?: { reset: () => void };
    };
    if (!mocker) {
        // Never silently skip the reset: without it the mock registry leaks between files and the
        // resulting failures point everywhere except at this line.
        throw new Error(
            "vitest no longer exposes its mocker as globalThis.__vitest_mocker__. " +
                "Find its new accessor and reset it here, or turn `isolate` back on in vitest.config.ts.",
        );
    }
    mocker.reset();
});
