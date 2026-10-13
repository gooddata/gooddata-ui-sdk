// (C) 2023-2026 GoodData Corporation

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
    cleanup();
});

// some tests need createRange function
document.createRange = () => {
    const range = new Range();

    range.getBoundingClientRect = vi.fn();

    range.getClientRects = () => {
        return {
            item: () => null,
            length: 0,
            [Symbol.iterator]: vi.fn(),
        };
    };

    return range;
};

// This needs a manual stub; see https://github.com/jsdom/jsdom/issues/1695
// Note: This stub is also needed for happy-dom
globalThis.HTMLElement.prototype.scrollIntoView = vi.fn();

global.IntersectionObserver = class IntersectionObserver {
    observe() {
        return null;
    }
    unobserve() {
        return null;
    }
    disconnect() {
        return null;
    }
    takeRecords() {
        return [];
    }
    root = null;
    rootMargin = "";
    scrollMargin = "";
    thresholds = [];
};
