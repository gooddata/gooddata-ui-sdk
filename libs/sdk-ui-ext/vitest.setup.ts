// (C) 2023-2026 GoodData Corporation

import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import * as matchers from "vitest-dom/dist/matchers.js";
import { type TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

/**
 * Exports of types and matchers of vitest-dom is currently broken we need export matchers from dist and define types manually
 */
declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/naming-convention
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/naming-convention
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}

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
