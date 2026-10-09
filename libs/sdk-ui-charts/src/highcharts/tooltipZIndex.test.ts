// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { DEFAULT_TOOLTIP_Z_INDEX, resolveTooltipZIndex } from "./tooltipZIndex.js";

describe("resolveTooltipZIndex", () => {
    it("should prefer the z-index from the chart config over the containing overlay", () => {
        expect(
            resolveTooltipZIndex({
                configZIndex: 42,
                containingOverlayZIndex: 6001,
                hostDefaultZIndex: 6001,
            }),
        ).toBe(42);
    });

    it("should place the tooltip one above the containing overlay", () => {
        expect(resolveTooltipZIndex({ containingOverlayZIndex: 6001, hostDefaultZIndex: 6001 })).toBe(6002);
    });

    it("should use the host default outside of any overlay", () => {
        expect(resolveTooltipZIndex({ hostDefaultZIndex: 6001 })).toBe(6001);
    });

    it("should fall back to the charts default when nothing is set", () => {
        expect(resolveTooltipZIndex({})).toBe(DEFAULT_TOOLTIP_Z_INDEX);
        expect(DEFAULT_TOOLTIP_Z_INDEX).toBe(3005);
    });

    it("should honour a zero z-index from the chart config", () => {
        expect(resolveTooltipZIndex({ configZIndex: 0, containingOverlayZIndex: 6001 })).toBe(0);
    });
});
