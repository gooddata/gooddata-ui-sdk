// (C) 2020-2026 GoodData Corporation

import type mapboxgl from "mapbox-gl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IAttribute, type IColorPalette, type IExecutionConfig } from "@gooddata/sdk-model";
import {
    type AttributeMeasureOrPlaceholder,
    type AttributeOrPlaceholder,
    type IDrillEventContext,
    type ISeparators,
    type IVisualizationCallbacks,
    type IVisualizationProps,
    type NullableFiltersOrPlaceholders,
    type SortsOrPlaceholders,
} from "@gooddata/sdk-ui";
import { type IColorMapping, type PositionType } from "@gooddata/sdk-ui-vis-commons";

import type {
    CenterPositionChangedCallback,
    IGeoLngLat,
    ZoomChangedCallback,
} from "./publicTypes/geoCommon.js";

export interface IGeoTooltipItem {
    title: string;
    value: string | number;
    format?: string;
}

export interface IPushpinColor {
    border: string;
    background: string;
}

/**
 * @public
 */
export interface IGeoDataItem {
    name: string;
    index: number;
}

/**
 * @public
 */
export interface IGeoAttributeItem extends IGeoDataItem {
    data: string[];
}

/**
 * @public
 */
export interface IGeoSegmentItem extends IGeoAttributeItem {
    uris: string[];
}

/**
 * @public
 */
export interface IGeoLocationItem extends IGeoDataItem {
    data: IGeoLngLat[];
}

/**
 * @public
 */
export interface IGeoMeasureItem extends IGeoDataItem {
    format: string;
    data: number[];
}

/**
 * @public
 */
export interface IGeoData {
    location?: IGeoLocationItem;
    size?: IGeoMeasureItem;
    color?: IGeoMeasureItem;
    segment?: IGeoSegmentItem;
    tooltipText?: IGeoAttributeItem;
}

export interface IGeoViewports {
    [key: string]: mapboxgl.LngLatBoundsLike;
}

export interface IValidationResult {
    isDataTooLarge: boolean;
}

export interface IAvailableLegends {
    hasCategoryLegend: boolean;
    hasColorLegend: boolean;
    hasSizeLegend: boolean;
}

//
//
//

/**
 * @public
 */
export type IGeoConfigViewportArea =
    | "auto" // default, Include all data
    | "continent_af" // Africa
    | "continent_as" // Asia
    | "continent_au" // Australia + NZ
    | "continent_eu" // Europe
    | "continent_na" // North America
    | "continent_sa" // South America
    | "world";

/**
 * @public
 */
export interface IGeoConfigViewport {
    area?: IGeoConfigViewportArea;
    frozen?: boolean;
}

/**
 * @public
 */

export type PushpinSizeOption = "0.5x" | "0.75x" | "normal" | "1.25x" | "1.5x" | "default";

/**
 * @public
 */
export interface IGeoPointsConfig {
    minSize?: PushpinSizeOption;
    maxSize?: PushpinSizeOption;
    groupNearbyPoints?: boolean;
}

/**
 * @public
 */
export interface IGeoLegendConfig {
    /**
     * Indicates whether legend should be rendered or not.
     */
    enabled?: boolean;

    /**
     * Where, relative to the chart, should the legend appear.
     */
    position?: PositionType;

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
 * @public
 */
export interface IGeoConfig {
    center?: IGeoLngLat;
    isExportMode?: boolean;
    legend?: IGeoLegendConfig;
    limit?: number;
    selectedSegmentItems?: string[];
    tooltipText?: IAttribute;
    zoom?: number; // in the 0-22 zoom range
    /**
     * Mapbox access token.
     *
     * @remarks
     * Kept for backward compatibility with the legacy Mapbox-based implementation.
     * The MapLibre-based geo charts ignore this value.
     *
     * @deprecated Kept only for backward compatibility. Not used by MapLibre-based geo charts.
     */
    mapboxToken?: string;
    separators?: ISeparators;
    viewport?: IGeoConfigViewport;
    points?: IGeoPointsConfig;
    colors?: string[];
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
    showLabels?: boolean;
    cooperativeGestures?: boolean;
    enableExecutionCancelling?: boolean;
    respectLegendPosition?: boolean;
}

/**
 * Legacy GeoPushpinChart base props (Mapbox-based implementation).
 *
 * @deprecated Use {@link IGeoPushpinChartProps} exported from `@gooddata/sdk-ui-geo` (MapLibre-based).
 * @public
 */
export interface ILegacyGeoPushpinChartBaseProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Analytical backend, from which the chart will obtain data to visualize
     *
     * @remarks
     * If you do not specify instance of analytical backend using this prop, then you MUST have
     * BackendProvider up in the component tree.
     */
    backend?: IAnalyticalBackend;

