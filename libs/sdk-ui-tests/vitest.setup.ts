// (C) 2023-2025 GoodData Corporation
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("mapbox-gl", () => ({}));

// Mock CSS.supports for jsdom environment
if (typeof globalThis.CSS === "undefined") {
    (globalThis as any).CSS = {
        supports: () => false,
    };
} else if (!globalThis.CSS.supports) {
    globalThis.CSS.supports = () => false;
}

afterEach(() => {
    cleanup();
});
