// (C) 2023-2026 GoodData Corporation

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// This needs a manual stub; see https://github.com/jsdom/jsdom/issues/1695
// Note: This stub is also needed for happy-dom
globalThis.HTMLElement.prototype.scrollIntoView = vi.fn();

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
    scrollMargin = "";
    thresholds: any[] = [];
};

afterEach(() => {
    cleanup();
});

// happy-dom exposes window.CSS as a getter-only accessor, so a plain assignment throws
Object.defineProperty(globalThis, "CSS", {
    value: {
        supports: (_property: string, _value: string) => false,
    },
    configurable: true,
    writable: true,
});
