// (C) 2025 GoodData Corporation

import type { LngLatBoundsLike, MapOptions, PopupOptions } from "maplibre-gl";

import { IGeoLngLat } from "../../types/shared.js";

/**
 * Type for viewport definitions
 */
type IGeoViewports = {
    [key: string]: LngLatBoundsLike;
};

/**
 * Default world bounds for the map viewport
 *
 * @alpha
 */
export const DEFAULT_WORLD_BOUNDS = { northEast: { lat: 84, lng: 180 }, southWest: { lat: -84, lng: -180 } };

/**
 * Predefined viewport areas for different continents and world view
 *
 * @alpha
 */
export const VIEWPORTS: IGeoViewports = {
    continent_af: [
        { lat: -36, lng: -20 },
        { lat: 38, lng: 54 },
    ], // Africa
    continent_as: [
        { lat: -8, lng: 26 },
        { lat: 64, lng: 146 },
    ], // Asia
    continent_au: [
        { lat: -50, lng: 107 },
        { lat: 0, lng: 180 },
    ], // Australia + NZ
    continent_eu: [
        { lat: 36, lng: -24 },
        { lat: 72, lng: 43 },
    ], // Europe
    continent_na: [
        { lat: 11, lng: -170 },
        { lat: 72, lng: -52 },
    ], // North America
    continent_sa: [
        { lat: -56, lng: -90 },
        { lat: 14, lng: -31 },
    ], // South America
    world: [DEFAULT_WORLD_BOUNDS.southWest, DEFAULT_WORLD_BOUNDS.northEast], // World
};

/**
 * Filter for identifying clustered points
 *
 * @alpha
 */
export const DEFAULT_CLUSTER_FILTER = ["has", "point_count"];

/**
 * Configuration for cluster labels layer
 *
 * @alpha
 */
export const DEFAULT_CLUSTER_LABELS_CONFIG = {
    id: "gdcClusterLabels",
    type: "symbol" as const,
    layout: {
        "text-allow-overlap": true,
        "text-field": "{point_count_abbreviated}",
        // "text-font": ["Open Sans Semibold"], // Commented out to allow MapLibre to use style's default fonts
        "text-size": 14,
    },
    paint: {
        "text-color": "#fff",
    },
};

const DEFAULT_LATITUDE: number = 34;
const DEFAULT_LONGITUDE: number = 5;
export const DEFAULT_ZOOM: number = 2;
export const DEFAULT_CENTER: IGeoLngLat = {
    lat: DEFAULT_LATITUDE,
    lng: DEFAULT_LONGITUDE,
};

/**
 * Default MapLibre map options
 *
 * @alpha
 */
export const DEFAULT_MAPLIBRE_OPTIONS: Partial<MapOptions> = {
    // hide maplibre's information on map
    attributionControl: false,
    // If false, the "drag to rotate" interaction is disabled
    dragRotate: false,
    // set maxDuration: 1 will remove the animation when viewport is changed
    fitBoundsOptions: { padding: 45, maxDuration: 1 },
    // Disable infinite geochart scrolling
    // maxBounds: VIEWPORTS["world"] as LngLatBoundsLike,
    // The maximum zoom level of the map (0-24).
    maxZoom: 8,
    // If false, the map's pitch (tilt) control with "drag to rotate" interaction will be disabled.
    pitchWithRotate: false,
    // Disable infinite geochart scrolling
    renderWorldCopies: false,
    // If false, the "pinch to rotate and zoom" interaction is disabled
    touchZoomRotate: false,
};

/**
 * Default tooltip popup options
 *
 * @alpha
 */
export const DEFAULT_TOOLTIP_OPTIONS: PopupOptions = {
    closeButton: false,
    closeOnClick: false,
    offset: 10,
};
