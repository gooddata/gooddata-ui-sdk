// (C) 2020-2025 GoodData Corporation
import type mapboxgl from "mapbox-gl";
import { IAttribute, IColorPalette, IExecutionConfig } from "@gooddata/sdk-model";
import {
    AttributeOrPlaceholder,
    IDrillEventContext,
    ISeparators,
    IVisualizationCallbacks,
    IVisualizationProps,
    AttributeMeasureOrPlaceholder,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
} from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IColorMapping, PositionType } from "@gooddata/sdk-ui-vis-commons";

export interface IGeoLngLatBounds {
    northEast: IGeoLngLat;
    southWest: IGeoLngLat;
}

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
export interface IGeoLngLat {
    lat: number;
    lng: number;
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
    mapboxToken: string;
    separators?: ISeparators;
    viewport?: IGeoConfigViewport;
    points?: IGeoPointsConfig;
    colors?: string[];
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
    showLabels?: boolean;
    cooperativeGestures?: boolean;
    enableExecutionCancelling?: boolean;
}

/**
 * @public
 */
export type CenterPositionChangedCallback = (center: IGeoLngLat) => void;

/**
 * @public
 */
export type ZoomChangedCallback = (zoom: number) => void;

/**
 * @public
 */
export interface IGeoPushpinChartBaseProps extends IVisualizationProps, IVisualizationCallbacks {
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
 * @public
 */
export interface IGeoPushpinChartProps extends IGeoPushpinChartBaseProps {
    /**
     * The attribute definition or placeholder that determines the longitude and latitude of the pins.
     * Values expected in format lat;long.
     */
    location: AttributeOrPlaceholder;
}

/**
 * @public
 */
export interface IGeoPushpinChartLatitudeLongitudeProps extends IGeoPushpinChartBaseProps {
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
export type GeoPushpinChartPropsUnion = IGeoPushpinChartProps | IGeoPushpinChartLatitudeLongitudeProps;

/**
 * @internal
 */
export function isGeoPushpinChartProps(props: GeoPushpinChartPropsUnion): props is IGeoPushpinChartProps {
    return (props as IGeoPushpinChartProps).location !== undefined;
}

/**
 * @internal
 */
export function isGeoPushpinChartLatitudeLongitudeProps(
    props: GeoPushpinChartPropsUnion,
): props is IGeoPushpinChartLatitudeLongitudeProps {
    const latitudeLongitudeProps = props as IGeoPushpinChartLatitudeLongitudeProps;
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
