// (C) 2020-2025 GoodData Corporation
import type mapboxgl from "mapbox-gl";
import { describe, expect, it } from "vitest";

import { type IGeoConfig, type IGeoConfigViewportArea, type IGeoLngLat } from "../../../../../GeoChart.js";
import { getLngLatBounds, getViewportOptions } from "../viewport.js";

describe("viewport", () => {
    describe("getViewportOptions", () => {
        const DEFAULT_CONFIG: IGeoConfig = { mapboxToken: "" };

        it("should return center if it exists", () => {
            const center: IGeoLngLat = {
                lat: 1,
                lng: 2,
            };
            const data: IGeoLngLat[] = [];
            const config: IGeoConfig = {
                ...DEFAULT_CONFIG,
                center,
                viewport: {
                    area: "world",
                },
            };
            expect(getViewportOptions(data, config)).toEqual({
                center,
                zoom: 2, // default zoom
            });
        });

        const Scenarios: Array<[IGeoConfigViewportArea, mapboxgl.LngLatBoundsLike]> = [
            [
                "auto",
                [
                    {
                        lat: 3,
                        lng: 6,
                    },
                    {
                        lat: 1,
                        lng: 5,
                    },
                ],
            ],
            [
                "continent_af",
                [
                    {
                        lat: -36,
                        lng: -20,
                    },
                    {
                        lat: 38,
                        lng: 54,
                    },
                ],
            ],
            [
                "continent_as",
                [
                    {
                        lat: -8,
                        lng: 26,
                    },
                    {
                        lat: 64,
                        lng: 146,
                    },
                ],
            ],
            [
                "continent_au",
                [
                    {
                        lat: -50,
                        lng: 107,
                    },
                    {
                        lat: 0,
                        lng: 180,
                    },
                ],
            ],
            [
                "continent_eu",
                [
                    {
                        lat: 36,
                        lng: -24,
                    },
                    {
                        lat: 72,
                        lng: 43,
                    },
                ],
            ],
            [
                "continent_na",
                [
                    {
                        lat: 11,
                        lng: -170,
                    },
                    {
                        lat: 72,
                        lng: -52,
                    },
                ],
            ],
            [
                "continent_sa",
                [
                    {
                        lat: -56,
                        lng: -90,
                    },
                    {
                        lat: 14,
                        lng: -31,
                    },
                ],
            ],
            [
                "world",
                [
                    {
                        lat: -84,
                        lng: -180,
                    },
                    {
                        lat: 84,
                        lng: 180,
                    },
                ],
            ],
        ];

        it.each(Scenarios)(
            "should return bounds for %s",
            (area: IGeoConfigViewportArea, expectedBounds: mapboxgl.LngLatBoundsLike) => {
                const data: IGeoLngLat[] = [
                    { lat: 1, lng: 5 },
                    { lat: 3, lng: 6 },
                ];
                const config: IGeoConfig = {
                    ...DEFAULT_CONFIG,
                    viewport: {
                        area,
                    },
                };
                expect(getViewportOptions(data, config)).toEqual({
                    bounds: expectedBounds,
                });
            },
        );

        it("should return bounds for all data", () => {
            const data: IGeoLngLat[] = [
                { lat: 1, lng: 5 },
                { lat: 3, lng: 6 },
            ];
            expect(getViewportOptions(data, DEFAULT_CONFIG)).toEqual({
                bounds: [
                    {
                        lat: 3,
                        lng: 6,
                    },
                    {
                        lat: 1,
                        lng: 5,
                    },
                ],
            });
        });

        it("should return default center if there is no data", () => {
            const data: IGeoLngLat[] = [];
            expect(getViewportOptions(data, DEFAULT_CONFIG)).toEqual({
                center: {
                    lat: 34,
                    lng: 5,
                },
                zoom: 2,
            });
        });
    });

    describe("getLngLatBounds", () => {
        it("should return undefined", () => {
            const lnglats: IGeoLngLat[] = [];
            expect(getLngLatBounds(lnglats)).toEqual(undefined);
        });

        it("should return default World viewport with all empty coordinates", () => {
            // @ts-expect-error Testing possible inputs not allowed by types but possible if used from JavaScript
            const lnglats: IGeoLngLat[] = [null, null];
            expect(getLngLatBounds(lnglats)).toEqual({
                northEast: { lat: -84, lng: -180 },
                southWest: { lat: 84, lng: 180 },
            });
        });

        it("should return bounds for one point", () => {
            const lnglats: IGeoLngLat[] = [
                {
                    lat: -89.5,
                    lng: 44.5,
                },
            ];
            expect(getLngLatBounds(lnglats)).toEqual({
                northEast: {
                    lat: -89.5,
                    lng: 44.5,
                },
                southWest: {
                    lat: -89.5,
                    lng: 44.5,
                },
            });
        });

        it("should return bounds for many points", () => {
            const lnglats: IGeoLngLat[] = [
                {
                    lat: -89.5,
                    lng: 44.5,
                },
                {
                    lat: -80.5,
                    lng: 39.0,
                },
            ];
            expect(getLngLatBounds(lnglats)).toEqual({
                northEast: {
                    lat: -80.5,
                    lng: 44.5,
                },
                southWest: {
                    lat: -89.5,
                    lng: 39,
                },
            });
        });

        it("should return bounds for some null points", () => {
            const lnglats: Array<IGeoLngLat | null> = [
                {
                    lat: -89.5,
                    lng: 44.5,
                },
                null,
                {
                    lat: -80.5,
                    lng: 39.0,
                },
                null,
            ];
            // @ts-expect-error Testing possible inputs not allowed by types but possible if used from JavaScript
            const result = getLngLatBounds(lnglats);
            expect(result).toEqual({
                northEast: {
                    lat: -80.5,
                    lng: 44.5,
                },
                southWest: {
                    lat: -89.5,
                    lng: 39,
                },
            });
        });
    });
});
