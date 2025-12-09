// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import type { IAreaGeoData } from "../../../types/geoData/area.js";
import { createAreaDataSource } from "../source.js";

const colorStrategyMock: IColorStrategy = {
    getColorAssignment: () => [],
    getFullColorAssignment: () => [],
    getColorByIndex: () => "rgb(255,0,0)",
};

const testGeoData: IAreaGeoData = {
    area: {
        name: "Country",
        index: 0,
        data: ["US"],
        uris: ["/gdc/md/1/obj/1?id=1"],
    },
    color: {
        name: "Revenue",
        index: 0,
        data: [100],
        format: "#,##0",
    },
    segment: {
        name: "Region",
        index: 0,
        data: ["East"],
        uris: ["/gdc/md/1/obj/2?id=1"],
    },
};

const testBoundaryFeatures = [
    {
        type: "Feature" as const,
        id: "US",
        geometry: {
            type: "Polygon" as const,
            coordinates: [
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [0, 0],
                ],
            ],
        },
        properties: {
            areaId: "US",
        },
    },
];

describe("createAreaDataSource", () => {
    it("creates source with transformed features", () => {
        const source = createAreaDataSource({
            geoData: testGeoData,
            colorStrategy: colorStrategyMock,
            config: {},
            features: testBoundaryFeatures,
        });

        expect(source.type).toBe("geojson");
        const data = source.data;
        if (!data || typeof data === "string" || data.type !== "FeatureCollection") {
            throw new Error("Expected FeatureCollection data");
        }
        expect(data.features).toHaveLength(1);
        const feature = data.features[0];
        expect(feature.geometry?.type).toBe("Polygon");
        expect(feature.properties?.["areaId"]).toBe("US");
        expect(feature.properties?.["segment"]).toEqual({
            title: "Region",
            value: "East",
            uri: "/gdc/md/1/obj/2?id=1",
        });
    });
});
