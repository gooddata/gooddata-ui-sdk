// (C) 2025 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IAttributeOrMeasure,
    type IExecutionConfig,
    type INullableFilter,
    type ISortItem,
    type ITheme,
} from "@gooddata/sdk-model";
import { type IVisualizationCallbacks, type IVisualizationProps } from "@gooddata/sdk-ui";

import { type CenterPositionChangedCallback, type ZoomChangedCallback } from "../../common/callbacks.js";
import { type IGeoPushpinChartNextConfig } from "../../config/pushpinChart.js";
import { type IGeoLayer } from "../../layers/index.js";

/**
 * Shared props for {@link GeoPushpinChartNext} before latitude/longitude are applied.
 *
 * @alpha
 */
export interface IGeoPushpinChartNextBaseProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Backend used for data execution. Falls back to BackendProvider.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace identifier. Falls back to WorkspaceProvider.
     */
    workspace?: string;

    /**
     * Optional segment attribute that drives category legend items.
     */
    segmentBy?: IAttribute;

    /**
     * Measure or attribute used for size encoding.
     */
    size?: IAttributeOrMeasure;

    /**
     * Measure or attribute used for color encoding.
     */
    color?: IAttributeOrMeasure;

    /**
     * Filters applied to every layer execution.
     */
    filters?: INullableFilter[];

    /**
     * Sorting applied to the execution definition.
     */
    sortBy?: ISortItem[];

    /**
     * Theme override. Defaults to ThemeProvider.
     */
    theme?: ITheme;

    /**
     * Configuration specific to pushpin layers.
     */
    config?: IGeoPushpinChartNextConfig;

    /**
     * Additional execution configuration forwarded to backend.
     */
    execConfig?: IExecutionConfig;

    /**
     * Callback fired when map center changes.
     */
    onCenterPositionChanged?: CenterPositionChangedCallback;

    /**
     * Callback fired when zoom level changes.
     */
    onZoomChanged?: ZoomChangedCallback;

    /**
     * Layers rendered after the primary pushpin layer (e.g., additional overlays).
     */
    additionalLayers?: IGeoLayer[];
}

/**
 * Props for {@link GeoPushpinChartNext}. Latitude and longitude are required.
 *
 * @alpha
 */
export interface IGeoPushpinChartNextProps extends IGeoPushpinChartNextBaseProps {
    /**
     * Attribute containing latitude values in decimal degrees.
     */
    latitude: IAttribute;

    /**
     * Attribute containing longitude values in decimal degrees.
     */
    longitude: IAttribute;
}
