// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OverlayZIndexContext } from "@gooddata/sdk-ui-kit";

import { DEFAULT_TOOLTIP_Z_INDEX } from "../../../highcharts/tooltipZIndex.js";

import { useInlineChartTooltipZIndex } from "./useInlineChartTooltipZIndex.js";

const inOverlay =
    (zIndex: number) =>
    ({ children }: { children: ReactNode }) => (
        <OverlayZIndexContext.Provider value={zIndex}>{children}</OverlayZIndexContext.Provider>
    );

describe("useInlineChartTooltipZIndex", () => {
    it("should use the charts default outside of any overlay", () => {
        const { result } = renderHook(() => useInlineChartTooltipZIndex(undefined));

        expect(result.current).toBe(DEFAULT_TOOLTIP_Z_INDEX);
    });

    it("should place the tooltip one above the containing overlay", () => {
        const { result } = renderHook(() => useInlineChartTooltipZIndex({}), { wrapper: inOverlay(6001) });

        expect(result.current).toBe(6002);
    });

    it("should prefer the z-index from the chart config", () => {
        const { result } = renderHook(() => useInlineChartTooltipZIndex({ tooltip: { zIndex: 6001 } }), {
            wrapper: inOverlay(9000),
        });

        expect(result.current).toBe(6001);
    });
});
