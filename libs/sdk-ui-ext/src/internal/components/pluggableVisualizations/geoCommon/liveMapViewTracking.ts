// (C) 2026 GoodData Corporation

import {
    type IInsightDefinition,
    type IInsightLayerDefinition,
    insightBuckets,
    insightLayers,
} from "@gooddata/sdk-model";
import { type IPushData, type VisualizationEnvironment } from "@gooddata/sdk-ui";
import { type IGeoLngLat } from "@gooddata/sdk-ui-geo";

import { ANALYTICAL_ENVIRONMENT } from "../../../constants/properties.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";

/**
 * Tolerance for floating-point comparison of geographic coordinates.
 * Map libraries can introduce tiny drift when reporting center position
 * (e.g. 52.52 → 52.52000000000001). Using an epsilon prevents unnecessary
 * property updates caused by insignificant rounding differences.
 *
 * @internal
 */
const GEO_COORD_EPSILON = 1e-6;

/**
 * Type guard for {@link IGeoLngLat}.
 *
 * Values coming from `visualizationProperties.controls` are loosely typed
 * (`Record<string, any>`). This guard narrows them safely.
 *
 * @internal
 */
export function isGeoLngLat(value: unknown): value is IGeoLngLat {
    return (
        typeof value === "object" &&
        value !== null &&
        "lat" in value &&
        "lng" in value &&
        typeof value.lat === "number" &&
        typeof value.lng === "number"
    );
}

/**
 * Snapshot of the current map center and zoom.
 *
 * @internal
 */
export interface ILiveMapView {
    center?: IGeoLngLat;
    zoom?: number;
}

/**
 * Context required by {@link LiveMapViewTracker.syncCustomViewportSnapshot}
 * to decide whether and how to persist the current map position.
 *
 * @internal
 */
export interface ISyncViewportContext {
    environment: VisualizationEnvironment;
    visualizationProperties: IVisualizationProperties;
    pushData: (data: IPushData) => void;
    setVisualizationProperties: (properties: IVisualizationProperties) => void;
}

/**
 * Handlers returned by {@link LiveMapViewTracker.createSyncedHandlers}.
 *
 * @internal
 */
export interface ISyncedMapHandlers {
    handleCenterPositionChanged: (center: IGeoLngLat) => void;
    handleZoomChanged: (zoom: number) => void;
}

/**
 * Mixin-like helper that tracks the live map center/zoom reported via callbacks
 * and exposes a `getCurrentMapView()` function suitable for the config panel.
 *
 * Both `PluggableGeoAreaChart` and `PluggableGeoPushpinChartNext` have identical
 * private state for this purpose. This helper encapsulates it once.
 *
 * @internal
 */
export class LiveMapViewTracker {
    private currentMapCenter?: IGeoLngLat;
    private currentMapZoom?: number;
    private insightContextKey?: string;

    readonly handleCenterPositionChanged = (center: IGeoLngLat): void => {
        this.currentMapCenter = center;
    };

    readonly handleZoomChanged = (zoom: number): void => {
        this.currentMapZoom = zoom;
    };

    getCurrentMapView(visualizationProperties: IVisualizationProperties): ILiveMapView {
        const currentCenter = this.currentMapCenter ?? visualizationProperties?.controls?.["center"];
        const currentZoom = this.currentMapZoom ?? visualizationProperties?.controls?.["zoom"];

        return {
            center: currentCenter,
            zoom: typeof currentZoom === "number" ? currentZoom : undefined,
        };
    }

