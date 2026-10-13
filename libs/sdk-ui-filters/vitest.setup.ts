// (C) 2023-2026 GoodData Corporation

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

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
    scrollMargin = "";
    thresholds = [];
};

afterEach(() => {
    cleanup();
});
