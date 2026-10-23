// (C) 2021-2026 GoodData Corporation

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Global cleanup after each test
afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
});
