// (C) 2025 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GeoLegendProvider, useGeoLegend } from "../GeoLegendContext.js";

describe("GeoLegendContext", () => {
    describe("legend items (per-layer)", () => {
        const layerId = "layer-1";
        const allUris = ["a", "b", "c"];

        it("disables a single item when starting from all enabled", () => {
            const { result } = renderHook(() => useGeoLegend(), {
                wrapper: GeoLegendProvider,
            });

            act(() => result.current.toggleLegendItem(layerId, "a", allUris));

            // Layer should now have only "b" and "c" enabled
            expect(result.current.enabledItemsByLayer.get(layerId)).toEqual(["b", "c"]);
        });

        it("enables all items again when toggling back to full selection", () => {
            const { result } = renderHook(() => useGeoLegend(), {
                wrapper: GeoLegendProvider,
            });

            act(() => result.current.toggleLegendItem(layerId, "a", allUris));
            act(() => result.current.toggleLegendItem(layerId, "a", allUris));

            // null means all enabled - layer is removed from map when all enabled
            expect(result.current.enabledItemsByLayer.get(layerId)).toBeUndefined();
        });

        it("keeps empty selection when disabling last enabled item", () => {
            const { result } = renderHook(() => useGeoLegend(), {
                wrapper: GeoLegendProvider,
            });

            act(() => result.current.setEnabledItemsForLayer(layerId, ["a"]));
            act(() => result.current.toggleLegendItem(layerId, "a", allUris));

            expect(result.current.enabledItemsByLayer.get(layerId)).toEqual([]);
        });

        it("manages items independently per layer", () => {
            const layer1 = "layer-1";
            const layer2 = "layer-2";
            const { result } = renderHook(() => useGeoLegend(), {
                wrapper: GeoLegendProvider,
            });

            // Toggle "a" off in layer 1
            act(() => result.current.toggleLegendItem(layer1, "a", allUris));

            // Toggle "b" off in layer 2
            act(() => result.current.toggleLegendItem(layer2, "b", allUris));

            // Layer 1 should have "b" and "c" enabled (a is off)
            expect(result.current.enabledItemsByLayer.get(layer1)).toEqual(["b", "c"]);

            // Layer 2 should have "a" and "c" enabled (b is off)
            expect(result.current.enabledItemsByLayer.get(layer2)).toEqual(["a", "c"]);
        });
    });

    describe("layer visibility", () => {
        it("starts with all layers visible (empty hiddenLayers set)", () => {
            const { result } = renderHook(() => useGeoLegend(), {
                wrapper: GeoLegendProvider,
            });

            expect(result.current.hiddenLayers.size).toBe(0);
        });

        it("hides a layer when toggled", () => {
            const { result } = renderHook(() => useGeoLegend(), {
                wrapper: GeoLegendProvider,
            });

            act(() => result.current.toggleLayerVisibility("layer-1"));

            expect(result.current.hiddenLayers.has("layer-1")).toBe(true);
            expect(result.current.hiddenLayers.size).toBe(1);
        });

        it("shows a layer again when toggled twice", () => {
            const { result } = renderHook(() => useGeoLegend(), {
                wrapper: GeoLegendProvider,
            });

            act(() => result.current.toggleLayerVisibility("layer-1"));
            act(() => result.current.toggleLayerVisibility("layer-1"));

            expect(result.current.hiddenLayers.has("layer-1")).toBe(false);
            expect(result.current.hiddenLayers.size).toBe(0);
        });

        it("can hide multiple layers independently", () => {
            const { result } = renderHook(() => useGeoLegend(), {
                wrapper: GeoLegendProvider,
            });

            act(() => result.current.toggleLayerVisibility("layer-1"));
            act(() => result.current.toggleLayerVisibility("layer-2"));

            expect(result.current.hiddenLayers.has("layer-1")).toBe(true);
            expect(result.current.hiddenLayers.has("layer-2")).toBe(true);
            expect(result.current.hiddenLayers.size).toBe(2);

            // Toggle one back
            act(() => result.current.toggleLayerVisibility("layer-1"));

            expect(result.current.hiddenLayers.has("layer-1")).toBe(false);
            expect(result.current.hiddenLayers.has("layer-2")).toBe(true);
            expect(result.current.hiddenLayers.size).toBe(1);
        });
    });
});
