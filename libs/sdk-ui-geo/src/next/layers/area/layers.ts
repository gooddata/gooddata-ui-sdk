// (C) 2025 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";

import { DEFAULT_AREA_LAYER_NAME, DEFAULT_AREA_OUTLINE_LAYER_NAME } from "./constants.js";
import { type IGeoAreaChartConfig } from "../../types/config/areaChart.js";
import type {
    FillLayerSpecification,
    FilterSpecification,
    LineLayerSpecification,
} from "../common/mapFacade.js";
import { EMPTY_SEGMENT_VALUE } from "../pushpin/constants.js";

/**
 * Creates a filter expression for geographic areas based on selected segment items.
 *
 * @remarks
 * For area charts, each feature stores ALL segment URIs it belongs to in `segment.uris`.
 * This filter checks if ANY of the selected segment URIs is present in the feature's
 * segment.uris array, showing the area if there's overlap.
 *
 * Uses MapLibre's `any` expression with `in` checks for each selected URI.
 *
 * @param selectedSegmentItems - Array of segment URIs to show
 * @returns MapLibre expression for filtering
 *
 * @alpha
 */
export function createAreaFilter(selectedSegmentItems: string[]): FilterSpecification {
    const urisToCheck = selectedSegmentItems.length ? selectedSegmentItems : [EMPTY_SEGMENT_VALUE];

    // For each selected URI, check if it's in the feature's segment.uris array
    // Show the feature if ANY selected URI matches
    const uriChecks = urisToCheck.map((uri) => [
        "in",
        uri,
        ["coalesce", ["get", "uris", ["object", ["get", BucketNames.SEGMENT]]], ["literal", []]],
    ]);

    // Use "any" to combine: show if any selected URI is in the feature's uris
    if (uriChecks.length === 1) {
        return uriChecks[0] as FilterSpecification;
    }

    return ["any", ...uriChecks] as FilterSpecification;
}

/**
 * Creates the area fill layer for areas
 *
 * @remarks
 * This layer renders filled polygons representing geographic areas (countries, regions, etc.)
 * with colors data-driven by measure values.
 *
 * @param dataSourceName - Name of the GeoJSON data source
 * @param config - Area chart configuration
 * @param layerId - Optional custom layer ID (defaults to DEFAULT_AREA_LAYER_NAME)
 * @returns MapLibre fill layer specification
 *
 * @alpha
 */
export function createAreaFillLayer(
    dataSourceName: string,
    config: IGeoAreaChartConfig,
    layerId: string = DEFAULT_AREA_LAYER_NAME,
): FillLayerSpecification {
    const { selectedSegmentItems = [], areas = {} } = config || {};
    const { fillOpacity = 0.7 } = areas;

    const layer: FillLayerSpecification = {
        id: layerId,
        type: "fill",
        source: dataSourceName,
        paint: {
            // Use data-driven styling from flattened feature properties
            "fill-color": ["coalesce", ["get", "color_fill"], "#20B2E2"],
            "fill-opacity": fillOpacity,
        },
    };

    if (selectedSegmentItems.length > 0) {
        layer.filter = createAreaFilter(selectedSegmentItems);
    }

    return layer;
}

/**
 * Creates the area outline layer for area borders
 *
 * @remarks
 * This layer renders borders around geographic areas for better visual separation.
 *
 * @param dataSourceName - Name of the GeoJSON data source
 * @param config - Area chart configuration
 * @param layerId - Optional custom layer ID (defaults to DEFAULT_AREA_OUTLINE_LAYER_NAME)
 * @returns MapLibre line layer specification
 *
 * @alpha
 */
export function createAreaOutlineLayer(
    dataSourceName: string,
    config: IGeoAreaChartConfig,
    layerId: string = DEFAULT_AREA_OUTLINE_LAYER_NAME,
): LineLayerSpecification {
    const { selectedSegmentItems = [], areas = {} } = config || {};
    const { borderColor = "#FFFFFF", borderWidth = 1 } = areas;

    const layer: LineLayerSpecification = {
        id: layerId,
        type: "line",
        source: dataSourceName,
        paint: {
            "line-color": borderColor,
            "line-width": borderWidth,
        },
    };

    if (selectedSegmentItems.length > 0) {
        layer.filter = createAreaFilter(selectedSegmentItems);
    }

    return layer;
}
