// (C) 2025-2026 GoodData Corporation

import type { GeoBasemap, GeoColorScheme } from "./basemap.js";
import type { StyleSpecification } from "../../layers/common/mapFacade.js";
import { type IGeoLngLat, type IGeoLngLatBounds } from "../common/coordinates.js";
import { type IGeoPushpinChartConfig } from "../config/pushpinChart.js";
import { type IGeoChartViewportNavigation } from "../config/viewport.js";

/**
 * Configuration options for map initialization
 *
 * @internal
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
     * Navigation interaction settings for pan and zoom.
     */
    navigation?: IGeoChartViewportNavigation;

    /**
     * Enables advanced geo viewport configuration behavior.
     */
    enableGeoChartsViewportConfig?: boolean;

    /**
     * Maximum zoom level allowed on the map (0-22).
     *
     * @remarks
     * - `undefined` keeps default max zoom level
     * - `null` switches to unrestricted zoom level
     */
    maxZoom?: number | null;

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
     * Basemap identifier.
     *
     * @remarks
     * `undefined` uses the backend default basemap.
     */
    basemap?: GeoBasemap;

    /**
     * Color scheme for the map style.
     *
     * @remarks
     * `undefined` uses the backend default color scheme for the selected basemap.
     */
    colorScheme?: GeoColorScheme;
}

/**
 * Configuration for map rendering and behavior
 *
 * @remarks
 * This extends the IGeoPushpinChartConfig with additional runtime configuration options.
 *
 * @internal
 */
export interface IPushpinMapConfig extends IGeoPushpinChartConfig {
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
 * @internal
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
