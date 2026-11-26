// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { getBarConfiguration } from "./barConfiguration.js";

describe("getBarConfiguration", () => {
    it("should serialize keyboard navigation through the points", () => {
        const { accessibility } = getBarConfiguration({});
        expect(accessibility?.keyboardNavigation?.seriesNavigation?.mode).toBe("serialize");
    });

    it("should serialize keyboard navigation through the points in compact size", () => {
        const { accessibility } = getBarConfiguration({ enableCompactSize: true });
        expect(accessibility?.keyboardNavigation?.seriesNavigation?.mode).toBe("serialize");
    });
});
