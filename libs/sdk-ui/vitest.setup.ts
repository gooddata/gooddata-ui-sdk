// (C) 2023-2025 GoodData Corporation
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as matchers from "vitest-dom/dist/matchers.js";
// eslint-disable-next-line import/no-extraneous-dependencies
import { type TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

/**
 * Exports of types and matchers of vitest-dom is currently broken we need export matchers from dist and define types manually
 */
declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/no-empty-object-type
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/no-empty-object-type
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}

expect.extend(matchers);

afterEach(() => {
    cleanup();
});
