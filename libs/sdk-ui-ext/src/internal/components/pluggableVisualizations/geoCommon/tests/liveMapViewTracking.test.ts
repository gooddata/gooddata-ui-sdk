// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IPushData } from "@gooddata/sdk-ui";

import { type IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import {
    type ISyncViewportContext,
    LiveMapViewTracker,
    isGeoLngLat,
    isGeoLngLatBounds,
} from "../liveMapViewTracking.js";

describe("isGeoLngLat", () => {
    it.each([
        [{ lat: 0, lng: 0 }, true],
        [{ lat: 52.52, lng: 13.4 }, true],
        [{ lat: 0, lng: 0, extra: "ok" }, true],
        [null, false],
        [undefined, false],
        ["string", false],
        [42, false],
        [{}, false],
        [{ lat: 1 }, false],
        [{ lng: 1 }, false],
        [{ lat: "1", lng: "2" }, false],
    ])("isGeoLngLat(%o) → %s", (value, expected) => {
        expect(isGeoLngLat(value)).toBe(expected);
    });
});

describe("LiveMapViewTracker.syncCustomViewportSnapshot", () => {
    function createContext(overrides?: Partial<ISyncViewportContext>) {
        const pushData = vi.fn<(data: IPushData) => void>();
        const setVisualizationProperties = vi.fn<(properties: IVisualizationProperties) => void>();
        const ctx: ISyncViewportContext = {
            environment: "analyticalDesigner",
            visualizationProperties: {
                controls: {
                    viewport: { area: "custom" },
                    center: { lat: 40, lng: -74 },
                    zoom: 3,
                },
            },
            pushData,
            setVisualizationProperties,
            ...overrides,
        };
        return { ctx, pushData, setVisualizationProperties };
    }

    it("should push updated center and zoom when they differ", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 52.52, lng: 13.4 });
        tracker.handleZoomChanged(6);

        const { ctx, pushData } = createContext();
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).toHaveBeenCalledOnce();
        const pushed = pushData.mock.calls[0][0];
        expect(pushed.ignoreUndoRedo).toBe(true);
        expect(pushed.properties?.controls?.["center"]).toEqual({ lat: 52.52, lng: 13.4 });
        expect(pushed.properties?.controls?.["zoom"]).toBe(6);
    });

    it("should update visualizationProperties via setVisualizationProperties", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 1, lng: 2 });
        tracker.handleZoomChanged(5);

        const { ctx, setVisualizationProperties } = createContext();
        tracker.syncCustomViewportSnapshot(ctx);

        expect(setVisualizationProperties).toHaveBeenCalledOnce();
        const newProps = setVisualizationProperties.mock.calls[0][0];
        expect(newProps.controls?.["center"]).toEqual({ lat: 1, lng: 2 });
        expect(newProps.controls?.["zoom"]).toBe(5);
    });

    it("should not push when environment is not analyticalDesigner", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 52.52, lng: 13.4 });
        tracker.handleZoomChanged(6);

        const { ctx, pushData } = createContext({ environment: "dashboards" });
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).not.toHaveBeenCalled();
    });

    it("should not push when viewport area is a preset", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 52.52, lng: 13.4 });
        tracker.handleZoomChanged(6);

        const { ctx, pushData } = createContext({
            visualizationProperties: {
                controls: {
                    viewport: { area: "continent_eu" },
                    center: { lat: 40, lng: -74 },
                    zoom: 3,
                },
            },
        });
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).not.toHaveBeenCalled();
    });

    it("should not push when center and zoom are within epsilon", () => {
        const tracker = new LiveMapViewTracker();
        // Simulate tiny floating-point drift
        tracker.handleCenterPositionChanged({ lat: 40.0000001, lng: -74.0000001 });
        tracker.handleZoomChanged(3.0000001);

        const { ctx, pushData } = createContext();
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).not.toHaveBeenCalled();
    });

    it("should not push when no center has been reported", () => {
        const tracker = new LiveMapViewTracker();
        // Only zoom set, no center
        tracker.handleZoomChanged(6);

        const { ctx, pushData } = createContext({
            visualizationProperties: {
                controls: {
                    viewport: { area: "custom" },
                    // No stored center either
                    zoom: 3,
                },
            },
        });
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).not.toHaveBeenCalled();
    });

    it("should not push when no zoom has been reported", () => {
        const tracker = new LiveMapViewTracker();
        // Only center set, no zoom
        tracker.handleCenterPositionChanged({ lat: 52.52, lng: 13.4 });

        const { ctx, pushData } = createContext({
            visualizationProperties: {
                controls: {
                    viewport: { area: "custom" },
                    center: { lat: 40, lng: -74 },
                    // No stored zoom either
                },
            },
        });
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).not.toHaveBeenCalled();
    });

    it("should not push when visualizationProperties is empty", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 52.52, lng: 13.4 });
        tracker.handleZoomChanged(6);

        const { ctx, pushData } = createContext({ visualizationProperties: {} });
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).not.toHaveBeenCalled();
    });

    it("should not push when controls is missing", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 52.52, lng: 13.4 });
        tracker.handleZoomChanged(6);

        const { ctx, pushData } = createContext({
            visualizationProperties: { controls: undefined },
        });
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).not.toHaveBeenCalled();
    });

    it("should preserve other controls properties in the pushed data", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 52.52, lng: 13.4 });
        tracker.handleZoomChanged(6);

        const { ctx, pushData } = createContext({
            visualizationProperties: {
                controls: {
                    viewport: { area: "custom" },
                    center: { lat: 40, lng: -74 },
                    zoom: 3,
                    someOtherSetting: "preserved",
                },
            },
        });
        tracker.syncCustomViewportSnapshot(ctx);

        const pushed = pushData.mock.calls[0][0];
        expect(pushed.properties?.controls?.["someOtherSetting"]).toBe("preserved");
    });

    it("should not mutate the original visualizationProperties", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 52.52, lng: 13.4 });
        tracker.handleZoomChanged(6);

        const originalProps = {
            controls: {
                viewport: { area: "custom" },
                center: { lat: 40, lng: -74 },
                zoom: 3,
            },
        };
        const { ctx } = createContext({ visualizationProperties: originalProps });
        tracker.syncCustomViewportSnapshot(ctx);

        // Original should be unchanged
        expect(originalProps.controls.center).toEqual({ lat: 40, lng: -74 });
        expect(originalProps.controls.zoom).toBe(3);
    });
});

