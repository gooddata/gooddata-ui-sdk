// (C) 2023-2026 GoodData Corporation

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
    cleanup();
    // tests run without isolation, so any fake timers left behind would leak into the other test files
    vi.useRealTimers();
});

// happy-dom exposes window.CSS as a getter-only accessor, so a plain assignment throws
Object.defineProperty(globalThis, "CSS", {
    value: {
        supports: (_property: string, _value: string) => false,
    },
    configurable: true,
    writable: true,
});
