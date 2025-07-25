// (C) 2025 GoodData Corporation

import type { TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

declare module "vitest" {
    // Extend Vitest's Assertion interface with vitest-dom matchers
    interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
    // Extend AsymmetricMatchersContaining for asymmetric matchers
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}

// This ensures the file is treated as a module
export {};
