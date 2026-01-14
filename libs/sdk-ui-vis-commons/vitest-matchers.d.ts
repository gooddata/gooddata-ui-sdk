// (C) 2025-2026 GoodData Corporation

import type { TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/naming-convention
    interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/naming-convention
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}

// This ensures the file is treated as a module
export {};
