// (C) 2023-2026 GoodData Corporation

import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import * as matchers from "vitest-dom/dist/matchers.js";
import { type TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

// oxlint-disable @typescript-eslint/no-empty-object-type

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
});
