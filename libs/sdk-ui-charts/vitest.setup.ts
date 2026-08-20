// (C) 2023-2026 GoodData Corporation

// oxlint-disable @typescript-eslint/no-empty-object-type

import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";
import * as matchers from "vitest-dom/dist/matchers.js";
import { type TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

/**
 * Exports of types and matchers of vitest-dom is currently broken we need export matchers from dist and define types manually
 */
declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}

expect.extend(matchers);

afterEach(() => {
    cleanup();
    // tests run without isolation, so any fake timers left behind would leak into the other test files
    vi.useRealTimers();
});

global.CSS = {
    supports: (_property: string, _value: string) => false,
} as any;

/**
 * The tests run with isolation disabled (see vitest.config.ts), so the whole module graph is shared by all
 * the test files running in the same worker. That makes the modules mocked by one test file (vi.mock) stay
 * in the cache and leak into the test files running later, which then see a stale mock instead of the real
 * module - or a mock instance different from the one they registered themselves.
 *
 * Setup files are executed once per test file, before the test file itself is imported, so resetting the
 * module registry here gives every test file a freshly evaluated module graph while the worker, the DOM
 * environment and the transform cache - the actually expensive parts - keep being reused.
 */
vi.resetModules();
