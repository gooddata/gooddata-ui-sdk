// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import type { IGeoLayerData } from "../../../context/GeoLayersContext.js";
import type { IGeoLegendItem } from "../../../types/common/legends.js";
import type { IPushpinGeoData } from "../../../types/geoData/pushpin.js";
import type { GeoJSONSourceSpecification } from "../../common/mapFacade.js";
import { buildOutputFromLayerData } from "../output.js";

const testSource: GeoJSONSourceSpecification = {
    type: "geojson",
    data: {
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: { type: "Point", coordinates: [0, 0] }, properties: {} }],
    },
};

function createLayerData(overrides: Partial<IGeoLayerData> = {}): IGeoLayerData {
    return {
        layerId: "test",
        layerType: "pushpin",
        source: testSource,
        geoData: {} as IPushpinGeoData,
        dataView: {} as any,
        colorStrategy: {} as IColorStrategy,
        baseLegendItems: [],
        availableLegends: {
            hasCategoryLegend: false,
            hasColorLegend: false,
            hasSizeLegend: false,
        },
        initialViewport: null,
        ...overrides,
    };
}

describe("buildOutputFromLayerData", () => {
    it("returns null when required data is missing", () => {
        expect(buildOutputFromLayerData(createLayerData({ geoData: null }))).toBeNull();
        expect(buildOutputFromLayerData(createLayerData({ colorStrategy: null }))).toBeNull();
        expect(buildOutputFromLayerData(createLayerData({ source: null }))).toBeNull();
    });

    it("creates a normalized output using stored source", () => {
        const legendItems: IGeoLegendItem[] = [
            {
                name: "Foo",
                uri: "foo",
                legendIndex: 0,
                color: "#000000",
                isVisible: true,
                type: "pushpin",
            },
        ];
        const availableLegends = {
            hasCategoryLegend: true,
            hasColorLegend: false,
            hasSizeLegend: false,
        };
        const output = buildOutputFromLayerData(
            createLayerData({
                baseLegendItems: legendItems,
                availableLegends,
            }),
        );

        expect(output).not.toBeNull();
        expect(output?.legend.items).toBe(legendItems);
        expect(output?.legend.available).toBe(availableLegends);
        expect(output?.source).toBe(testSource);
    });
});
