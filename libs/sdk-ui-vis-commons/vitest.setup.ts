// (C) 2023-2026 GoodData Corporation

import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";
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

// Registered globally (setup runs before every test file's imports) so LegendSeries always
// evaluates against the stub, even though the module registry is shared between test files.
vi.mock("./src/legend/visibilityDetection.js", () => ({
    useVisibilityDetection: () => ({
        viewportRefCallback: () => {}, // No-op in tests
        contextValue: {
            registerItem: () => {}, // No-op in tests
            isVisible: () => true, // All items are visible in tests
            visibleItems: new Set([0, 1, 2]), // Reasonable range for tests
        },
    }),
}));

afterEach(() => {
    cleanup();
});
