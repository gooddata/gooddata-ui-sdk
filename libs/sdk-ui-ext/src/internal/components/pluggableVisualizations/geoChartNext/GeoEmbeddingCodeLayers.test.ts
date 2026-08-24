// (C) 2025-2026 GoodData Corporation

import { type MockedFunction, afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { newAttribute, newInsightDefinition } from "@gooddata/sdk-model";
import { type IGeoLayerArea, type IGeoLayerPushpin } from "@gooddata/sdk-ui-geo";

import type * as GeoAreaChartDescriptorModule from "../geoAreaChart/GeoAreaChartDescriptor.js";

import type * as GeoEmbeddingLayersModule from "./geoEmbeddingLayers.js";
import type * as GeoPushpinChartNextDescriptorModule from "./GeoPushpinChartNextDescriptor.js";

vi.mock("./geoEmbeddingLayers.js", () => ({
    buildGeoChartNextLayers: vi.fn(),
    buildGeoChartNextGlobalFilters: vi.fn(() => []),
}));

/*
 * Test isolation is disabled for this package, so the module cache is shared between test files: the
 * descriptors may already have been evaluated - bound to the real geoEmbeddingLayers - by another test file,
 * and the mocked graph this file builds must not outlive it (VisualizationCatalog's embedding-code snapshots
 * exercise the same descriptors against the real layer builder). Re-import all three modules up front so
 * this file always observes the mocked one, and drop the mocked graph again on the way out.
 */
let buildGeoChartNextLayersMock: MockedFunction<typeof GeoEmbeddingLayersModule.buildGeoChartNextLayers>;
let areaDescriptor: GeoAreaChartDescriptorModule.GeoAreaChartDescriptor;
let pushpinDescriptor: GeoPushpinChartNextDescriptorModule.GeoPushpinChartNextDescriptor;

describe("Geo embedding code layers", () => {
    const dummyInsight = newInsightDefinition("local:geoInsight");

    beforeAll(async () => {
        vi.resetModules();
        const { buildGeoChartNextLayers } = await import("./geoEmbeddingLayers.js");
        const { GeoAreaChartDescriptor } = await import("../geoAreaChart/GeoAreaChartDescriptor.js");
        const { GeoPushpinChartNextDescriptor } = await import("./GeoPushpinChartNextDescriptor.js");

        buildGeoChartNextLayersMock = buildGeoChartNextLayers as unknown as MockedFunction<
            typeof GeoEmbeddingLayersModule.buildGeoChartNextLayers
        >;
        areaDescriptor = new GeoAreaChartDescriptor();
        pushpinDescriptor = new GeoPushpinChartNextDescriptor();
    });

    afterAll(() => {
        vi.resetModules();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("generates GeoChart with layers for Geo Area descriptor", () => {
        const areaLayer: IGeoLayerArea = {
            id: "primary",
            type: "area",
            area: newAttribute("label.area", (attribute) => attribute.localId("area")),
        };
        buildGeoChartNextLayersMock.mockReturnValue([areaLayer]);

        const code = areaDescriptor.getEmbeddingCode(dummyInsight);

        expect(code).toContain("<GeoChart");
        expect(code).toContain("const layers");
        expect(code).toContain('const type = "area"');
    });

    it("generates GeoChart with layers for Geo Pushpin descriptor", () => {
        const pushpinLayer: IGeoLayerPushpin = {
            id: "primary",
            type: "pushpin",
            latitude: newAttribute("label.lat", (attribute) => attribute.localId("lat")),
            longitude: newAttribute("label.lng", (attribute) => attribute.localId("lng")),
        };
        buildGeoChartNextLayersMock.mockReturnValue([pushpinLayer]);

        const code = pushpinDescriptor.getEmbeddingCode(dummyInsight);

        expect(code).toContain("<GeoChart");
        expect(code).toContain("const layers");
        expect(code).toContain('const type = "pushpin"');
    });

    it("returns empty string if no layers can be generated", () => {
        buildGeoChartNextLayersMock.mockReturnValue([]);

        const code = areaDescriptor.getEmbeddingCode(dummyInsight);

        expect(code).toBe("");
    });
});
