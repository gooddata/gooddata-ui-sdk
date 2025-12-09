// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { DEFAULT_DATA_POINTS_LIMIT } from "../../layers/pushpin/constants.js";
import type { IAreaGeoData } from "../../types/geoData/area.js";
import type { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import { getDataPointsLimit, validateAreaDataSize, validatePushpinDataSize } from "../dataValidation.js";

describe("dataValidation", () => {
    describe("getDataPointsLimit", () => {
        it("should return config limit when provided", () => {
            const config = { limit: 1000 };
            expect(getDataPointsLimit(config)).toBe(1000);
        });

        it("should return DEFAULT_DATA_POINTS_LIMIT when config is undefined", () => {
            expect(getDataPointsLimit(undefined)).toBe(DEFAULT_DATA_POINTS_LIMIT);
        });

        it("should return DEFAULT_DATA_POINTS_LIMIT when config.limit is undefined", () => {
            const config = {};
            expect(getDataPointsLimit(config)).toBe(DEFAULT_DATA_POINTS_LIMIT);
        });
    });

    describe("validatePushpinDataSize", () => {
        it("should detect when data exceeds limit", () => {
            const geoData: IPushpinGeoData = {
                location: {
                    name: "Location",
                    index: 0,
                    data: Array(100).fill({ lat: 0, lng: 0 }),
                },
            };

            const result = validatePushpinDataSize(geoData, 50);

            expect(result.isDataTooLarge).toBe(true);
            expect(result.actualCount).toBe(100);
            expect(result.limit).toBe(50);
        });

        it("should return false when data is within limit", () => {
            const geoData: IPushpinGeoData = {
                location: {
                    name: "Location",
                    index: 0,
                    data: Array(50).fill({ lat: 0, lng: 0 }),
                },
            };

            const result = validatePushpinDataSize(geoData, 100);

            expect(result.isDataTooLarge).toBe(false);
            expect(result.actualCount).toBe(50);
            expect(result.limit).toBe(100);
        });

        it("should handle null geoData gracefully", () => {
            const result = validatePushpinDataSize(null, 100);

            expect(result.isDataTooLarge).toBe(false);
            expect(result.actualCount).toBe(0);
            expect(result.limit).toBe(100);
        });

        it("should handle missing location gracefully", () => {
            const geoData: IPushpinGeoData = {};

            const result = validatePushpinDataSize(geoData, 100);

            expect(result.isDataTooLarge).toBe(false);
            expect(result.actualCount).toBe(0);
            expect(result.limit).toBe(100);
        });
    });

    describe("validateAreaDataSize", () => {
        it("should detect when data exceeds limit", () => {
            const geoData: IAreaGeoData = {
                area: {
                    name: "Area",
                    index: 0,
                    data: Array(100).fill("region"),
                    uris: Array(100).fill("uri"),
                },
            };

            const result = validateAreaDataSize(geoData, 50);

            expect(result.isDataTooLarge).toBe(true);
            expect(result.actualCount).toBe(100);
            expect(result.limit).toBe(50);
        });

        it("should return false when data is within limit", () => {
            const geoData: IAreaGeoData = {
                area: {
                    name: "Area",
                    index: 0,
                    data: Array(50).fill("region"),
                    uris: Array(50).fill("uri"),
                },
            };

            const result = validateAreaDataSize(geoData, 100);

            expect(result.isDataTooLarge).toBe(false);
            expect(result.actualCount).toBe(50);
            expect(result.limit).toBe(100);
        });

        it("should handle null geoData gracefully", () => {
            const result = validateAreaDataSize(null, 100);

            expect(result.isDataTooLarge).toBe(false);
            expect(result.actualCount).toBe(0);
            expect(result.limit).toBe(100);
        });

        it("should handle missing area gracefully", () => {
            const geoData: IAreaGeoData = {};

            const result = validateAreaDataSize(geoData, 100);

            expect(result.isDataTooLarge).toBe(false);
            expect(result.actualCount).toBe(0);
            expect(result.limit).toBe(100);
        });
    });
});