    /**
     * Persists the current map center and zoom into visualization properties
     * when the viewport mode is "custom" and the environment is Analytical Designer.
     *
     * This is called after every center/zoom callback from the map component so
     * that the saved insight always reflects the user's last viewport position.
     * The `ignoreUndoRedo` flag prevents these automatic updates from polluting
     * the undo stack.
     */
    syncCustomViewportSnapshot(ctx: ISyncViewportContext): void {
        if (ctx.environment !== ANALYTICAL_ENVIRONMENT) {
            return;
        }

        const controls = ctx.visualizationProperties?.controls;
        if (controls?.["viewport"]?.area !== "custom") {
            return;
        }

        const currentMapView = this.getCurrentMapView(ctx.visualizationProperties);
        if (!isGeoLngLat(currentMapView.center) || typeof currentMapView.zoom !== "number") {
            return;
        }

        const storedCenter = controls?.["center"];
        const storedZoom = controls?.["zoom"];
        const isSameCenterAndZoom =
            isGeoLngLat(storedCenter) &&
            typeof storedZoom === "number" &&
            Math.abs(storedCenter.lat - currentMapView.center.lat) < GEO_COORD_EPSILON &&
            Math.abs(storedCenter.lng - currentMapView.center.lng) < GEO_COORD_EPSILON &&
            Math.abs(storedZoom - currentMapView.zoom) < GEO_COORD_EPSILON;

        if (isSameCenterAndZoom) {
            return;
        }

        const nextProperties: IVisualizationProperties = {
            ...ctx.visualizationProperties,
            controls: {
                ...ctx.visualizationProperties?.controls,
                center: currentMapView.center,
                zoom: currentMapView.zoom,
            },
        };

        ctx.setVisualizationProperties(nextProperties);
        ctx.pushData({
            properties: nextProperties,
            ignoreUndoRedo: true,
        });
    }

    /**
     * Returns center/zoom handlers that update the live snapshot and
     * automatically persist the viewport when conditions are met.
     *
     * The sync is coalesced via a microtask so that rapid center+zoom
     * callback pairs result in a single `pushData` call with both values.
     */
    createSyncedHandlers(getContext: () => ISyncViewportContext): ISyncedMapHandlers {
        let syncScheduled = false;
        const scheduleSync = (): void => {
            if (syncScheduled) {
                return;
            }
            syncScheduled = true;
            Promise.resolve().then(() => {
                syncScheduled = false;
                this.syncCustomViewportSnapshot(getContext());
            });
        };

        return {
            handleCenterPositionChanged: (center: IGeoLngLat): void => {
                this.handleCenterPositionChanged(center);
                scheduleSync();
            },
            handleZoomChanged: (zoom: number): void => {
                this.handleZoomChanged(zoom);
                scheduleSync();
            },
        };
    }

    /**
     * Resets the live snapshot when the insight configuration changes.
     * This ensures that stale center/zoom values from a previous render cycle
     * are not returned via `getCurrentMapView()`.
     */
    resetIfInsightChanged(insight: IInsightDefinition): void {
        const nextInsightContextKey = JSON.stringify({
            buckets: insightBuckets(insight),
            layers: getLayerStructure(insightLayers(insight)),
        });

        if (this.insightContextKey === nextInsightContextKey) {
            return;
        }

        this.insightContextKey = nextInsightContextKey;
        this.currentMapCenter = undefined;
        this.currentMapZoom = undefined;
    }
}

/**
 * Accessors that let {@link createSyncedViewportHandlers} read/write the
 * chart state it needs without requiring public access to protected fields.
 *
 * @internal
 */
export interface IGeoChartAccessors {
    getEnvironment: () => string;
    getVisualizationProperties: () => IVisualizationProperties;
    setVisualizationProperties: (properties: IVisualizationProperties) => void;
    pushData: (data: IPushData) => void;
}

/**
 * Creates synced viewport handlers for a pluggable geo chart.
 *
 * This is a convenience wrapper around {@link LiveMapViewTracker.createSyncedHandlers}
 * that builds the {@link ISyncViewportContext} from accessor functions, eliminating
 * identical boilerplate in `PluggableGeoAreaChart` and `PluggableGeoPushpinChartNext`.
 *
 * @internal
 */
export function createSyncedViewportHandlers(
    tracker: LiveMapViewTracker,
    accessors: IGeoChartAccessors,
): ISyncedMapHandlers {
    return tracker.createSyncedHandlers(() => ({
        environment: accessors.getEnvironment() as VisualizationEnvironment,
        visualizationProperties: accessors.getVisualizationProperties(),
        pushData: accessors.pushData,
        setVisualizationProperties: accessors.setVisualizationProperties,
    }));
}

function getLayerStructure(layers: IInsightLayerDefinition[]): Array<{
    id: string;
    type: string;
    buckets: IInsightLayerDefinition["buckets"];
}> {
    return layers.map(({ id, type, buckets }) => ({
        id,
        type,
        buckets,
    }));
}