describe("LiveMapViewTracker.createSyncedHandlers", () => {
    function createSyncedContext() {
        const pushData = vi.fn();
        let visualizationProperties: IVisualizationProperties = {
            controls: {
                viewport: { area: "custom" },
                center: { lat: 40, lng: -74 },
                zoom: 3,
            },
        };

        const tracker = new LiveMapViewTracker();
        const handlers = tracker.createSyncedHandlers(() => ({
            environment: "analyticalDesigner",
            visualizationProperties,
            pushData,
            setVisualizationProperties: (props: IVisualizationProperties) => {
                visualizationProperties = props;
            },
        }));

        return { tracker, pushData, handlers };
    }

    it("should call pushData when synced center handler fires", async () => {
        const { pushData, handlers } = createSyncedContext();

        handlers.handleZoomChanged(3);
        handlers.handleCenterPositionChanged({ lat: 52.52, lng: 13.4 });
        handlers.handleViewportInteractionEnded();

        expect(pushData).toHaveBeenCalled();
        const lastCall = pushData.mock.calls.at(-1)?.[0];
        expect(lastCall?.properties?.controls?.center).toEqual({ lat: 52.52, lng: 13.4 });
    });

    it("should coalesce rapid callbacks into a single pushData call", async () => {
        const { pushData, handlers } = createSyncedContext();

        // Simulate rapid pan + zoom sequence (all synchronous)
        handlers.handleCenterPositionChanged({ lat: 50, lng: 14 });
        handlers.handleCenterPositionChanged({ lat: 51, lng: 15 });
        handlers.handleZoomChanged(5);
        handlers.handleCenterPositionChanged({ lat: 52, lng: 16 });
        handlers.handleZoomChanged(7);
        handlers.handleViewportInteractionEnded();

        expect(pushData).toHaveBeenCalledOnce();
        const pushed = pushData.mock.calls[0][0];
        expect(pushed?.properties?.controls?.center).toEqual({ lat: 52, lng: 16 });
        expect(pushed?.properties?.controls?.zoom).toBe(7);
    });

    it("should include bounds in pushed data when bounds handler fires", async () => {
        const pushData = vi.fn();
        let visualizationProperties: IVisualizationProperties = {
            controls: {
                viewport: { area: "custom" },
                center: { lat: 40, lng: -74 },
                zoom: 3,
                bounds: {
                    southWest: { lat: 38, lng: -76 },
                    northEast: { lat: 42, lng: -72 },
                },
            },
        };
        const tracker = new LiveMapViewTracker();
        const handlers = tracker.createSyncedHandlers(() => ({
            environment: "analyticalDesigner",
            visualizationProperties,
            pushData,
            setVisualizationProperties: (props: IVisualizationProperties) => {
                visualizationProperties = props;
            },
        }));

        handlers.handleCenterPositionChanged({ lat: 40, lng: -74 });
        handlers.handleZoomChanged(3);
        handlers.handleBoundsChanged({
            southWest: { lat: 38, lng: -76 },
            northEast: { lat: 42, lng: -72 },
        });

        handlers.handleCenterPositionChanged({ lat: 52.52, lng: 13.4 });
        handlers.handleZoomChanged(6);
        handlers.handleBoundsChanged({
            southWest: { lat: 50, lng: 10 },
            northEast: { lat: 55, lng: 17 },
        });
        handlers.handleViewportInteractionEnded();

        expect(pushData).toHaveBeenCalledOnce();
        const pushed = pushData.mock.calls[0][0];
        expect(pushed?.properties?.controls?.bounds).toEqual({
            southWest: { lat: 50, lng: 10 },
            northEast: { lat: 55, lng: 17 },
        });
    });

    it("should keep the initial snapshot local until a user interaction ends", async () => {
        const { pushData, handlers } = createSyncedContext();

        handlers.handleCenterPositionChanged({ lat: 41, lng: -73 });
        handlers.handleZoomChanged(4);

        expect(pushData).not.toHaveBeenCalled();

        handlers.handleViewportInteractionEnded();

        expect(pushData).toHaveBeenCalledOnce();
        expect(pushData.mock.calls[0]?.[0]?.properties?.controls?.center).toEqual({
            lat: 41,
            lng: -73,
        });
        expect(pushData.mock.calls[0]?.[0]?.properties?.controls?.zoom).toBe(4);
    });
});

