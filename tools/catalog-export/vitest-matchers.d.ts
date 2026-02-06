// (C) 2025-2026 GoodData Corporation

// oxlint-disable typescript/no-empty-object-type

import type { TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

declare module "vitest" {
    // Extend Vitest's Assertion interface with vitest-dom matchers
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
    // Extend AsymmetricMatchersContaining for asymmetric matchers
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}

// This ensures the file is treated as a module
export {};
