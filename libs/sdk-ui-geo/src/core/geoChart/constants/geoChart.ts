// (C) 2019-2023 GoodData Corporation
import mapboxgl from "mapbox-gl";
import { IGeoLngLat, IGeoViewports } from "../../../GeoChart.js";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { colorPaletteToColors } from "@gooddata/sdk-model";

export const DEFAULT_WORLD_BOUNDS = { northEast: { lat: -84, lng: -180 }, southWest: { lat: 84, lng: 180 } };

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
    world: [DEFAULT_WORLD_BOUNDS.northEast, DEFAULT_WORLD_BOUNDS.southWest], // World
};

export const DEFAULT_CLUSTER_FILTER = ["has", "point_count"];
export const DEFAULT_CLUSTER_LABELS_CONFIG = {
    id: "gdcClusterLabels",
    type: "symbol" as const,
    layout: {
        "text-allow-overlap": true,
        "text-field": "{point_count_abbreviated}",
        "text-font": ["Lato Bold"],
        "text-size": 14,
    },
    paint: {
        "text-color": "#fff",
    },
};
export const DEFAULT_CLUSTER_LAYER_NAME = "gdcClusters";
export const DEFAULT_CLUSTER_MAX_ZOOM = 14; // Max zoom to cluster points on
export const DEFAULT_CLUSTER_POINT_BORDERS: mapboxgl.CirclePaint = {
    "circle-stroke-color": [
        "step",
        ["get", "point_count"],
        "#00D398", // point count is less than 10
        10,
        "#F38700", // point count is between 10 and 100
        100,
        "#E84C3C", // point count is greater than or equal to 100
    ],
    "circle-stroke-opacity": 0.2,
    "circle-stroke-width": 8,
};
export const DEFAULT_CLUSTER_POINT_COLORS: mapboxgl.Expression = [
    "step",
    ["get", "point_count"],
    "#00D398", // point count is less than 10
    10,
    "#F38700", // point count is between 10 and 100
    100,
    "#E84C3C", // point count is greater than or equal to 100
];
export const DEFAULT_CLUSTER_POINT_SIZES: mapboxgl.Expression = [
    "step",
    ["get", "point_count"],
    15, // point count is less than 100
    100,
    25, // point count is greater than or equal to 100
];

export const PUSHPIN_SIZE_OPTIONS_MAP = {
    min: {
        default: 8,
        "0.5x": 4,
        "0.75x": 6,
        normal: 8,
        "1.25x": 10,
        "1.5x": 12,
    },
    max: {
        default: 60,
        "0.5x": 30,
        "0.75x": 45,
        normal: 60,
        "1.25x": 75,
        "1.5x": 90,
    },
};
export const DEFAULT_CLUSTER_RADIUS = 50; // inside this Radius, points will be clustered (defaults to 50)

export const DEFAULT_DATA_POINTS_LIMIT = 25000;
export const DEFAULT_DATA_SOURCE_NAME = "gdcPushpinsData";
export const DEFAULT_LAYER_NAME = "gdcPushpins";

export const INTERACTION_EVENTS = [
    "scrollZoom",
    "boxZoom",
    "dragRotate",
    "dragPan",
    "keyboard",
    "doubleClickZoom",
    "touchZoomRotate",
] as const;

export const DEFAULT_COLORS: string[] = colorPaletteToColors(DefaultColorPalette);
const DEFAULT_LATITUDE: number = 34;
const DEFAULT_LONGITUDE: number = 5;
export const DEFAULT_ZOOM: number = 2;
export const DEFAULT_CENTER: IGeoLngLat = {
    lat: DEFAULT_LATITUDE,
    lng: DEFAULT_LONGITUDE,
};

export const DEFAULT_PUSHPIN_BORDER_COLOR_VALUE = "rgb(233,237,241)";

export const DEFAULT_PUSHPIN_COLOR_OPACITY = 0.7;
// 6 steps, should be lesser than 20
export const DEFAULT_PUSHPIN_COLOR_SCALE = 6;
export const DEFAULT_PUSHPIN_COLOR_VALUE = DEFAULT_COLORS[0];

export const DEFAULT_PUSHPIN_OPTIONS = {
    "circle-stroke-width": 1,
};

const DEFAULT_MAPBOX_STYLE = "mapbox://styles/gooddata/ck88ltry127yx1iql358df6xn";

export const DEFAULT_MAPBOX_OPTIONS: Partial<mapboxgl.MapboxOptions> = {
    // hide mapbox's information on map
    attributionControl: false,
    // If false , the "drag to rotate" interaction is disabled
    dragRotate: false,
    // set maxDuration: 1 will remove the animation when viewport is changed
    // to fix the flaky problem when toggle segment on World viewport
    fitBoundsOptions: { padding: 45, maxDuration: 1 },
    // Disable infinite geochart scrolling
    maxBounds: VIEWPORTS.world,
    // The maximum zoom level of the map (0-24).
    maxZoom: 14,
    // If false , the map's pitch (tilt) control with "drag to rotate" interaction will be disabled.
    pitchWithRotate: false,
    // Disable infinite geochart scrolling
    renderWorldCopies: false,
    // If false , the "pinch to rotate and zoom" interaction is disabled
    touchZoomRotate: false,
    style: DEFAULT_MAPBOX_STYLE,
};

export const DEFAULT_TOOLTIP_OPTIONS = {
    closeButton: false,
    closeOnClick: false,
    offset: 10,
};

export const PUSHPIN_STYLE_CIRCLE = "circle";
export const PUSHPIN_STYLE_CIRCLE_COLOR = "circle-color";
export const PUSHPIN_STYLE_CIRCLE_SIZE = "circle-radius";
export const PUSHPIN_STYLE_CIRCLE_STROKE_COLOR = "circle-stroke-color";
export const EMPTY_SEGMENT_VALUE = "empty-segment-filter";
export const LAYER_STYLE_LABEL_PREFIX = "-label";

export const NULL_TOOLTIP_VALUE = "-";

export const ZOOM_CONTROLS_HEIGHT = 100; // zoom control height (60xp) and its margins (20px for top and bottom respectively)
