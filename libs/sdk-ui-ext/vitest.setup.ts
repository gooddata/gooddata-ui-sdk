// (C) 2023-2026 GoodData Corporation

// oxlint-disable @typescript-eslint/no-empty-object-type

import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";
import * as matchers from "vitest-dom/dist/matchers.js";
import { type TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

/**
 * Exports of types and matchers of vitest-dom is currently broken we need export matchers from dist and define types manually
 */
declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}

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
    thresholds: any[] = [];
};

expect.extend(matchers);

afterEach(() => {
    cleanup();
});

global.CSS = {
    supports: (_property: string, _value: string) => false,
} as any;
