// (C) 2025 GoodData Corporation

import type { TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

declare module "vitest" {
    // Extend Vitest's Assertion interface with vitest-dom matchers
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Assertion<T = unknown> extends TestingLibraryMatchers<unknown, T> {}
    // Extend AsymmetricMatchersContaining for asymmetric matchers
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}

// This ensures the file is treated as a module
export {};
