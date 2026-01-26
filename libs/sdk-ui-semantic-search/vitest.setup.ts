// (C) 2023-2026 GoodData Corporation

import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";
import * as matchers from "vitest-dom/dist/matchers.js";
import { type TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

/**
 * Exports of types and matchers of vitest-dom is currently broken we need export matchers from dist and define types manually
 */
declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/naming-convention,@typescript-eslint/no-explicit-any
    interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/naming-convention,@typescript-eslint/no-explicit-any
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}

expect.extend(matchers);

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

// Mock for ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() {
        return null;
    }
    unobserve() {
        return null;
    }
    disconnect() {
        return null;
    }
};

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
    thresholds = [];
};
