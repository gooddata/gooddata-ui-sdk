// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import type { IPushpinGeoData } from "../../../types/geoData/pushpin.js";
import { createPushpinDataSource } from "../source.js";

const colorStrategyMock: IColorStrategy = {
    getColorAssignment: () => [],
    getFullColorAssignment: () => [],
    getColorByIndex: () => "rgb(255,0,0)",
};

describe("createPushpinDataSource", () => {
    it("creates source with transformed features", () => {
        const geoData: IPushpinGeoData = {
            location: {
                name: "Location",
                index: 0,
                data: [{ lat: 40.7128, lng: -74.006 }],
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

        const source = createPushpinDataSource({
            geoData,
            colorStrategy: colorStrategyMock,
            config: {},
            hasClustering: false,
        });

        expect(source.type).toBe("geojson");
        const data = source.data;
        if (!data || typeof data === "string" || data.type !== "FeatureCollection") {
            throw new Error("Expected FeatureCollection data");
        }
        expect(data.features).toHaveLength(1);
        expect(data.features[0].geometry?.type).toBe("Point");
    });

    it("enables clustering when hasClustering is true", () => {
        const geoData: IPushpinGeoData = {
            location: {
                name: "Location",
                index: 0,
                data: [{ lat: 40.7128, lng: -74.006 }],
            },
        };

        const source = createPushpinDataSource({
            geoData,
            colorStrategy: colorStrategyMock,
            config: {},
            hasClustering: true,
        });

        expect(source.cluster).toBe(true);
        expect(source.clusterMaxZoom).toBeDefined();
        expect(source.clusterRadius).toBeDefined();
    });
});
