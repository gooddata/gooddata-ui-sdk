// (C) 2025 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GeoLegendProvider, useGeoLegend } from "../GeoLegendContext.js";

describe("GeoLegendContext", () => {
    const allUris = ["a", "b", "c"];

    it("disables a single item when starting from all enabled", () => {
        const { result } = renderHook(() => useGeoLegend(), {
            wrapper: GeoLegendProvider,
        });

        act(() => result.current.toggleLegendItem("a", allUris));

        expect(result.current.enabledLegendItems).toEqual(["b", "c"]);
    });

    it("enables all items again when toggling back to full selection", () => {
        const { result } = renderHook(() => useGeoLegend(), {
            wrapper: GeoLegendProvider,
        });

        act(() => result.current.toggleLegendItem("a", allUris));
        act(() => result.current.toggleLegendItem("a", allUris));

        expect(result.current.enabledLegendItems).toBeNull();
    });

    it("keeps empty selection when disabling last enabled item", () => {
        const { result } = renderHook(() => useGeoLegend(), {
            wrapper: GeoLegendProvider,
        });

        act(() => result.current.setEnabledLegendItems(["a"]));
        act(() => result.current.toggleLegendItem("a", allUris));

        expect(result.current.enabledLegendItems).toEqual([]);
    });
});
