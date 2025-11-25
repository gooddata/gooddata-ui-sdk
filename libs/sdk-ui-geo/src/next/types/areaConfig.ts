// (C) 2025 GoodData Corporation

import { IAttribute, IColorPalette } from "@gooddata/sdk-model";
import { ISeparators } from "@gooddata/sdk-ui";
import { IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { IGeoConfigViewportNext, IGeoLegendConfigNext } from "./config.js";
import { IGeoLngLat } from "./shared.js";

/**
 * Configuration for area styling in area maps
 *
 * @alpha
 */
export interface IGeoAreasConfig {
    /**
     * Opacity of filled areas (0-1)
     * @defaultValue 0.7
     */
    fillOpacity?: number;

    /**
     * Color of area borders
     * @defaultValue "#FFFFFF"
     */
    borderColor?: string;

    /**
     * Width of area borders in pixels
     * @defaultValue 1
     */
    borderWidth?: number;
}

/**
 * Configuration for GeoAreaChart component
 *
 * @alpha
 */
export interface IGeoAreaChartConfig {
    center?: IGeoLngLat;
    isExportMode?: boolean;
    legend?: IGeoLegendConfigNext;
    limit?: number;
    selectedSegmentItems?: string[];
    tooltipText?: IAttribute;
    zoom?: number; // in the 0-22 zoom range
    /**
     * Custom map style URL or style object for the base map layer
     *
     * @remarks
     * Allows configuring custom map styles, including AWS Location Service, Mapbox, MapTiler, or any
     * MapLibre-compatible style. Can be a URL string pointing to a style JSON or a style object.
     *
     * @example
     * AWS Location Service:
     * ```typescript
     * mapStyle: `https://maps.geo.us-east-1.amazonaws.com/v2/styles/Standard/descriptor?key=${API_KEY}`
     * ```
     *
     * @alpha
     */
    mapStyle?: string | object;
    separators?: ISeparators;
    viewport?: IGeoConfigViewportNext;
    areas?: IGeoAreasConfig;
    colors?: string[];
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
    showLabels?: boolean;
    cooperativeGestures?: boolean;
    enableExecutionCancelling?: boolean;
    respectLegendPosition?: boolean;
}
