// (C) 2026 GoodData Corporation

import {
    type IInsightDefinition,
    type IInsightLayerDefinition,
    insightBuckets,
    insightLayers,
} from "@gooddata/sdk-model";
import { type IGeoLngLat } from "@gooddata/sdk-ui-geo";

import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";

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
