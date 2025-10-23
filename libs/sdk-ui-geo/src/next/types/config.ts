// (C) 2025 GoodData Corporation

import { IAttribute, IColorPalette } from "@gooddata/sdk-model";
import { ISeparators } from "@gooddata/sdk-ui";
import { IColorMapping } from "@gooddata/sdk-ui-vis-commons";

import { IGeoLngLat } from "./shared.js";

/**
 * @alpha
 */
export type IGeoConfigViewportAreaNext =
    | "auto" // default, Include all data
    | "continent_af" // Africa
    | "continent_as" // Asia
    | "continent_au" // Australia + NZ
    | "continent_eu" // Europe
    | "continent_na" // North America
    | "continent_sa" // South America
    | "world";

/**
 * @alpha
 */
export interface IGeoConfigViewportNext {
    area?: IGeoConfigViewportAreaNext;
    frozen?: boolean;
}

/**
 * @alpha
 */
export type PushpinSizeOptionNext = "0.5x" | "0.75x" | "normal" | "1.25x" | "1.5x" | "default";

/**
 * @alpha
 */
export interface IGeoPointsConfigNext {
    minSize?: PushpinSizeOptionNext;
    maxSize?: PushpinSizeOptionNext;
    groupNearbyPoints?: boolean;
}

/**
 * @alpha
 */
export interface IGeoLegendConfigNext {
    /**
     * Indicates whether legend should be rendered or not.
     */
    enabled?: boolean;

    /**
     * Where, relative to the chart, should the legend appear.
     */
    position?: "top" | "right" | "bottom" | "left" | "auto";

    /**
     * Turns on responsive behavior.
     *
     * @remarks
     * Legend items will be rendered horizontally on screens smaller than 767px.
     * For the popup legend must be a flag set to `autoPositionWithPopup`
     */
    responsive?: boolean | "autoPositionWithPopup";
}

/**
 * Configuration for GeoPushpinChartNext component
 *
 * @alpha
 */
export interface IGeoPushpinChartNextConfig {
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
    points?: IGeoPointsConfigNext;
    colors?: string[];
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
    showLabels?: boolean;
    cooperativeGestures?: boolean;
    enableExecutionCancelling?: boolean;
    respectLegendPosition?: boolean;
}
