// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { prefersReducedMotion } from "../prefersReducedMotion.js";

function createMediaQueryList(matches: boolean): MediaQueryList {
    return {
        matches,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    };
}

describe("prefersReducedMotion", () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
        vi.unstubAllGlobals();
        if (typeof window !== "undefined") {
            Object.defineProperty(window, "matchMedia", {
                writable: true,
                configurable: true,
                value: originalMatchMedia,
            });
        }
    });

    it("returns true when reduced motion media query matches", () => {
        const matchMedia: Window["matchMedia"] = vi.fn().mockImplementation(() => createMediaQueryList(true));
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            configurable: true,
            value: matchMedia,
        });

        expect(prefersReducedMotion()).toBe(true);
    });

    it("returns false when reduced motion media query does not match", () => {
        const matchMedia: Window["matchMedia"] = vi
            .fn()
            .mockImplementation(() => createMediaQueryList(false));
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            configurable: true,
            value: matchMedia,
        });

        expect(prefersReducedMotion()).toBe(false);
    });

    it("returns false when window is not available", () => {
        vi.stubGlobal("window", undefined);

        expect(prefersReducedMotion()).toBe(false);
    });
});
