// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { emptyDef } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { IGeoLayerData } from "../../context/GeoLayersContext.js";
import { computeCombinedViewport } from "../../map/viewport.js";

const baseLayerColorStrategy: IColorStrategy = {
    getColorAssignment: () => [],
    getFullColorAssignment: () => [],
    getColorByIndex: () => "#000000",
};

const baseLayer: Omit<IGeoLayerData, "initialViewport"> = {
    layerId: "base",
    layerType: "pushpin",
    geoData: null,
    source: null,
    dataView: DataViewFacade.for(dummyDataView(emptyDef("workspace"))),
    colorStrategy: baseLayerColorStrategy,
    baseLegendItems: [],
    availableLegends: {
        hasCategoryLegend: false,
        hasColorLegend: false,
        hasSizeLegend: false,
    },
};

describe("computeCombinedViewport", () => {
    it("merges bounds across layers", () => {
        const layers = new Map<string, IGeoLayerData>([
            [
                "l1",
                {
                    ...baseLayer,
                    layerId: "l1",
                    initialViewport: {
                        bounds: {
                            southWest: { lng: -10, lat: 0 },
                            northEast: { lng: 0, lat: 10 },
                        },
                    },
                },
            ],
            [
                "l2",
                {
                    ...baseLayer,
                    layerId: "l2",
                    initialViewport: {
                        bounds: {
                            southWest: { lng: 5, lat: -5 },
                            northEast: { lng: 15, lat: 5 },
                        },
                    },
                },
            ],
        ]);

        const combined = computeCombinedViewport(layers);

        expect(combined?.bounds?.southWest).toEqual({ lng: -10, lat: -5 });
        expect(combined?.bounds?.northEast).toEqual({ lng: 15, lat: 10 });
    });

    it("falls back to first viewport when no bounds exist", () => {
        const fallbackViewport = { center: { lat: 1, lng: 2 }, zoom: 3 };
        const layers = new Map<string, IGeoLayerData>([
            [
                "l1",
                {
                    ...baseLayer,
                    layerId: "l1",
                    initialViewport: fallbackViewport,
                },
            ],
            [
                "l2",
                {
                    ...baseLayer,
                    layerId: "l2",
                    initialViewport: null,
                },
            ],
        ]);

        const combined = computeCombinedViewport(layers);

        expect(combined).toEqual(fallbackViewport);
    });
});
