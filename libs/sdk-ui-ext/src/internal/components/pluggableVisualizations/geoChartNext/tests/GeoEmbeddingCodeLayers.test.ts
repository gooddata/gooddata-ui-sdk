// (C) 2025-2026 GoodData Corporation

import { type MockedFunction, beforeEach, describe, expect, it, vi } from "vitest";

import { newAttribute, newInsightDefinition } from "@gooddata/sdk-model";
import { type IGeoLayerArea, type IGeoLayerPushpin } from "@gooddata/sdk-ui-geo";

import { GeoAreaChartDescriptor } from "../../geoAreaChart/GeoAreaChartDescriptor.js";
import { buildGeoChartNextLayers } from "../geoEmbeddingLayers.js";
import { GeoPushpinChartNextDescriptor } from "../GeoPushpinChartNextDescriptor.js";

vi.mock("../geoEmbeddingLayers.js", () => ({
    buildGeoChartNextLayers: vi.fn(),
    buildGeoChartNextGlobalFilters: vi.fn(() => []),
}));

const buildGeoChartNextLayersMock = buildGeoChartNextLayers as unknown as MockedFunction<
    typeof buildGeoChartNextLayers
>;

describe("Geo embedding code layers", () => {
    const areaDescriptor = new GeoAreaChartDescriptor();
    const pushpinDescriptor = new GeoPushpinChartNextDescriptor();
    const dummyInsight = newInsightDefinition("local:geoInsight");

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
