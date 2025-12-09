// (C) 2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    IAttribute,
    IAttributeOrMeasure,
    IExecutionConfig,
    INullableFilter,
    ISortItem,
    ITheme,
} from "@gooddata/sdk-model";
import { IVisualizationCallbacks, IVisualizationProps } from "@gooddata/sdk-ui";

import { CenterPositionChangedCallback, ZoomChangedCallback } from "../../common/callbacks.js";
import { IGeoPushpinChartNextConfig } from "../../config/pushpinChart.js";
import { IGeoLayer } from "../../layers/index.js";

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
