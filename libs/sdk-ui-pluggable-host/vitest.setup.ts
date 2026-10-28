// (C) 2026 GoodData Corporation

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
    cleanup();
    // Note that files running only in Node do not have sessionStorage
    globalThis.sessionStorage?.clear();
    vi.useRealTimers();
});
