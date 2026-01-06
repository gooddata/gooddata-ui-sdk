// (C) 2023-2025 GoodData Corporation

import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import * as matchers from "vitest-dom/dist/matchers.js";

// Type declarations moved to vitest-matchers.d.ts

global.ResizeObserver = class ResizeObserver {
    observe(): null {
        return null;
    }
    unobserve(): null {
        return null;
    }
    disconnect(): null {
        return null;
    }
};

global.IntersectionObserver = class IntersectionObserver {
    observe(): null {
        return null;
    }
    unobserve(): null {
        return null;
    }
    disconnect(): null {
        return null;
    }
    takeRecords(): any[] {
        return [];
    }
    root: null = null;
    rootMargin = "";
    thresholds: any[] = [];
};

expect.extend(matchers);

afterEach(() => {
    cleanup();
});

global.CSS = {
    supports: (_property: string, _value: string) => false,
} as any;