    /**
     * Identifier of analytical workspace, from which the chart will obtain data to visualize.
     *
     * @remarks
     * If you do not specify workspace identifier, then you MUST have WorkspaceProvider up in the
     * component tree.
     */
    workspace?: string;

    size?: AttributeMeasureOrPlaceholder;
    color?: AttributeMeasureOrPlaceholder;
    segmentBy?: AttributeOrPlaceholder;

    filters?: NullableFiltersOrPlaceholders;
    sortBy?: SortsOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;

    config?: IGeoConfig;

    /**
     * Execution configuration, will provide the execution with necessary config before initiating execution.
     */
    execConfig?: IExecutionConfig;

    /**
     * Specify function to call back when center position of the map changes.
     */
    onCenterPositionChanged?: CenterPositionChangedCallback;

    /**
     * Specify function to call back when map zoom changes.
     */
    onZoomChanged?: ZoomChangedCallback;
}

/**
 * Legacy GeoPushpinChart props for the (legacy) single-attribute mode.
 *
 * @deprecated Use {@link IGeoPushpinChartProps} exported from `@gooddata/sdk-ui-geo` (MapLibre-based).
 * @public
 */
export interface ILegacyGeoPushpinChartProps extends ILegacyGeoPushpinChartBaseProps {
    /**
     * The attribute definition or placeholder that determines the longitude and latitude of the pins.
     * Values expected in format lat;long.
     */
    location: AttributeOrPlaceholder;
}

/**
 * Legacy GeoPushpinChart props for the latitude/longitude mode.
 *
 * @deprecated Use {@link IGeoPushpinChartProps} exported from `@gooddata/sdk-ui-geo` (MapLibre-based).
 * @public
 */
export interface ILegacyGeoPushpinChartLatitudeLongitudeProps extends ILegacyGeoPushpinChartBaseProps {
    /**
     * The attribute definition or placeholder that determines the latitude of the pins.
     * Values expected in string format representing coordinate.
     */
    latitude: AttributeOrPlaceholder;
    /**
     * The attribute definition or placeholder that determines the longitude of the pins.
     * Values expected in string format representing coordinate.
     */
    longitude: AttributeOrPlaceholder;
}

/**
 * @internal
 */
export type GeoPushpinChartPropsUnion =
    | ILegacyGeoPushpinChartProps
    | ILegacyGeoPushpinChartLatitudeLongitudeProps;

/**
 * @internal
 */
export function isGeoPushpinChartProps(
    props: GeoPushpinChartPropsUnion,
): props is ILegacyGeoPushpinChartProps {
    return (props as ILegacyGeoPushpinChartProps).location !== undefined;
}

/**
 * @internal
 */
export function isGeoPushpinChartLatitudeLongitudeProps(
    props: GeoPushpinChartPropsUnion,
): props is ILegacyGeoPushpinChartLatitudeLongitudeProps {
    const latitudeLongitudeProps = props as ILegacyGeoPushpinChartLatitudeLongitudeProps;
    return latitudeLongitudeProps.latitude !== undefined && latitudeLongitudeProps.longitude !== undefined;
}

/**
 * @public
 */
export interface IGeoDrillEvent extends IDrillEventContext {
    /**
     * Color value of the drilled pin
     */
    color?: number;
    /**
     * Location of the drilled pin
     */
    location?: IGeoLngLat;
    /**
     * Location name of the drilled pin
     */
    locationName?: string;
    /**
     * SegmentBy of the drilled pin
     */
    segmentBy?: string;
    /**
     * Size value of the drilled pin
     */
    size?: number;
}
