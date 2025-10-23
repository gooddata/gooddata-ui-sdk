// (C) 2025 GoodData Corporation

import { partial } from "lodash-es";
import type {
    CircleLayerSpecification,
    ExpressionSpecification,
    FilterSpecification,
    SymbolLayerSpecification,
} from "maplibre-gl";

import { BucketNames } from "@gooddata/sdk-ui";

import { DEFAULT_CLUSTER_FILTER, DEFAULT_CLUSTER_LABELS_CONFIG } from "./maplibreConfig.js";
import {
    DEFAULT_CLUSTER_LAYER_NAME,
    DEFAULT_LAYER_NAME,
    DEFAULT_PUSHPIN_BORDER_COLOR_VALUE,
    DEFAULT_PUSHPIN_OPTIONS,
    EMPTY_SEGMENT_VALUE,
    PUSHPIN_SIZE_OPTIONS_MAP,
    PUSHPIN_STYLE_CIRCLE,
    PUSHPIN_STYLE_CIRCLE_COLOR,
    PUSHPIN_STYLE_CIRCLE_SIZE,
    PUSHPIN_STYLE_CIRCLE_STROKE_COLOR,
} from "../../constants/geoChart.js";
import { getMinMax } from "../../features/size/calculations.js";
import { IGeoPointsConfigNext, IGeoPushpinChartNextConfig } from "../../types/config.js";
import { IGeoData } from "../../types/shared.js";

const DEFAULT_CLUSTER_POINT_BORDERS = {
    "circle-stroke-color": [
        "step",
        ["get", "point_count"],
        "#00D398", // point count is less than 10
        10,
        "#F38700", // point count is between 10 and 100
        100,
        "#E84C3C", // point count is greater than or equal to 100
    ] as ExpressionSpecification,
    "circle-stroke-opacity": 0.2,
    "circle-stroke-width": 8,
};

const DEFAULT_CLUSTER_POINT_COLORS = [
    "step",
    ["get", "point_count"],
    "#00D398", // point count is less than 10
    10,
    "#F38700", // point count is between 10 and 100
    100,
    "#E84C3C", // point count is greater than or equal to 100
];

const DEFAULT_CLUSTER_POINT_SIZES: ExpressionSpecification = [
    "step",
    ["get", "point_count"],
    15, // point count is less than 100
    100,
    25, // point count is greater than or equal to 100
];

/**
 * Helper function to calculate point size in geometric progression
 *
 * @param minSizeInPixel - Minimum size in pixels
 * @param base - Base for geometric progression
 * @param exponent - Exponent for progression
 * @returns Calculated point size
 *
 * @internal
 */
function getPointSize(minSizeInPixel: number, base: number, exponent: number): number {
    const stepValue = minSizeInPixel * Math.pow(base, exponent);
    return parseFloat(stepValue.toFixed(2));
}

/**
 * Creates pushpin size options based on data distribution
 *
 * @param geoData - Geographic data containing size information
 * @param geoPointsConfig - Configuration for point sizing
 * @returns MapLibre expression for data-driven sizing or constant radius
 *
 * @internal
 */
function createPushpinSizeOptions(
    geoData: IGeoData,
    geoPointsConfig: IGeoPointsConfigNext,
): ExpressionSpecification | number {
    const { size } = geoData;
    const defaultRadius = PUSHPIN_SIZE_OPTIONS_MAP.min.default / 2;

    if (size === undefined || size.data.length === 0) {
        return defaultRadius;
    }

    const { min: minSizeFromData, max: maxSizeFromData } = getMinMax(size.data);
    if (maxSizeFromData === minSizeFromData) {
        return defaultRadius;
    }

    const { minSize: minSizeFromConfig = "default", maxSize: maxSizeFromConfig = "default" } =
        geoPointsConfig || {};
    const minSizeInPixel = PUSHPIN_SIZE_OPTIONS_MAP.min[minSizeFromConfig];
    const maxSizeInPixel = PUSHPIN_SIZE_OPTIONS_MAP.max[maxSizeFromConfig];
    const base = Math.pow(maxSizeInPixel / minSizeInPixel, 0.25);
    const getStopPointSize = partial(getPointSize, minSizeInPixel, base);

    // The mouseenter event uses queryRenderedFeatures to determine when the mouse is touching a feature
    // And queryRenderedFeatures is not supporting nested object in expression
    // https://github.com/mapbox/mapbox-gl-js/issues/7194
    return [
        "step",
        ["get", "pushpinSize"],
        Math.round(minSizeInPixel / 2), // a
        getStopPointSize(1),
        Math.round(getStopPointSize(1) / 2), // ar^1
        getStopPointSize(2),
        Math.round(getStopPointSize(2) / 2), // ar^2
        getStopPointSize(3),
        Math.round(getStopPointSize(3) / 2), // ar^3
        maxSizeInPixel,
        Math.round(maxSizeInPixel / 2), // ar^4
    ] as ExpressionSpecification;
}

