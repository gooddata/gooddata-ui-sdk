// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import type { IPushpinGeoData } from "../../../types/geoData/pushpin.js";
import { EMPTY_SEGMENT_VALUE } from "../constants.js";
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

    it("normalizes missing segment URI to empty segment value", () => {
        const geoData: IPushpinGeoData = {
            location: {
                name: "Location",
                index: 0,
                data: [{ lat: 40.7128, lng: -74.006 }],
            },
            segment: {
                name: "Region",
                index: 0,
                data: ["(empty)"],
                uris: [undefined as unknown as string],
            },
        };

        const source = createPushpinDataSource({
            geoData,
            colorStrategy: colorStrategyMock,
            config: {},
            hasClustering: false,
        });

        const data = source.data;
        if (!data || typeof data === "string" || data.type !== "FeatureCollection") {
            throw new Error("Expected FeatureCollection data");
        }

        expect(data.features[0].properties?.["segment"]).toMatchObject({
            uri: EMPTY_SEGMENT_VALUE,
        });
    });

    it("keeps measure alignment when some coordinates are invalid", () => {
        const geoData: IPushpinGeoData = {
            location: {
                name: "Location",
                index: 0,
                data: [
                    { lat: NaN, lng: 10 },
                    { lat: 40.7128, lng: -74.006 },
                ],
            },
            color: {
                name: "Amount",
                index: 1,
                data: [111, 222],
                format: "#,##0",
            },
            size: {
                name: "Population",
                index: 2,
                data: [1000, 2000],
                format: "#,##0",
            },
            tooltipText: {
                name: "City",
                index: 3,
                data: ["Invalid Row", "Valid Row"],
            },
        };

        const source = createPushpinDataSource({
            geoData,
            colorStrategy: colorStrategyMock,
            config: {},
            hasClustering: false,
        });

        const data = source.data;
        if (!data || typeof data === "string" || data.type !== "FeatureCollection") {
            throw new Error("Expected FeatureCollection data");
        }

        expect(data.features).toHaveLength(1);
        expect(data.features[0].properties?.["locationName"]).toMatchObject({ value: "Valid Row" });
        expect(data.features[0].properties?.["color"]).toMatchObject({ value: 222 });
        expect(data.features[0].properties?.["size"]).toMatchObject({ value: 2000 });
    });
});
