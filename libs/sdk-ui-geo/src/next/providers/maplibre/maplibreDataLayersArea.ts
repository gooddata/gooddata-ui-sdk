// (C) 2025 GoodData Corporation

import type { FillLayerSpecification, FilterSpecification, LineLayerSpecification } from "maplibre-gl";

import { BucketNames } from "@gooddata/sdk-ui";

import { EMPTY_SEGMENT_VALUE } from "../../constants/geoChart.js";
import { IGeoAreaChartConfig } from "../../types/areaConfig.js";

export const DEFAULT_AREA_LAYER_NAME = "gdcArea";
export const DEFAULT_AREA_OUTLINE_LAYER_NAME = "gdcAreaOutline";

/**
 * Creates a filter expression for geographic areas based on selected segment items
 *
 * @param selectedSegmentItems - Array of segment URIs to show
 * @returns MapLibre expression for filtering
 *
 * @alpha
 */
export function createAreaFilter(selectedSegmentItems: string[]): FilterSpecification {
    return [
        "match",
        ["get", "uri", ["get", BucketNames.SEGMENT]],
        selectedSegmentItems.length ? selectedSegmentItems : [EMPTY_SEGMENT_VALUE],
        true,
        false,
    ] as FilterSpecification;
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
 * @returns MapLibre fill layer specification
 *
 * @alpha
 */
export function createAreaFillLayer(
    dataSourceName: string,
    config: IGeoAreaChartConfig,
): FillLayerSpecification {
    const { selectedSegmentItems = [], areas = {} } = config || {};
    const { fillOpacity = 0.7 } = areas;

    const layer: FillLayerSpecification = {
        id: DEFAULT_AREA_LAYER_NAME,
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
 * @returns MapLibre line layer specification
 *
 * @alpha
 */
export function createAreaOutlineLayer(
    dataSourceName: string,
    config: IGeoAreaChartConfig,
): LineLayerSpecification {
    const { selectedSegmentItems = [], areas = {} } = config || {};
    const { borderColor = "#FFFFFF", borderWidth = 1 } = areas;

    const layer: LineLayerSpecification = {
        id: DEFAULT_AREA_OUTLINE_LAYER_NAME,
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
