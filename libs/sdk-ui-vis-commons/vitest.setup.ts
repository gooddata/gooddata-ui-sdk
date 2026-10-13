// (C) 2023-2026 GoodData Corporation

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

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
