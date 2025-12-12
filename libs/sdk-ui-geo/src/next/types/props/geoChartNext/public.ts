// (C) 2025 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IExecutionConfig, type ITheme } from "@gooddata/sdk-model";
import { type IVisualizationCallbacks, type IVisualizationProps } from "@gooddata/sdk-ui";

import { type CenterPositionChangedCallback, type ZoomChangedCallback } from "../../common/callbacks.js";
import { type IGeoChartNextConfig } from "../../config/unified.js";
import { type GeoLayerType, type IGeoLayer } from "../../layers/index.js";

/**
 * Props for {@link GeoChartNext}.
 *
 * @alpha
 */
export interface IGeoChartNextProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Visualization type reported through pushData callbacks. Defaults to the primary layer type.
     */
    type?: GeoLayerType;

    /**
     * Backend used for data execution. Falls back to BackendProvider when omitted.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace identifier. Falls back to WorkspaceProvider when omitted.
     */
    workspace?: string;

    /**
     * Array of layer definitions rendered in order. The first layer drives legends and drilling.
     */
    layers: IGeoLayer[];

    /**
     * Theme override. Defaults to the nearest ThemeProvider.
     */
    theme?: ITheme;

    /**
     * Unified configuration shared by all layers.
     */
    config?: IGeoChartNextConfig;

    /**
     * Additional execution configuration forwarded to backend.
     */
    execConfig?: IExecutionConfig;

    /**
     * Callback fired when the map center changes.
     */
    onCenterPositionChanged?: CenterPositionChangedCallback;

    /**
     * Callback fired when map zoom changes.
     */
    onZoomChanged?: ZoomChangedCallback;
}