/**
 * Creates a filter expression for pushpins based on selected segment items
 *
 * @param selectedSegmentItems - Array of segment URIs to show
 * @returns MapLibre expression for filtering
 *
 * @alpha
 */
export function createPushpinFilter(selectedSegmentItems: string[]): FilterSpecification {
    return [
        "match",
        ["get", "uri", ["get", BucketNames.SEGMENT]],
        selectedSegmentItems.length ? selectedSegmentItems : [EMPTY_SEGMENT_VALUE],
        true,
        false,
    ] as FilterSpecification; // true/false are the output values
}

/**
 * Creates the main pushpin data layer for non-clustered visualization
 *
 * @param dataSourceName - Name of the GeoJSON data source
 * @param geoData - Geographic data for size calculations
 * @param config - Geo chart configuration
 * @returns MapLibre circle layer specification
 *
 * @alpha
 */
export function createPushpinDataLayer(
    dataSourceName: string,
    geoData: IGeoData,
    config: IGeoPushpinChartNextConfig,
): CircleLayerSpecification {
    const { selectedSegmentItems = [], points: geoPointsConfig = {} } = config || {};
    const layer: CircleLayerSpecification = {
        id: DEFAULT_LAYER_NAME,
        type: PUSHPIN_STYLE_CIRCLE,
        source: dataSourceName,
        paint: {
            ...DEFAULT_PUSHPIN_OPTIONS,
            // Use data-driven styling from flattened feature properties
            [PUSHPIN_STYLE_CIRCLE_COLOR]: ["coalesce", ["get", "color_background"], "rgba(20,178,226,0.7)"],
            [PUSHPIN_STYLE_CIRCLE_STROKE_COLOR]: ["coalesce", ["get", "color_border"], "rgb(233,237,241)"],
            [PUSHPIN_STYLE_CIRCLE_SIZE]: createPushpinSizeOptions(geoData, geoPointsConfig),
        },
    };
    if (selectedSegmentItems.length > 0) {
        layer.filter = createPushpinFilter(selectedSegmentItems);
    }
    return layer;
}

/**
 * Create layer for clustered points/pins which have 'properties.point_count' indicates number of same points is clustered together
 *
 * @param dataSourceName - Name of the GeoJSON data source
 * @returns MapLibre circle layer specification for clusters
 *
 * @alpha
 */
export function createClusterPoints(dataSourceName: string): CircleLayerSpecification {
    return {
        id: DEFAULT_CLUSTER_LAYER_NAME,
        type: PUSHPIN_STYLE_CIRCLE,
        source: dataSourceName,
        filter: DEFAULT_CLUSTER_FILTER as FilterSpecification,
        paint: {
            ...DEFAULT_CLUSTER_POINT_BORDERS,
            [PUSHPIN_STYLE_CIRCLE_COLOR]: DEFAULT_CLUSTER_POINT_COLORS as ExpressionSpecification,
            [PUSHPIN_STYLE_CIRCLE_SIZE]: DEFAULT_CLUSTER_POINT_SIZES as ExpressionSpecification,
        },
    };
}

/**
 * Create layer for cluster labels which indicate number of points/pins is clustered
 *
 * @param dataSourceName - Name of the GeoJSON data source
 * @returns MapLibre symbol layer specification for cluster labels
 *
 * @alpha
 */
export function createClusterLabels(dataSourceName: string): SymbolLayerSpecification {
    return {
        ...DEFAULT_CLUSTER_LABELS_CONFIG,
        source: dataSourceName,
        filter: DEFAULT_CLUSTER_FILTER as FilterSpecification,
    };
}

/**
 * Create layer for un-clustered points which are not close to others
 *
 * @param dataSourceName - Name of the GeoJSON data source
 * @returns MapLibre circle layer specification for unclustered points
 *
 * @alpha
 */
export function createUnclusterPoints(dataSourceName: string): CircleLayerSpecification {
    return {
        id: DEFAULT_LAYER_NAME,
        type: PUSHPIN_STYLE_CIRCLE,
        source: dataSourceName,
        filter: ["!", DEFAULT_CLUSTER_FILTER] as FilterSpecification,
        paint: {
            ...DEFAULT_PUSHPIN_OPTIONS,
            [PUSHPIN_STYLE_CIRCLE_COLOR]: ["get", "background", ["get", "color"]] as ExpressionSpecification,
            [PUSHPIN_STYLE_CIRCLE_STROKE_COLOR]: DEFAULT_PUSHPIN_BORDER_COLOR_VALUE,
            [PUSHPIN_STYLE_CIRCLE_SIZE]: 4,
        },
    };
}
