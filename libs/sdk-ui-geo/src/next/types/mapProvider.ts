// (C) 2025 GoodData Corporation

import type { StyleSpecification } from "maplibre-gl";

import { IGeoPushpinChartNextConfig } from "./config.js";
import { IGeoLngLat, IGeoLngLatBounds } from "./shared.js";

/**
 * Supported map event types
 *
 * @alpha
 */
export type MapEventType =
    | "click"
    | "mousemove"
    | "mouseenter"
    | "mouseleave"
    | "load"
    | "error"
    | "moveend"
    | "zoomend";

/**
 * Map event data passed to event handlers
 *
 * @alpha
 */
export interface IMapEvent {
    /**
     * Type of the event
     */
    type: MapEventType;

    /**
     * Geographic coordinates where the event occurred (if applicable)
     */
    lngLat?: IGeoLngLat;

    /**
     * Screen coordinates where the event occurred (if applicable)
     */
    point?: {
        x: number;
        y: number;
    };

    /**
     * Feature that was interacted with (if applicable)
     */
    feature?: GeoJSON.Feature;

    /**
     * Original event from the underlying map library
     */
    originalEvent?: unknown;
}

/**
 * Event handler function type for map events
 *
 * @alpha
 */
export type MapEventHandler = (event: IMapEvent) => void;

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
     * Access token for the map provider (if required)
     */
    accessToken?: string;
}

/**
 * Configuration for map rendering and behavior
 *
 * @remarks
 * This extends the IGeoPushpinChartNextConfig with additional runtime configuration options.
 *
 * @alpha
 */
export interface IMapConfig extends IGeoPushpinChartNextConfig {
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
