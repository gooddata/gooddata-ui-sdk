// (C) 2023-2026 GoodData Corporation

import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";
import * as matchers from "vitest-dom/dist/matchers.js";
import { type TestingLibraryMatchers } from "vitest-dom/dist/matchers.js";

// oxlint-disable @typescript-eslint/no-empty-object-type

/**
 * Exports of types and matchers of vitest-dom is currently broken we need export matchers from dist and define types manually
 */
declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/naming-convention
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type,@typescript-eslint/naming-convention
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
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

// This needs a manual stub; see https://github.com/jsdom/jsdom/issues/1695
// Note: This stub is also needed for happy-dom
globalThis.HTMLElement.prototype.scrollIntoView = vi.fn();

global.ResizeObserver = class ResizeObserver {
    private callback: ResizeObserverCallback;
    private observedElements: Set<Element> = new Set();

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }

    observe(element: Element) {
        this.observedElements.add(element);
        // Trigger callback asynchronously to allow virtualizers to measure
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
            if (element && this.observedElements.has(element)) {
                const rect = element.getBoundingClientRect();
                // Only trigger if element has dimensions
                if (rect.width > 0 || rect.height > 0) {
                    this.callback(
                        [
                            {
                                target: element,
                                contentRect: rect,
                                borderBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
                                contentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
                                devicePixelContentBoxSize: [
                                    { inlineSize: rect.width, blockSize: rect.height },
                                ],
                            },
                        ],
                        this,
                    );
                }
            }
        });
        return null;
    }
    unobserve(element: Element) {
        this.observedElements.delete(element);
        return null;
    }
    disconnect() {
        this.observedElements.clear();
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
