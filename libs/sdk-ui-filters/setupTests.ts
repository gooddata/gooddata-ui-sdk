// (C) 2023-2025 GoodData Corporation
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";

/**
 * In order to be able to use extended matchers like "toBeInDocument", we use vitest-dom instead of testing-library/jest-dom.
 * The reason for that is that there were type conflicts between vitest and types/jest as dependency of testing-library/jest-dom.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import * as matchers from "vitest-dom/dist/matchers.js";
// eslint-disable-next-line import/no-extraneous-dependencies
import { TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

/**
 * Exports of types and matchers of vitest-dom is currently broken we need export matchers from dist and define types manually
 */
declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}

expect.extend(matchers);

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
        return null;
    }
    root = null;
    rootMargin = "";
    thresholds = [];
};

afterEach(() => {
    cleanup();
});
