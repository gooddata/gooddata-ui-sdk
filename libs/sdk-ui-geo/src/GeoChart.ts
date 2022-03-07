// (C) 2020-2022 GoodData Corporation
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
     * Turns on responsive behavior. Legend items will be rendered horizontally on
     * screens smaller than 767px.
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
export interface IGeoPushpinChartProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Analytical backend, from which the chart will obtain data to visualize
     *
     * If you do not specify instance of analytical backend using this prop, then you MUST have
     * BackendProvider up in the component tree.
     */
    backend?: IAnalyticalBackend;

    /**
     * Identifier of analytical workspace, from which the chart will obtain data to visualize.
     *
     * If you do not specify workspace identifier, then you MUST have WorkspaceProvider up in the
     * component tree.
     */
    workspace?: string;

    location: AttributeOrPlaceholder;
    size?: AttributeMeasureOrPlaceholder;
    color?: AttributeMeasureOrPlaceholder;
    segmentBy?: AttributeOrPlaceholder;

    filters?: NullableFiltersOrPlaceholders;
    sortBy?: SortsOrPlaceholders;

    /**
     * Optional resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;

    config?: IGeoConfig;

    /**
     * Execution configuration, will provide the execution with necessary config before initiating execution.
     */
    execConfig?: IExecutionConfig;

    /**
     * Optionally specify function to call back when center position of the map changes.
     */
    onCenterPositionChanged?: CenterPositionChangedCallback;

    /**
     * Optionally specify function to call back when map zoom changes.
     */
    onZoomChanged?: ZoomChangedCallback;
}

/**
 * @public
 */
export interface IGeoDrillEvent extends IDrillEventContext {
    color?: number; // geo chart: color value of the drilled pin
    location?: IGeoLngLat; // geo chart: location of the drilled pin
    locationName?: string; // geo chart: location name of the drilled pin
    segmentBy?: string; // geo chart: segmentBy of the drilled pin
    size?: number; // geo chart: size value of the drilled pin
}
