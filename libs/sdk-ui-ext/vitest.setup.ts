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

// Mock getBoundingClientRect for virtual lists - jsdom/happy-dom don't compute layout
const originalGetBoundingClientRect = globalThis.Element.prototype.getBoundingClientRect;
globalThis.Element.prototype.getBoundingClientRect = function () {
    const original = originalGetBoundingClientRect.call(this);

    // If element has inline height style, use it for the rect
    if (this instanceof HTMLElement && this.style.height) {
        const height = parseFloat(this.style.height);
        if (!isNaN(height) && height > 0) {
            return {
                // oxlint-disable-next-line @typescript-eslint/no-misused-spread
                ...original,
                height,
                width: original.width || 200, // Default width for dropdown lists
                top: 0,
                left: 0,
                bottom: height,
                right: 200,
                x: 0,
                y: 0,
                toJSON: () => ({}),
            } as DOMRect;
        }
    }

    return original;
};

global.ResizeObserver = class ResizeObserver {
    private callback: ResizeObserverCallback;
    private observedElements: Set<Element> = new Set();

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }

    observe(element: Element) {
        this.observedElements.add(element);
        // Trigger callback synchronously to ensure virtualizers measure immediately
        const rect = element.getBoundingClientRect();
        // Always trigger callback with dimensions (use defaults if zero)
        const width = rect.width || 200;
        const height = rect.height || 200;
        this.callback(
            [
                {
                    target: element,
                    // oxlint-disable-next-line @typescript-eslint/no-misused-spread
                    contentRect: { ...rect, width, height } as DOMRectReadOnly,
                    borderBoxSize: [{ inlineSize: width, blockSize: height }],
                    contentBoxSize: [{ inlineSize: width, blockSize: height }],
                    devicePixelContentBoxSize: [{ inlineSize: width, blockSize: height }],
                },
            ],
            this,
        );
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
