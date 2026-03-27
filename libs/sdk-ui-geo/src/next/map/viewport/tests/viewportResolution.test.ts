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

    it("prefers configured area over stale center when advanced viewport config flag is omitted", () => {
        const viewport = computeViewportFromConfig(
            {
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

    it("uses area key for configured area when advanced viewport config flag is omitted", () => {
        const key = getViewportConfigKey({
            center: { lat: 40, lng: 20 },
            zoom: 4,
            viewport: { area: "auto" },
        });

        expect(key).toBe("area:auto");
    });

    it("prefers bounds over center/zoom for custom viewport", () => {
        const viewport = computeViewportFromConfig(
            {
                enableGeoChartsViewportConfig: true,
                center: { lat: 40, lng: 20 },
                zoom: 4,
                bounds: {
                    southWest: { lat: 35, lng: 15 },
                    northEast: { lat: 45, lng: 25 },
                },
                viewport: { area: "custom" },
            },
            dataViewport,
        );

        expect(viewport).toEqual({
            bounds: {
                southWest: { lat: 35, lng: 15 },
                northEast: { lat: 45, lng: 25 },
            },
        });
    });

    it("falls back to center/zoom when bounds is not present (backward compat)", () => {
        const viewport = computeViewportFromConfig(
            {
                enableGeoChartsViewportConfig: true,
                center: { lat: 40, lng: 20 },
                zoom: 4,
                viewport: { area: "custom" },
            },
            dataViewport,
        );

        expect(viewport).toEqual({
            center: { lat: 40, lng: 20 },
            zoom: 4,
        });
    });

    it("uses bounds key when bounds is present", () => {
        const key = getViewportConfigKey({
            enableGeoChartsViewportConfig: true,
            bounds: {
                southWest: { lat: 35, lng: 15 },
                northEast: { lat: 45, lng: 25 },
            },
            viewport: { area: "custom" },
        });

        expect(key).toBe("bounds:35:15:45:25");
    });

    it("concrete preset still takes priority over bounds", () => {
        const viewport = computeViewportFromConfig(
            {
                enableGeoChartsViewportConfig: true,
                bounds: {
                    southWest: { lat: 35, lng: 15 },
                    northEast: { lat: 45, lng: 25 },
                },
                viewport: { area: "continent_eu" },
            },
            dataViewport,
        );

        // Should use the preset, not the bounds
        expect(viewport?.bounds?.southWest.lat).not.toBe(35);
    });
});
