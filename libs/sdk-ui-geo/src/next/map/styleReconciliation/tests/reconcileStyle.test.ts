// (C) 2025 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import type { IMapFacade, StyleSpecification } from "../../../layers/common/mapFacade.js";
import { createStylePlan } from "../planBuilder.js";
import { applyStylePlan } from "../reconcileStyle.js";

function createMapFacadeStub(initial?: { layers?: string[]; sources?: string[] }) {
    const layerStore = new Map<string, Parameters<IMapFacade["addLayer"]>[0]>(
        (initial?.layers ?? []).map((id) => [
            id,
            {
                id,
                type: "fill",
                source: id,
            },
        ]),
    );
    const sourceStore = new Map<string, Parameters<IMapFacade["addSource"]>[1]>(
        (initial?.sources ?? []).map((id) => [
            id,
            {
                type: "geojson",
                data: { type: "FeatureCollection", features: [] },
            },
        ]),
    );

    const map = {} as IMapFacade;

    map.isStyleLoaded = vi.fn(() => true);
    map.getStyle = vi.fn(() => ({ version: 8, sources: {}, layers: [] }) as StyleSpecification);
    map.addLayer = vi.fn(((layer) => {
        layerStore.set(layer.id, layer);
        return map;
    }) as IMapFacade["addLayer"]);
    map.addSource = vi.fn(((id, source) => {
        sourceStore.set(id, source);
        return map;
    }) as IMapFacade["addSource"]);
    map.getLayer = vi.fn(((id: string) => layerStore.get(id)) as IMapFacade["getLayer"]);
    map.getSource = vi.fn(((id: string) => sourceStore.get(id)) as IMapFacade["getSource"]);
    map.removeLayer = vi.fn(((id: string) => {
        layerStore.delete(id);
        return map;
    }) as IMapFacade["removeLayer"]);
    map.removeSource = vi.fn(((id: string) => {
        sourceStore.delete(id);
        return map;
    }) as IMapFacade["removeSource"]);
    map.once = vi.fn((() => map) as IMapFacade["once"]);
    map.on = vi.fn((() => map) as IMapFacade["on"]);
    map.off = vi.fn((() => map) as IMapFacade["off"]);
    map.resize = vi.fn((() => map) as IMapFacade["resize"]);
    map.cameraForBounds = vi.fn((() => ({
        center: [0, 0] as [number, number],
        zoom: 1,
    })) as IMapFacade["cameraForBounds"]);
    map.flyTo = vi.fn((() => map) as IMapFacade["flyTo"]);
    map.jumpTo = vi.fn((() => map) as IMapFacade["jumpTo"]);
    map.panTo = vi.fn((() => map) as IMapFacade["panTo"]);
    map.zoomTo = vi.fn((() => map) as IMapFacade["zoomTo"]);
    map.getCenter = vi.fn((() => {
        const center = {
            lat: 0,
            lng: 0,
            wrap: () => center,
            toArray: () => [0, 0] as [number, number],
            distanceTo: () => 0,
        };
        return center;
    }) as IMapFacade["getCenter"]);
    map.getZoom = vi.fn((() => 0) as IMapFacade["getZoom"]);
    map.getCanvas = vi.fn((() => document.createElement("canvas")) as IMapFacade["getCanvas"]);
    map.loaded = vi.fn((() => true) as IMapFacade["loaded"]);
    map.areTilesLoaded = vi.fn((() => true) as IMapFacade["areTilesLoaded"]);
    map.queryRenderedFeatures = vi.fn((() => []) as IMapFacade["queryRenderedFeatures"]);

    return {
        map,
        layerStore,
        sourceStore,
    };
}

describe("style reconciliation helpers", () => {
    it("applyStylePlan removes planned ids before re-adding", () => {
        const { map, layerStore, sourceStore } = createMapFacadeStub({
            layers: ["layer-a"],
            sources: ["source-a"],
        });

        const plan = createStylePlan()
            .addSource("source-a", { type: "geojson", data: { type: "FeatureCollection", features: [] } })
            .addLayer({ id: "layer-a", type: "fill", source: "source-a" })
            .build();

        applyStylePlan(map, plan);

        expect(map.removeLayer).toHaveBeenCalledWith("layer-a");
        expect(map.removeSource).toHaveBeenCalledWith("source-a");
        expect(map.addLayer).toHaveBeenCalledTimes(1);
        expect(map.addSource).toHaveBeenCalledTimes(1);
        expect(layerStore.has("layer-a")).toBe(true);
        expect(sourceStore.has("source-a")).toBe(true);
    });

    it("createStylePlan supports overriding layer id via options", () => {
        const plan = createStylePlan()
            .addLayer({ id: "ignored", type: "circle", source: "foo" }, { id: "custom-id" })
            .build();

        expect(plan.layers[0].id).toBe("custom-id");
        expect(plan.layers[0].layer.id).toBe("custom-id");
    });
});
