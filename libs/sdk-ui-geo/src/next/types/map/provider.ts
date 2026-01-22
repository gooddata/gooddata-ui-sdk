// (C) 2025-2026 GoodData Corporation

import type { GeoTileset } from "./tileset.js";
import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import { type IGeoLngLat, type IGeoLngLatBounds } from "../common/coordinates.js";
import { type IGeoPushpinChartNextConfig } from "../config/pushpinChart.js";

/**
 * Configuration options for map initialization
 *
 * @alpha
 */
export interface IMapOptions {
    /**
     * HTML container element for the map
     */
    container: HTMLElement;

    /**
     * Initial center position of the map
     */
    center?: IGeoLngLat;

    /**
     * Initial zoom level (0-22)
     */
    zoom?: number;

    /**
     * Initial bounds to fit the map to
     */
    bounds?: IGeoLngLatBounds;

    /**
     * Maximum zoom level allowed on the map (0-22).
     */
    maxZoom?: number;

    /**
     * Whether the map should be interactive (pan, zoom, etc.)
     */
    interactive?: boolean;

    /**
     * Whether the map canvas should preserve the drawing buffer.
     *
     * When enabled, the WebGL canvas can be captured (for example during visual exports).
     */
    preserveDrawingBuffer?: boolean;

    /**
     * Whether to enable cooperative gestures (requires modifier key for scroll zoom)
     */
    cooperativeGestures?: boolean;

    /**
     * Map style URL or style object (provider-specific)
     */
    style?: string | StyleSpecification;

    /**
     * Basemap tileset identifier.
     */
    tileset: GeoTileset;
}

/**
 * Configuration for map rendering and behavior
 *
 * @remarks
 * This extends the IGeoPushpinChartNextConfig with additional runtime configuration options.
 *
 * @alpha
 */
export interface IPushpinMapConfig extends IGeoPushpinChartNextConfig {
    /**
     * Whether to show labels on map features
     */
    showLabels?: boolean;

    /**
     * Whether to enable clustering of nearby points
     */
    clusteringEnabled?: boolean;
}

/**
 * Viewport configuration for the map
 *
 * @alpha
 */
export interface IMapViewport {
    /**
     * Center position of the viewport
     */
    center: IGeoLngLat;

    /**
     * Zoom level of the viewport (0-22)
     */
    zoom: number;

    /**
     * Bounds of the viewport
     */
    bounds?: IGeoLngLatBounds;
}
