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

import { IGeoAreaChartConfig } from "./areaConfig.js";
import { CenterPositionChangedCallback, ZoomChangedCallback } from "./shared.js";

/**
 * Base props for GeoAreaChart (without required area)
 *
 * @alpha
 */
export interface IGeoAreaChartBaseProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Backend to execute against
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to execute in
     */
    workspace?: string;

    /**
     * Measure that determines the color fill of the geographic areas
     */
    color?: IAttributeOrMeasure;

    /**
     * Specifies how to segment data
     */
    segmentBy?: IAttribute;

    /**
     * Specifies filters to apply to the data
     */
    filters?: INullableFilter[];

    /**
     * Specifies how to sort the data
     */
    sortBy?: ISortItem[];

    /**
     * Specifies the theme to use for the chart
     */
    theme?: ITheme;

    /**
     * Area-specific configuration
     */
    config?: IGeoAreaChartConfig;

    /**
     * Execution configuration
     */
    execConfig?: IExecutionConfig;

    /**
     * Called when map center position changes
     */
    onCenterPositionChanged?: CenterPositionChangedCallback;

    /**
     * Called when map zoom changes
     */
    onZoomChanged?: ZoomChangedCallback;
}

/**
 * Props for GeoAreaChart with area attribute
 *
 * @alpha
 */
export interface IGeoAreaChartProps extends IGeoAreaChartBaseProps {
    /**
     * Geographic area attribute (regions, countries, states)
     */
    area: IAttribute;
}
