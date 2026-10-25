// (C) 2007-2026 GoodData Corporation

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { type IMeasureDef } from "@gooddata/sdk-ui-metric-component";

afterEach(() => {
    cleanup();
});

// Common mocks
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect(): void {}
    observe(): void {}
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
    unobserve(): void {}
    // the mock deliberately omits root/rootMargin/thresholds, so it is not a structural
    // IntersectionObserver — the constructor signature is all the tests exercise
} as unknown as typeof IntersectionObserver;

// Only apply DOM mocks if DOM environment is available
if (typeof Element !== "undefined" && typeof HTMLElement !== "undefined") {
    // Mock getBoundingClientRect to return non-zero dimensions for virtualized lists
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
        const rect = originalGetBoundingClientRect.call(this);
        // If the element has no dimensions (common in test environments),
        // provide default dimensions for proper virtualization
        if (rect.height === 0 && rect.width === 0) {
            return new DOMRect(0, 0, 300, 300);
        }
        return rect;
    };

    // Mock scrollHeight and clientHeight for virtualized list containers
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
        configurable: true,
        get() {
            return this._scrollHeight ?? 1000;
        },
        set(value) {
            this._scrollHeight = value;
        },
    });

    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
        configurable: true,
        get() {
            return this._clientHeight ?? 300;
        },
        set(value) {
            this._clientHeight = value;
        },
    });

    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
        configurable: true,
        get() {
            return this._offsetHeight ?? 300;
        },
        set(value) {
            this._offsetHeight = value;
        },
    });

    // Override ResizeObserver for virtualized lists (works for both JSDOM and happy-dom)
    global.ResizeObserver = class ResizeObserver {
        private callback: ResizeObserverCallback;
        private observedElements: Set<Element> = new Set();

        constructor(callback: ResizeObserverCallback) {
            this.callback = callback;
        }

        observe(target: Element): void {
            this.observedElements.add(target);
            // Immediately call the callback with a mock entry to trigger initial render
            const entry: ResizeObserverEntry = {
                target,
                contentRect: new DOMRect(0, 0, 300, 300),
                borderBoxSize: [{ inlineSize: 300, blockSize: 300 }],
                contentBoxSize: [{ inlineSize: 300, blockSize: 300 }],
                devicePixelContentBoxSize: [{ inlineSize: 300, blockSize: 300 }],
            };
            // Call synchronously - use queueMicrotask to ensure it's after current render cycle
            queueMicrotask(() => this.callback([entry], this));
        }

        unobserve(target: Element): void {
            this.observedElements.delete(target);
        }

        disconnect(): void {
            this.observedElements.clear();
        }
        // the mock deliberately omits the ResizeObserver static surface
    } as unknown as typeof ResizeObserver;
}

// Mock windowTracker to prevent console.debug messages in tests
vi.mock("./src/services/telemetry/windowTracker", () => {
    return {
        registerWindowTracker: () => ({
            wasWindowAlwaysActive: () => true,
        }),
    };
});

vi.mock("@gooddata/sdk-ui-metric-component", () => {
    const emptyMetricWithId = {
        type: "measure",
        title: "",
        description: "",
        expression: "",
        format: "#,##0.00",
        tags: [] as string[],
        id: "",
    };
    return {
        emptyMetricWithId,
        SaveNameMode: vi.fn(),
        createNewMetricInfo: vi.fn((identifier: string, prescription?: IMeasureDef) => {
            const metric = prescription ? { ...prescription, ...emptyMetricWithId } : emptyMetricWithId;
            return {
                initial: { ...metric },
                current: metric,
                kind: "CREATE",
                saveMode: "save_as_new",
                generateNewId: true,
                identifier,
                sqlOpen: false,
                computedFor: null,
                attributes: [],
                display: { limit: 10, ranking: "top" },
            };
        }),
        createEditMetricInfo: vi.fn((identifier: string, metric: IMeasureDef) => {
            return {
                initial: { ...metric },
                current: metric,
                kind: "EDIT",
                saveMode: "save",
                generateNewId: false,
                identifier,
                sqlOpen: false,
                computedFor: null,
                attributes: [],
                display: { limit: 10, ranking: "top" },
            };
        }),
    };
});
