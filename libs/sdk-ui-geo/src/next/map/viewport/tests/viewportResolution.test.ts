// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { computeViewportFromConfig, getViewportConfigKey } from "../viewportResolution.js";

describe("viewportResolution", () => {
    const dataViewport = {
        bounds: {
            southWest: { lng: -12, lat: -5 },
            northEast: { lng: 15, lat: 10 },
        },
    } as const;

    it("prefers concrete area preset over stale center when advanced viewport config is enabled", () => {
        const viewport = computeViewportFromConfig(
            {
                enableGeoChartsViewportConfig: true,
                center: { lat: 40, lng: 20 },
                zoom: 4,
                viewport: { area: "world" },
            },
            dataViewport,
        );

        expect(viewport).toEqual({
            bounds: {
                southWest: { lat: -84, lng: -180 },
                northEast: { lat: 84, lng: 180 },
            },
        });
    });

    it("prefers auto data viewport over stale center when advanced viewport config is enabled", () => {
        const viewport = computeViewportFromConfig(
            {
                enableGeoChartsViewportConfig: true,
                center: { lat: 40, lng: 20 },
                zoom: 4,
                viewport: { area: "auto" },
            },
            dataViewport,
        );

        expect(viewport).toEqual(dataViewport);
    });

    it("keeps legacy center precedence when advanced viewport config is disabled", () => {
        const viewport = computeViewportFromConfig(
            {
                enableGeoChartsViewportConfig: false,
                center: { lat: 40, lng: 20 },
                zoom: 4,
                viewport: { area: "world" },
            },
            dataViewport,
        );

        expect(viewport).toEqual({
            center: { lat: 40, lng: 20 },
            zoom: 4,
        });
    });

    it("uses area key for configured area when advanced viewport config is enabled", () => {
        const key = getViewportConfigKey({
            enableGeoChartsViewportConfig: true,
            center: { lat: 40, lng: 20 },
            zoom: 4,
            viewport: { area: "auto" },
        });

        expect(key).toBe("area:auto");
    });
});