describe("isGeoLngLatBounds", () => {
    it.each([
        [{ northEast: { lat: 55, lng: 17 }, southWest: { lat: 50, lng: 10 } }, true],
        [null, false],
        [undefined, false],
        [{}, false],
        [{ northEast: { lat: 55, lng: 17 } }, false],
        [{ southWest: { lat: 50, lng: 10 } }, false],
        [{ northEast: { lat: "55", lng: 17 }, southWest: { lat: 50, lng: 10 } }, false],
    ])("isGeoLngLatBounds(%o) → %s", (value, expected) => {
        expect(isGeoLngLatBounds(value)).toBe(expected);
    });
});

describe("LiveMapViewTracker bounds tracking", () => {
    function createContext(overrides?: Partial<ISyncViewportContext>) {
        const pushData = vi.fn<(data: IPushData) => void>();
        const setVisualizationProperties = vi.fn<(properties: IVisualizationProperties) => void>();
        const ctx: ISyncViewportContext = {
            environment: "analyticalDesigner",
            visualizationProperties: {
                controls: {
                    viewport: { area: "custom" },
                    center: { lat: 40, lng: -74 },
                    zoom: 3,
                    bounds: {
                        southWest: { lat: 38, lng: -76 },
                        northEast: { lat: 42, lng: -72 },
                    },
                },
            },
            pushData,
            setVisualizationProperties,
            ...overrides,
        };
        return { ctx, pushData, setVisualizationProperties };
    }

    it("should push updated bounds when they differ", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 52.52, lng: 13.4 });
        tracker.handleZoomChanged(6);
        tracker.handleBoundsChanged({
            southWest: { lat: 50, lng: 10 },
            northEast: { lat: 55, lng: 17 },
        });

        const { ctx, pushData } = createContext();
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).toHaveBeenCalledOnce();
        const pushed = pushData.mock.calls[0][0];
        expect(pushed.properties?.controls?.["bounds"]).toEqual({
            southWest: { lat: 50, lng: 10 },
            northEast: { lat: 55, lng: 17 },
        });
        // Center and zoom should be stripped when bounds are present (bounds is canonical)
        expect(pushed.properties?.controls?.["center"]).toBeUndefined();
        expect(pushed.properties?.controls?.["zoom"]).toBeUndefined();
    });

    it("should not push when both center/zoom and bounds are within epsilon", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 40.0000001, lng: -74.0000001 });
        tracker.handleZoomChanged(3.0000001);
        tracker.handleBoundsChanged({
            southWest: { lat: 38.0000001, lng: -76.0000001 },
            northEast: { lat: 42.0000001, lng: -72.0000001 },
        });

        const { ctx, pushData } = createContext();
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).not.toHaveBeenCalled();
    });

    it("should not push when stored bounds already match and only center/zoom differ", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 41, lng: -73 });
        tracker.handleZoomChanged(4);
        tracker.handleBoundsChanged({
            southWest: { lat: 38, lng: -76 },
            northEast: { lat: 42, lng: -72 },
        });

        const { ctx, pushData } = createContext();
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).not.toHaveBeenCalled();
    });

    it("should push when bounds differ but center/zoom are within epsilon", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 40.0000001, lng: -74.0000001 });
        tracker.handleZoomChanged(3.0000001);
        tracker.handleBoundsChanged({
            southWest: { lat: 35, lng: -80 },
            northEast: { lat: 45, lng: -68 },
        });

        const { ctx, pushData } = createContext();
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).toHaveBeenCalledOnce();
    });

    it("should not push legacy custom viewports on initial bounds snapshot", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleCenterPositionChanged({ lat: 40.0000001, lng: -74.0000001 });
        tracker.handleZoomChanged(3.0000001);
        tracker.handleBoundsChanged({
            southWest: { lat: 35, lng: -80 },
            northEast: { lat: 45, lng: -68 },
        });

        const { ctx, pushData } = createContext({
            visualizationProperties: {
                controls: {
                    viewport: { area: "custom" },
                    center: { lat: 40, lng: -74 },
                    zoom: 3,
                },
            },
        });
        tracker.syncCustomViewportSnapshot(ctx);

        expect(pushData).not.toHaveBeenCalled();
    });

    it("should include bounds from getCurrentMapView", () => {
        const tracker = new LiveMapViewTracker();
        tracker.handleBoundsChanged({
            southWest: { lat: 50, lng: 10 },
            northEast: { lat: 55, lng: 17 },
        });

        const mapView = tracker.getCurrentMapView({
            controls: {
                center: { lat: 52, lng: 13 },
                zoom: 5,
            },
        });

        expect(mapView.bounds).toEqual({
            southWest: { lat: 50, lng: 10 },
            northEast: { lat: 55, lng: 17 },
        });
    });

    it("should not fall back to stored bounds from visualization properties", () => {
        const tracker = new LiveMapViewTracker();
        // No handleBoundsChanged called

        const mapView = tracker.getCurrentMapView({
            controls: {
                center: { lat: 52, lng: 13 },
                zoom: 5,
                bounds: {
                    southWest: { lat: 50, lng: 10 },
                    northEast: { lat: 55, lng: 17 },
                },
            },
        });

        expect(mapView.bounds).toBeUndefined();
    });
});
