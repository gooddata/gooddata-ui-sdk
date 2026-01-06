// (C) 2025 GoodData Corporation

import type { TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

declare module "vitest" {
    // Extend Vitest's Assertion interface with vitest-dom matchers
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/naming-convention
    interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
    // Extend AsymmetricMatchersContaining for asymmetric matchers
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/naming-convention
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}

// This ensures the file is treated as a module
export {};
